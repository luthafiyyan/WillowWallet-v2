# Detailed Security Findings: WillowWallet v2

This document provides technical reproduction traces, security invariants, bounded execution instructions, and code-level remediation diffs for all confirmed vulnerabilities identified during the security audit.

---

## 1. Finding: Arbitrary JavaScript Execution via Function Constructor on Firebase Config Input

- **Fingerprint**: `willow-login-new-function-eval`
- **Severity**: HIGH (Likelihood: Medium, Impact: High)
- **CWE**: CWE-94 (Improper Control of Generation of Code / Code Injection)
- **Primary Source File**: `src/pages/Login.tsx`

### 1.1 Repository-Relative Trace & Evidence
1. **Entrypoint**: `src/pages/Login.tsx:110` in scope `handleSaveConfig`
   The user enters arbitrary text in the custom Firebase configuration modal textarea and clicks submit.
2. **Propagation**: `src/pages/Login.tsx:114` in scope `handleSaveConfig`
   The string is trimmed and stripped of initial variable keywords (`const`, `let`, `var`, `export default`), leaving function calls, object getters, or arbitrary expressions intact.
3. **Sink**: `src/pages/Login.tsx:121` in scope `handleSaveConfig`
   When `JSON.parse` fails, the application calls:
   ```typescript
   const fn = new Function(`return ${cleaned};`);
   parsed = fn();
   ```

### 1.2 Principals & Resources
- **Dummy Attacker**: External actor crafting a malicious configuration string and distributing it to victims under the guise of an API setup guide.
- **Affected Resource**: Browser `window` context, `localStorage` (`WILLOW_FIREBASE_CONFIG`, `WILLOW_SANDBOX_USER`), and active Firebase Auth tokens.

### 1.3 Target-Neutral Local Reproduction
1. Open the application in a local test browser at `http://localhost:5173/`.
2. On the login screen, click the **Konfigurasi Firebase** button in the lower section.
3. Paste the following test payload into the textarea:
   ```javascript
   {
     apiKey: "AIzaFakeKey",
     databaseURL: "https://fake-rtdb.firebaseio.com",
     exploit: (function(){
       console.warn("SECURITY INVARIANT VIOLATED: Code execution in application origin!");
       return "active";
     })()
   }
   ```
4. Click **Simpan & Terapkan**.
5. Observe the browser developer console.

### 1.4 Observed Output & Security Invariant Proved
- **Observed Result**: The console logs the warning message immediately upon clicking the button, demonstrating arbitrary JavaScript evaluation within the page origin.
- **Security Invariant Proved**: The application must treat all user-supplied configuration input strictly as data, never evaluating input as executable JavaScript.

### 1.5 Source Remediation & Code Diff
Replace the dynamic evaluation fallback with strict `JSON.parse` error handling.

```diff
--- a/src/pages/Login.tsx
+++ b/src/pages/Login.tsx
@@ -118,8 +118,8 @@ export const Login: React.FC<LoginProps> = ({ onLoginSuccess, currentLang = 'ID'
       try {
         parsed = JSON.parse(cleaned);
       } catch {
-        const fn = new Function(`return ${cleaned};`);
-        parsed = fn();
+        setConfigError('Format tidak valid. Pastikan JSON Firebase config benar.');
+        return;
       }
 
       if (parsed && parsed.apiKey && parsed.databaseURL) {
```

---

## 2. Finding: Prototype Pollution in Sandbox Database Path Traversal

- **Fingerprint**: `willow-sandbox-prototype-pollution`
- **Severity**: MEDIUM (Likelihood: Low, Impact: Medium)
- **CWE**: CWE-1321 (Improperly Controlled Modification of Object Prototype Attributes)
- **Primary Source File**: `src/firebase/config.ts`

### 2.1 Repository-Relative Trace & Evidence
1. **Entrypoint**: `src/firebase/config.ts:101` in scope `SandboxDatabase.setValueAtPath`
   A path string (e.g. `users/dummy/__proto__/polluted`) and a value are provided to the sandbox database.
2. **Propagation**: `src/firebase/config.ts:106` in scope `SandboxDatabase.setValueAtPath`
   `path.split('/').filter(p => p)` produces array `['users', 'dummy', '__proto__', 'polluted']`. The loop traverses each property on the current object without checking for reserved prototype names.
3. **Sink**: `src/firebase/config.ts:113` in scope `SandboxDatabase.setValueAtPath`
   When `parts[i]` is `'__proto__'`, `current` resolves to `Object.prototype`. The final assignment sets `Object.prototype.polluted = val`.

### 2.2 Principals & Resources
- **Dummy Attacker**: Untrusted data source (crafted JSON backup file or malicious client query).
- **Affected Resource**: Global JavaScript runtime `Object.prototype` in the browser tab.

