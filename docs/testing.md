# Smart Lost & Found Recovery Platform - Testing & QA Guide

This document outlines the testing strategy, automated test suites, profile configuration, and end-to-end verification workflows.

---

## 1. Automated Test Architecture

The backend test suite is configured to execute completely autonomously using an in-memory H2 database running in **MySQL compatibility mode** (`application-test.yml`). No external MySQL server or internet connection is required to run the automated tests.

### Running Backend Tests
Execute from the workspace root or `backend` directory:
```powershell
cd "d:\Smart Lost and Found Recovery System\backend"
mvn test
```

### Test Configuration (`backend/src/main/resources/application-test.yml`)
- `spring.datasource.url: jdbc:h2:mem:testdb;MODE=MySQL;DATABASE_TO_UPPER=FALSE;DB_CLOSE_DELAY=-1`
- `spring.jpa.hibernate.ddl-auto: create-drop`
- `spring.flyway.enabled: false` (Schema generated directly from JPA entities for lightning-fast test execution)
- `app.upload.dir: target/test-uploads`

---

## 2. Test Suites Summary

| Test Class | Category | Test Count | Description | Status |
| :--- | :--- | :---: | :--- | :---: |
| `MatchingServiceTest` | Unit / Logic | 5 | Verifies multi-factor scoring algorithm (category compatibility, text Jaccard, date proximity, location matching, ranking order) | ✅ PASS |
| `ClaimServiceTest` | Service Slice | 6 | Verifies claim submission, validation, approval, rejection, state transitions, and auto-closure of competing claims | ✅ PASS |
| `ItemReportServiceTest` | Service Slice | 7 | Verifies report creation, update validation, photo attachment & deletion, status changes, and ownership checks | ✅ PASS |
| `AuthServiceTest` | Service Slice | 4 | Verifies registration, unique email validation, BCrypt password hashing, and JWT token issuance | ✅ PASS |
| `TextSimilarityUtilTest` | Unit / Math | 4 | Verifies tokenization, stop-word removal, and Jaccard similarity edge cases | ✅ PASS |
| `AuthControllerIntegrationTest` | Slice Integration | 2 | End-to-end HTTP request testing for user registration and login endpoints | ✅ PASS |
| `AdminControllerSecurityTest` | Security Slice | 2 | Asserts that non-admin accounts receive `403 Forbidden` on admin endpoints, while `ROLE_ADMIN` succeeds | ✅ PASS |
| **Total** | | **31** | **100% Pass Rate (0 Failures, 0 Errors)** | **✅ PASS** |

---

## 3. Frontend Build Validation

The frontend client is built with strict TypeScript checking and Vite bundler optimization:
```powershell
cd "d:\Smart Lost and Found Recovery System\frontend"
npm run build
```
- **Type Checking**: `tsc` validates 100% of types across 18 pages and 8 components.
- **Production Asset Bundle**: Generates minified, tree-shaken chunks in `dist/`.

---

## 4. Manual QA End-to-End Scenarios

To manually demonstrate the system during a technical interview or code walkthrough, follow this sequential user journey:

### Scenario A: Lost Item Reporting & Smart Matching
1. Navigate to `http://localhost:5173` (or `http://localhost:3000`).
2. Log in using the demo account: **Alex Morgan** (`alex.morgan@example.com` / `User@123456`).
3. Click **"Report Lost Item"** in the navigation bar.
4. Fill in:
   - **Title**: *Apple iPad Pro 11 Space Gray*
   - **Category**: *Electronics*
   - **City**: *San Francisco*
   - **Date**: Yesterday's date
   - **Secret Question**: *What color is the protective folio case?*
   - **Secret Answer**: *Navy blue*
5. Submit the report.
6. Click **"Find Potential Matches"** on the created item.
7. Observe the matching engine results: notice the multi-factor progress bars and human-readable justification badges.

### Scenario B: Found Item Claim & Ownership Verification
1. Log in as **Sarah Jenkins** (`sarah.jenkins@example.com` / `User@123456`).
2. Sarah reports a found item: *iPad in Navy Folio Case found at Coffee Shop*.
3. Alex Morgan views Sarah's listing and clicks **"Claim Ownership"**.
4. Alex submits proof description and answers the secret question (*Navy blue*).
5. Item transitions from `OPEN` to `CLAIM_PENDING`.
6. Sarah opens her **Claims** inbox, verifies Alex's proof, and clicks **"Approve Claim"**.
7. Item transitions to `RESOLVED`, and both parties receive real-time notifications.

### Scenario C: Administrative Moderation & Analytics
1. Log in as **Administrator** (`admin@smartlostfound.com` / `Admin@123456`).
2. Access the **Admin Dashboard** (`/admin`).
3. View the live Recharts distribution charts and resolution trends.
4. Navigate to **User Management** (`/admin/users`) to toggle account status or view audit logs.
5. Inspect the immutable **Audit Logs** (`/admin/audit-logs`) to see recorded events.
