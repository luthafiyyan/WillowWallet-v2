# Architecture and Trust Boundary Summary: WillowWallet v2

## 1. Product Overview, Principals, and Authority
WillowWallet v2 is a client-side Progressive Web Application (PWA) designed for personal finance tracking, expense budgeting, and savings goal management.

- **Principals**:
  - Unauthenticated Visitor / Guest: Can access the login page, switch language, toggle theme, or operate in local sandbox mode.
  - Authenticated User: Identified via Google OAuth (Firebase Auth) or local mock profile in sandbox mode.
- **Normal Authority**:
  - Read and write personal financial transactions, category definitions, budget allocations, and savings goals scoped strictly to `users/${uid}`.
  - Export personal transaction history to CSV and JSON formats.
  - Restore backup states from imported JSON files.
  - Configure Firebase connection parameters via modal dialog.
- **Protected Resources**:
  - Personal ledger data (transaction amounts, categories, dates, descriptions).
  - Firebase API credentials, OAuth tokens, and session identifiers in browser storage.
  - Local database state in IndexedDB / localStorage.

## 2. Comparable Software Baseline
WillowWallet v2 shares architectural characteristics with self-hosted and client-side personal finance trackers such as Actual Budget (client-side SQLite/IndexedDB sync) and Firefly III client wrappers.
- **Accepted Trade-offs**: In client-side offline-first finance applications, client code handles data presentation, formula calculations, and local mock storage. However, offloading database security to server-side Firebase rules without repository-tracked rule specifications is a known architectural hazard in similar hobbyist or single-page Firebase architectures.

## 3. Technology Stack and Deployment Model
- **Core Framework**: React 19, TypeScript, Vite.
- **Styling**: Tailwind CSS, Lucide React icons.
- **Backend & Persistence**:
  - Cloud Mode: Firebase Realtime Database (`firebase/database`) and Firebase Authentication (`firebase/auth`).
  - Sandbox Mode: In-memory and `localStorage` mock store (`WILLOW_SANDBOX_DB`).
- **Offline & Distribution**: Service Worker (`public/sw.js`), Web App Manifest (`public/manifest.webmanifest`).
- **Build / Offline Limits**: All source code and static assets are compiled into static bundles. No proprietary backend server code or Cloud Functions are tracked in this repository.

## 4. Entry Surfaces and Source-to-Sink Paths
1. **Firebase Configuration Modal** (`src/pages/Login.tsx`):
   - Path: Modal textarea input -> `handleSaveConfig` -> `JSON.parse` fallback -> `new Function` eval -> `saveFirebaseConfig` -> `localStorage`.
2. **CSV Transaction Export** (`src/pages/Home.tsx`, `src/pages/Profile.tsx`):
   - Path: In-memory transactions -> `handleExportCSV` -> CSV row concatenation -> `data:text/csv` URI -> Browser file download.
3. **Backup Data Import** (`src/pages/Profile.tsx`, `src/services/db.ts`):
   - Path: User-supplied JSON file -> `FileReader.readAsText` -> `JSON.parse` -> `restoreFullBackup` -> `dbSet` / `SandboxDatabase.setValueAtPath`.
4. **Cloud Realtime Database API** (`src/services/db.ts`, `src/firebase/config.ts`):
   - Path: Client SDK calls (`onValue`, `dbSet`, `dbPush`) -> Google Firebase Realtime Database endpoint (`https://willowwallet-65699-default-rtdb.firebaseio.com`).
5. **PWA Service Worker** (`public/sw.js`):
   - Path: Browser fetch events -> Service worker cache matching -> Dynamic network response caching.
6. **Web Entrypoint Headers** (`index.html`):
   - Path: Initial browser document request -> HTML parsing and asset resolution.

## 5. Trust Boundaries and Primary Controls
- **Boundary 1: Untrusted User Input to Client Execution**:
  - Primary Control: Input sanitization and regex stripping before parsing. (Flawed: falls back to `new Function` constructor).
- **Boundary 2: In-App Data to External Spreadsheet Software**:
  - Primary Control: Wrapping cells with double quotes `"${cell}"`. (Flawed: does not neutralize formula triggers `=`, `+`, `-`, `@`).
- **Boundary 3: External Backup File to Object Prototype**:
  - Primary Control: `JSON.parse` syntax verification. (Flawed in SandboxDatabase: does not guard against `__proto__` path traversal).
- **Boundary 4: Client Application to Cloud Database API**:
  - Primary Control: Client-side path scoping `users/${uid}`. Server-side rule verification is unobserved in source control.
- **Boundary 5: Browser Cache to Offline Storage**:
  - Primary Control: Service worker fetch filter explicitly bypasses `firebaseio.com` and `googleapis.com` to prevent caching sensitive live API data.
- **Boundary 6: Browser Runtime to External Origins**:
  - Primary Control: Avatar requests query `api.dicebear.com`. Content-Security-Policy header or meta tag is currently absent.

## 6. Repository-Relative Starting Paths
- `src/pages/Login.tsx`
- `src/pages/Home.tsx`
- `src/pages/Profile.tsx`
- `src/firebase/config.ts`
- `src/services/db.ts`
- `src/services/pwa.ts`
- `public/sw.js`
- `index.html`

## 7. Coverage Ledger Consequences and Prior Gaps
- This audit run represents an initial comprehensive baseline (`run-1`).
- Six coverage units were created in `coverage-ledger.json`.
- Four units progressed to `candidate` with verified findings (3 confirmed vulnerabilities, 1 lead requiring deployment validation).
- Two units are fully `covered` with no exploitable vulnerability (Service Worker caching and Web Security Headers).
- Zero units were deferred or declared out of scope.

## 8. Companion Selection Summary
Derived from Cloudflare security-audit-skill companion matrices:
- `CLIENT-SIDE.md`: Selected for DOM manipulation, client-side dynamic evaluation, and browser storage handling.
- `WEB-PROTOCOL-AND-AUTH.md`: Selected for OAuth flow integration and token isolation.
- `DATA-ISOLATION-AND-LIFECYCLE.md`: Selected for backup restoration, object property traversal, and multi-tenant scoping.