### 2.3 Target-Neutral Local Reproduction
1. In the browser developer console on `http://localhost:5173/`, verify that `({}).polluted === undefined`.
2. In the console, execute:
   ```javascript
   const db = JSON.parse(localStorage.getItem('WILLOW_SANDBOX_DB') || '{}');
   // Simulating SandboxDatabase path traversal:
   const path = "users/dummy/__proto__/polluted";
   const parts = path.split('/').filter(Boolean);
   let current = db;
   for (let i = 0; i < parts.length - 1; i++) {
     if (!current[parts[i]]) current[parts[i]] = {};
     current = current[parts[i]];
   }
   current[parts[parts.length - 1]] = "vulnerable";
   ```
3. Evaluate `({}).polluted` in the console.

### 2.4 Observed Output & Security Invariant Proved
- **Observed Result**: `({}).polluted` evaluates to `"vulnerable"`. Plain objects across the application inherit the property.
- **Security Invariant Proved**: Database path traversal must never navigate onto `Object.prototype`, `Function.prototype`, or prototype constructor properties.

### 2.5 Source Remediation & Code Diff
Filter forbidden prototype identifiers before traversing paths.

```diff
--- a/src/firebase/config.ts
+++ b/src/firebase/config.ts
@@ -101,7 +101,8 @@ class SandboxDatabase {
   setValueAtPath(path: string, val: any) {
     const data = this.getRawData();
-    const parts = path.split('/').filter(p => p);
+    const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
+    const parts = path.split('/').filter(p => Boolean(p) && !FORBIDDEN_KEYS.has(p));
     let current = data;
     for (let i = 0; i < parts.length - 1; i++) {
       const part = parts[i];
@@ -121,7 +122,8 @@ class SandboxDatabase {
   updateValueAtPath(path: string, updates: any) {
     const data = this.getRawData();
-    const parts = path.split('/').filter(p => p);
+    const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
+    const parts = path.split('/').filter(p => Boolean(p) && !FORBIDDEN_KEYS.has(p));
     let current = data;
     for (let i = 0; i < parts.length - 1; i++) {
       const part = parts[i];
```

---

## 3. Finding: CSV Formula Injection via Unsanitized Transaction Description Field

- **Fingerprint**: `willow-export-csv-formula-injection`
- **Severity**: LOW (Likelihood: Low, Impact: Low)
- **CWE**: CWE-1236 (Improper Neutralization of Formula Elements in a CSV File)
- **Primary Source Files**: `src/pages/Home.tsx` and `src/pages/Profile.tsx`

### 3.1 Repository-Relative Trace & Evidence
1. **Entrypoint**: `src/pages/Home.tsx:165` in scope `handleExportCSV`
   Transaction `item.description` is retrieved from state:
   ```typescript
   item.description.replace(/"/g, '""')
   ```
2. **Propagation**: `src/pages/Home.tsx:170` in scope `handleExportCSV`
   Rows are joined with `r.map(cell => `"${cell}"`).join(',')`.
3. **Sink**: `src/pages/Home.tsx:174-177` in scope `handleExportCSV`
   An anchor element downloads the CSV file with MIME type `data:text/csv`.

### 3.2 Principals & Resources
- **Dummy Attacker**: User creating an expense with a description like `=1+1` or an imported transaction file.
- **Affected Resource**: External spreadsheet applications (Excel, LibreOffice Calc, Numbers).

### 3.3 Target-Neutral Local Reproduction
1. Create a transaction with amount `10000`, category `Makanan & Minuman`, and description `=2+5`.
2. Click **Export CSV** in either the Home screen or Profile screen.
3. Open the downloaded CSV file in Microsoft Excel or LibreOffice Calc.

### 3.4 Observed Output & Security Invariant Proved
- **Observed Result**: The spreadsheet displays `7` in the description column instead of literal `=2+5`.
- **Security Invariant Proved**: Text fields exported to CSV files must neutralize formula operators to prevent automated expression execution by external spreadsheet parsers.

### 3.5 Source Remediation & Code Diff
Sanitize cell values by prefixing with `'` if the cell begins with formula characters.

```diff
--- a/src/pages/Home.tsx
+++ b/src/pages/Home.tsx
@@ -158,13 +158,19 @@ export const Home: React.FC<HomeProps> = ({
     const headers = ['ID', 'Type', 'Category', 'Amount', 'Date', 'Description', 'CreatedAt'];
+    const sanitizeCell = (val: any) => {
+      const s = String(val ?? '');
+      if (/^[=\+\-@\t\r]/.test(s)) {
+        return "'" + s.replace(/"/g, '""');
+      }
+      return s.replace(/"/g, '""');
+    };
     const rows = transactions.map(item => [
-      item.id,
-      item.type,
-      item.category,
-      item.amount,
-      item.date,
-      item.description.replace(/"/g, '""'),
-      new Date(item.createdAt).toISOString()
+      sanitizeCell(item.id),
+      sanitizeCell(item.type),
+      sanitizeCell(item.category),
+      sanitizeCell(item.amount),
+      sanitizeCell(item.date),
+      sanitizeCell(item.description),
+      sanitizeCell(new Date(item.createdAt).toISOString())
     ]);
```
*(Apply equivalent helper to `src/pages/Profile.tsx`)*.
