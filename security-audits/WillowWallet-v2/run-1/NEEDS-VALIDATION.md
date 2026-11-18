# Unresolved Security Leads: Needs Validation

This document tracks source-grounded candidates whose decisive validation requires operational or cloud-side information outside the observation of repository source code.

---

## 1. Candidate: Unverified Multi-Tenant Security Rules for Firebase Realtime Database

- **Fingerprint**: `willow-firebase-rtdb-unverified-rules`
- **Affected Boundary**: Client Application -> Google Cloud Firebase Realtime Database
- **Subsystem**: `cloud-backend-storage`
- **Attack Class**: `broken-access-control`

### 1.1 Claimed Vulnerability Trace
1. **Entrypoint**: `src/firebase/config.ts:29` in scope `defaultConfig`
   The application commits a production Realtime Database endpoint:
   `https://willowwallet-65699-default-rtdb.firebaseio.com`.
2. **Propagation**: `src/services/db.ts:19` in scope `subscribeToTransactions`
   Client database listeners and writes query paths formatted as `users/${uid}/...`.
3. **Sink**: Remote Firebase Realtime Database Backend (Unobserved in Git)
   Data persistence and tenant isolation are enforced exclusively by cloud security rules configured in the Firebase project console.

### 1.2 Exact Blocker
The repository does not contain a `database.rules.json` file, `firebase.json` file, or automated rule deployment scripts. The server-side security rules governing `willowwallet-65699-default-rtdb.firebaseio.com` reside entirely within Google Cloud infrastructure and cannot be determined or audited from repository source code alone.

If the remote database was deployed with default test rules (`.read: true, .write: true`) or without user isolation, any user with the public API key can read and overwrite all financial records in the database.

### 1.3 Resolution Plans

#### Bounded Local Simulation Plan
1. Install Firebase CLI locally: `npm install -D firebase-tools`.
2. Initialize Firebase Emulator:
   ```json
   {
     "database": {
       "rules": "database.rules.json"
     }
   }
   ```
3. Create a recommended `database.rules.json` in the project root:
   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "auth != null && auth.uid === $uid",
           ".write": "auth != null && auth.uid === $uid"
         }
       }
     }
   }
   ```
4. Run `firebase emulators:start --only database` and run integration tests to verify that cross-user read/write requests are denied.

#### Safe Owner-Observed Deployment Check
1. The project administrator opens the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to project **willowwallet-65699** -> **Build** -> **Realtime Database** -> **Rules**.
3. Inspect the active security rules:
   - **Compliant Rule Configuration**:
     Rules must explicitly restrict read and write access to authenticated sessions matching the respective path `$uid`:
     ```json
     {
       "rules": {
         "users": {
           "$uid": {
             ".read": "auth != null && auth.uid === $uid",
             ".write": "auth != null && auth.uid === $uid"
           }
         }
       }
     }
     ```
   - **Vulnerable Configurations**:
     If rules contain `".read": true, ".write": true` or lack the `auth.uid === $uid` check, the database is publicly exposed or allows inter-user tampering.
4. Export the verified `database.rules.json` file and commit it directly to this git repository so future security audits can verify rules locally.
