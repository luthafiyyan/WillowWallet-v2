# Security Audit Report: WillowWallet v2

## 1. Executive Summary & Security Posture
WillowWallet v2 underwent a source-grounded security audit following the Cloudflare open-source security audit framework (`cloudflare/security-audit-skill`).

- **Target**: WillowWallet v2 (`src/` and `public/` at commit `4b3ad36`)
- **Audit Profile**: `standard`
- **Execution Policy**: `sandboxed-source-and-local-only`
- **Overall Security Posture**: Medium Risk
  - Identified **1 High Severity** vulnerability involving arbitrary client-side code execution via the `new Function` constructor when parsing custom Firebase configurations.
  - Identified **1 Medium Severity** vulnerability involving prototype pollution in the local sandbox database engine.
  - Identified **1 Low Severity** vulnerability involving CSV formula injection in transaction export files.
  - Identified **1 Lead Requiring Validation** regarding server-side Firebase Realtime Database rules that cannot be verified solely from client-side source code.
  - Confirmed robust security controls in Progressive Web App (PWA) cache handling, which explicitly isolates sensitive cloud database streams from public browser cache storage.

---

## 2. Confirmed Findings Table

| Severity | Fingerprint | Title | Affected Boundary | Observed Result |
| :--- | :--- | :--- | :--- | :--- |
| **HIGH** | `willow-login-new-function-eval` | Arbitrary JavaScript Execution via Function Constructor on Firebase Config Input | Untrusted User Input -> Client Execution | Code executes in browser window origin via `new Function(...)` fallback |
| **MEDIUM** | `willow-sandbox-prototype-pollution` | Prototype Pollution in Sandbox Database Path Traversal | Untrusted Database Key -> Object Prototype | `Object.prototype` polluted when write path includes `__proto__` |
| **LOW** | `willow-export-csv-formula-injection` | CSV Formula Injection via Unsanitized Transaction Description Field | App Data -> External Spreadsheet Software | Formulas (`=`, `@`, `+`, `-`) in descriptions evaluate upon opening in Excel/Calc |

---

## 3. Confirmed Vulnerability Details & Remediations

### 3.1 [HIGH] Arbitrary JavaScript Execution via Function Constructor on Firebase Config Input
- **Repository Location**: [Login.tsx](file:///c:/Users/Laboran/Documents/Github%20Ku/WillowWallet-v2-main/WillowWallet-v2-main/src/pages/Login.tsx#L110-L124)
- **Vulnerability Fingerprint**: `willow-login-new-function-eval`
- **Lower-Trust Principal**: Guest or Authenticated User pasting custom Firebase config into modal.
- **Root Cause**:
  In `src/pages/Login.tsx`, the `handleSaveConfig` function attempts to parse the user-supplied string with `JSON.parse`. When that throws an error, it falls back to:
  ```typescript
  const fn = new Function(`return ${cleaned};`);
  parsed = fn();
  ```
  This dynamic evaluation executes unconstrained JavaScript within the user origin context.
- **Impact**: Full Client-Side Code Execution (XSS). An attacker can trick a user into importing a malicious configuration snippet that steals localStorage items, hijacks Firebase session tokens, or redirects the user.
- **Remediation**:
  Remove the `new Function` eval fallback. Only accept standard JSON syntax parsed strictly via `JSON.parse`.

### 3.2 [MEDIUM] Prototype Pollution in Sandbox Database Path Traversal
- **Repository Location**: [config.ts](file:///c:/Users/Laboran/Documents/Github%20Ku/WillowWallet-v2-main/WillowWallet-v2-main/src/firebase/config.ts#L101-L142)
- **Vulnerability Fingerprint**: `willow-sandbox-prototype-pollution`
- **Lower-Trust Principal**: User or untrusted backup JSON triggering local database write paths.
- **Root Cause**:
  `SandboxDatabase.setValueAtPath` and `updateValueAtPath` split slash-delimited paths and iterate across properties without blocking reserved property names (`__proto__`, `constructor`, `prototype`). Writing to `users/dummy/__proto__/isAdmin` mutates `Object.prototype`.
- **Impact**: Prototype pollution across all objects in the runtime JavaScript heap, leading to logic bypass or denial of service.
- **Remediation**:
  Filter path segments against a forbidden set containing `__proto__`, `constructor`, and `prototype`.

### 3.3 [LOW] CSV Formula Injection via Unsanitized Transaction Description Field
- **Repository Location**: [Home.tsx](file:///c:/Users/Laboran/Documents/Github%20Ku/WillowWallet-v2-main/WillowWallet-v2-main/src/pages/Home.tsx#L156-L179) and [Profile.tsx](file:///c:/Users/Laboran/Documents/Github%20Ku/WillowWallet-v2-main/WillowWallet-v2-main/src/pages/Profile.tsx#L136-L159)
- **Vulnerability Fingerprint**: `willow-export-csv-formula-injection`
- **Lower-Trust Principal**: Any user creating a transaction or sharing a backup with crafted descriptions.
- **Root Cause**:
  CSV generator wraps cell contents in double quotes `"${cell}"` without checking if the first character is a formula operator (`=`, `+`, `-`, `@`, `\t`, `\r`).
- **Impact**: Spreadsheet software (Microsoft Excel, LibreOffice Calc) treats the cell as a dynamic formula upon opening the downloaded CSV.
- **Remediation**:
  Prefix all string cells starting with `=+-@\t\r` with an apostrophe `'` before enclosing in double quotes.

---

## 4. Needs Validation Leads

| Fingerprint | Title | Trace Entry | Exact Blocker | Next Safe Action |
| :--- | :--- | :--- | :--- | :--- |
| `willow-firebase-rtdb-unverified-rules` | Unverified Multi-Tenant Security Rules for Firebase Realtime Database | `src/firebase/config.ts:29` -> `src/services/db.ts:19` | Cloud database security rules reside on Google cloud servers and are not committed to git | Project owner checks Firebase Console Rules tab to confirm `auth.uid === $uid` rules |

*See [NEEDS-VALIDATION.md](file:///c:/Users/Laboran/Documents/Github%20Ku/WillowWallet-v2-main/WillowWallet-v2-main/security-audits/WillowWallet-v2/run-1/NEEDS-VALIDATION.md) for full reproduction blueprints and safe owner inspection plans.*

---

## 5. Hardening Notes & Positive Security Patterns
1. **PWA Cache Protection**:
   In `public/sw.js`, lines 74-83 explicitly exclude real-time database queries (`firebaseio.com`), Google Auth endpoints (`googleapis.com`), and non-GET requests from service worker cache storage, preventing data leakage to unauthenticated devices.
2. **Missing Content Security Policy (CSP)**:
   `index.html` currently does not specify a Content-Security-Policy meta tag. Adding a restrictive CSP (`default-src 'self'; script-src 'self'; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com; img-src 'self' data: https://api.dicebear.com;`) would provide robust defense-in-depth against client-side injection.

---

## 6. Coverage Ledger Summary
- **Total Units Planned & Evaluated**: 6
- **Units in Candidate Status**: 4 (3 confirmed findings, 1 candidate requiring deployment validation)
- **Units in Covered Status**: 2 (Service worker caching, web security headers)
- **Units Blocked / Deferred / Out-of-Scope**: 0
- **Ledger & Findings Validation**: 100% compliant with Cloudflare validation scripts (`validate-findings.cjs` and `validate-coverage-ledger.cjs`).
