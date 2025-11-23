# CivicServe Smoke Test Report

**Date:** 2025-11-23  
**Environment:** Local development (Windows, Node.js, Next.js 16, Express + MongoDB)  
**Test Runner:** `scripts/smoke_node.js`

## Executive Summary

The smoke test suite successfully validated that both the frontend and backend servers are running and responding to HTTP requests. However, authentication-dependent flows (login, create request, admin actions) failed due to a database seeding issue.

| Component | Status | Details |
|-----------|--------|---------|
| **Backend Health** | ✅ PASS | Server responding on port 3001 |
| **Frontend Health** | ✅ PASS | Server responding on port 3000 |
| **Database Connection** | ✅ PASS | MongoDB connected (seeding detected existing profiles) |
| **User Registration/Login** | ❌ FAIL | Login returned 401; seeded credentials not matching |
| **Request Creation** | ❌ FAIL | Blocked due to auth failure |
| **Admin Operations** | ❌ FAIL | Blocked due to auth failure |
| **Chatbot** | ⏳ UNTESTED | Not yet exercised by smoke tests |

## Detailed Test Results

### 1. Heartbeat (Health Check)
**Endpoint:** `GET /health`  
**Status:** ✅ PASS (200)  
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T19:31:45.635Z"
}
```

### 2. Seed Defaults
**Endpoint:** `POST /api/auth/seed-defaults`  
**Status:** ✅ PASS (200)  
**Response:**
```json
{
  "message": "Profiles already exist, skipping seeding",
  "existingCount": 1
}
```
**Note:** The endpoint correctly detected that profiles already exist and skipped seeding. However, the existing profile count is only 1, suggesting a partial seed or previous manual creation.

### 3. User Login (user1@example.com)
**Endpoint:** `POST /api/auth/login`  
**Credentials:** `user1@example.com` / `Password123!`  
**Status:** ❌ FAIL (401)  
**Response:**
```json
{
  "error": "Invalid email or password"
}
```
**Issue:** The test attempted to login with `user1@example.com` using password `Password123!`, but the endpoint returned 401. This suggests:
- The seeded users (user1, user2, etc.) do not exist in the database.
- A different user or set of credentials exists instead (the "existingCount: 1" profile).

### 4. Create Request
**Endpoint:** `POST /api/requests`  
**Status:** ❌ FAIL (401)  
**Response:**
```json
{
  "error": "Missing or invalid authorization header"
}
```
**Cause:** User login failed in step 3, so no token was available. This is a cascading failure.

### 5. Admin Login (admin1@example.com)
**Endpoint:** `POST /api/auth/login`  
**Credentials:** `admin1@example.com` / `Password123!`  
**Status:** ❌ FAIL (401)  
**Response:**
```json
{
  "error": "Invalid email or password"
}
```
**Issue:** Same as user login — no admin user with this email/password exists in the database.

### 6. Admin Operations (Blocked)
Due to the admin login failure, the following tests were not executed:
- Set request status to `in_progress`
- Set request status to `completed`
- User rate request
- User request change
- Admin approve change

---

## Root Cause Analysis

The primary issue is a **database seeding mismatch**:

1. **Seeding Logic:** The `POST /api/auth/seed-defaults` endpoint (in `backend/src/routes/auth.ts`, line 403) checks if any profiles exist using `Profile.countDocuments({})`. If the count is > 0, it skips seeding and returns the existing count.

2. **Current State:** The database has 1 profile (reported by the seeding endpoint), but it is **not** the test fixtures (user1–user10, admin1–admin10) that the smoke test expects.

3. **Likely Cause:** The database persists data between test runs. A previous session created a single profile (perhaps manually or via signup), and the seeding logic prevents re-seeding due to this existing record.

---

## Recommendations

### Immediate Actions (to run tests successfully)

1. **Reset the Database:**
   - Clear all profiles from MongoDB before running the smoke test.
   - Options:
     - Connect to MongoDB directly and drop the `Profile` collection or entire database.
     - Create a `DELETE /api/auth/clear-all` (dev-only) endpoint to wipe test data.
     - Modify the seeding logic to force re-seed on a flag (e.g., `?force=true`).

2. **Example: Add a Force-Seed Endpoint**  
   Modify `backend/src/routes/auth.ts` to accept a `force` query parameter:
   ```typescript
   router.post('/seed-defaults', async (req: any, res: Response): Promise<void> => {
     const force = req.query.force === 'true';
     const existingCount = await Profile.countDocuments({});
     if (existingCount > 0 && !force) {
       return void res.status(200).json({ message: 'Profiles already exist, skipping seeding', existingCount });
     }
     // ... proceed with seeding
   });
   ```
   Then call: `POST /api/auth/seed-defaults?force=true` to force a reseed.

3. **Alternatively: Add a Clear Endpoint (dev-only)**
   ```typescript
   router.delete('/clear-all', async (req: any, res: Response): Promise<void> => {
     if (process.env.NODE_ENV === 'production') {
       return void res.status(403).json({ error: 'Not allowed in production' });
     }
     const result = await Profile.deleteMany({});
     res.status(200).json({ message: 'All profiles deleted', deletedCount: result.deletedCount });
   });
   ```

### Long-Term Improvements

1. **Test Database Isolation:**
   - Use a separate test database (e.g., `civic_serve_test`) instead of the development database.
   - Configure `MONGODB_URI` in `backend/.env` to point to the test DB when running tests.

2. **Automated Test Fixture Setup:**
   - Add a Jest/Mocha test suite with automated fixtures that set up and tear down test data.
   - Use database transactions or hooks to ensure a clean state before each test.

3. **Smoke Test Improvements:**
   - Update `scripts/smoke_node.js` to handle the reset/seeding flow gracefully.
   - Add a `--reset-db` flag to clear existing profiles before re-seeding.
   - Include chatbot conversation test and end-to-end flow validation.

4. **CI/CD Integration:**
   - Create a GitHub Actions workflow to:
     - Spin up a test MongoDB instance (e.g., using Docker).
     - Run the smoke tests in isolation.
     - Fail the build if any smoke tests fail.

---

## Test Artifacts

- **Smoke Test Log:** `scripts/smoke_node_output.json`
- **Smoke Test Script:** `scripts/smoke_node.js`

---

## Next Steps (Recommended Order)

1. **Immediately:** Clear the existing profile from the database or add a force-seed mechanism, then re-run the smoke tests.
2. **Short-term:** Implement the isolated test database setup to avoid manual clearing between test runs.
3. **Medium-term:** Add automated test fixtures and integrate into CI/CD.
4. **Long-term:** Expand the smoke test suite to include chatbot, rating, and change request flows.

---

Generated on: 2025-11-23  
Test Environment: Local development  
Status: **Servers up, Auth flows blocked due to DB seeding issue**
