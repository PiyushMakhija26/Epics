# 🧪 API Testing Guide

Complete guide for testing all CivicServe API endpoints using curl, Postman, or Insomnia.

## 🚀 Prerequisites

- Backend running on `http://localhost:3001`
- Valid JWT token (obtain by logging in)
- Postman, Insomnia, or curl installed

## 📍 Base URL

```
http://localhost:3001/api
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Testing Scenarios

### Scenario 1: Password Reset Flow

#### Step 1: Request Password Reset
**Endpoint:** `POST /auth/password-reset/request`

**No Auth Required**

**curl:**
```bash
curl -X POST http://localhost:3001/api/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**Expected Response (200):**
```json
{
  "message": "If email exists, reset link will be sent"
}
```

**Check email for reset link!**

#### Step 2: Verify Token and Reset Password
**Endpoint:** `POST /auth/password-reset/verify`

**No Auth Required**

**curl:**
```bash
curl -X POST http://localhost:3001/api/auth/password-reset/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token":"THE_TOKEN_FROM_EMAIL",
    "newPassword":"NewSecurePassword123!"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Password reset successful"
}
```

---

### Scenario 2: Rate Completed Work

#### Submit Rating
**Endpoint:** `POST /auth/ratings`

**Requires Auth**

**curl:**
```bash
curl -X POST http://localhost:3001/api/auth/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "request_id":"550e8400-e29b-41d4-a716-446655440000",
    "rating":"excellent",
    "comments":"Great work! The team was professional and efficient."
  }'
```

**Available Ratings:**
- `excellent` - Perfect work
- `good` - Satisfactory work
- `open_again` - Request work to be redone

**Expected Response (201):**
```json
{
  "id":"uuid",
  "request_id":"550e8400-e29b-41d4-a716-446655440000",
  "user_id":"user-uuid",
  "rating":"excellent",
  "comments":"Great work! The team was professional and efficient.",
  "created_at":"2024-11-17T10:30:00Z"
}
```

#### Get All Ratings for a Request
**Endpoint:** `GET /auth/ratings/:requestId`

**Requires Auth**

**curl:**
```bash
curl -X GET http://localhost:3001/api/auth/ratings/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200):**
```json
[
  {
    "id":"uuid1",
    "request_id":"550e8400-e29b-41d4-a716-446655440000",
    "rating":"excellent",
    "comments":"Great work!"
  },
  {
    "id":"uuid2",
    "request_id":"550e8400-e29b-41d4-a716-446655440000",
    "rating":"good",
    "comments":"Good but had some delays"
  }
]
```

---

### Scenario 3: Update Request Status (Admin Only)

#### Update Status
**Endpoint:** `PUT /requests/:requestId/status`

**Requires Auth (Admin)**

**curl:**
```bash
curl -X PUT http://localhost:3001/api/requests/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "status":"in_progress",
    "message":"We have started working on your request. Team will be at site tomorrow.",
    "requiresUserFeedback":false
  }'
```

**Available Statuses:**
- `raised` - New request
- `in_progress` - Work started
- `needs_clarification` - Need more info from requester
- `completed` - Work done
- `closed` - Request closed

**Expected Response (200):**
```json
{
  "data":{
    "id":"550e8400-e29b-41d4-a716-446655440000",
    "title":"Water Supply Issue",
    "status":"in_progress",
    "updated_at":"2024-11-17T10:35:00Z"
  },
  "message":"Status updated successfully"
}
```

**Note:** Email notification is automatically sent to the user!

#### Get Status History
**Endpoint:** `GET /requests/:requestId/history`

**Requires Auth**

**curl:**
```bash
curl -X GET http://localhost:3001/api/requests/550e8400-e29b-41d4-a716-446655440000/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200):**
```json
[
  {
    "id":"uuid1",
    "request_id":"550e8400-e29b-41d4-a716-446655440000",
    "admin_id":"admin-uuid",
    "old_status":"raised",
    "new_status":"in_progress",
    "reason":"We have started working on your request.",
    "requires_user_feedback":false,
    "created_at":"2024-11-17T10:35:00Z"
  },
  {
    "id":"uuid2",
    "request_id":"550e8400-e29b-41d4-a716-446655440000",
    "old_status":"in_progress",
    "new_status":"completed",
    "reason":"Work completed successfully",
    "created_at":"2024-11-17T11:00:00Z"
  }
]
```

---

### Scenario 4: Allocate Work to Team Member (Admin Only)

#### Allocate Work
**Endpoint:** `POST /requests/:requestId/allocate`

**Requires Auth (Admin)**

**curl:**
```bash
curl -X POST http://localhost:3001/api/requests/550e8400-e29b-41d4-a716-446655440000/allocate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "teamMemberId":"team-member-uuid",
    "notes":"High priority - customer requested urgent service"
  }'
```

**Expected Response (201):**
```json
{
  "id":"allocation-uuid",
  "request_id":"550e8400-e29b-41d4-a716-446655440000",
  "allocated_admin_id":"team-member-uuid",
  "allocated_by_admin_id":"admin-uuid",
  "status":"pending",
  "created_at":"2024-11-17T10:40:00Z"
}
```

**Note:** Request status automatically changes to `in_progress`!

---

## 📊 Complete Test Flow

### 1. Get JWT Token
Login through the frontend or obtain via Supabase API

### 2. Test Rating System
```bash
# Submit excellent rating
curl -X POST http://localhost:3001/api/auth/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"request_id":"REQUEST_ID","rating":"excellent","comments":"Great work"}'

# Get ratings
curl -X GET http://localhost:3001/api/auth/ratings/REQUEST_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Status Updates
```bash
# Update to in_progress
curl -X PUT http://localhost:3001/api/requests/REQUEST_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"in_progress","message":"Starting work"}'

# Check history
curl -X GET http://localhost:3001/api/requests/REQUEST_ID/history \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Update to completed
curl -X PUT http://localhost:3001/api/requests/REQUEST_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"completed","message":"Work finished"}'
```

### 4. Test Password Reset
```bash
# Request reset
curl -X POST http://localhost:3001/api/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check email for token

# Reset password
curl -X POST http://localhost:3001/api/auth/password-reset/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_FROM_EMAIL","newPassword":"NewPass123!"}'
```

---

## 🔍 Error Codes Reference

| Code | Message | Meaning |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Not enough permissions (admin only) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## 📝 Using Postman

### Import Collection

1. Create new Postman Collection called "CivicServe"
2. Add requests with these settings:

#### Request 1: Submit Rating
```
POST http://localhost:3001/api/auth/ratings
Headers:
  Content-Type: application/json
  Authorization: Bearer {{token}}

Body (raw JSON):
{
  "request_id": "{{request_id}}",
  "rating": "excellent",
  "comments": "Great service"
}
```

#### Request 2: Update Status
```
PUT http://localhost:3001/api/requests/{{request_id}}/status
Headers:
  Content-Type: application/json
  Authorization: Bearer {{admin_token}}

Body (raw JSON):
{
  "status": "in_progress",
  "message": "Work started",
  "requiresUserFeedback": false
}
```

#### Request 3: Password Reset Request
```
POST http://localhost:3001/api/auth/password-reset/request
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "user@example.com"
}
```

### Set Variables in Postman

1. Click "Environments"
2. Create new environment "CivicServe Local"
3. Add variables:
   - `token`: Your JWT token
   - `admin_token`: Admin JWT token
   - `request_id`: Valid request UUID
   - `base_url`: http://localhost:3001

---

## ⚙️ Troubleshooting

### "401 Unauthorized"
- Check token is included in Authorization header
- Verify token hasn't expired
- Get new token by logging in

### "403 Forbidden"
- Admin endpoints require admin JWT token
- Ensure user has admin role in database

### "404 Not Found"
- Check request ID exists in database
- Verify spelling of endpoint

### "500 Server Error"
- Check backend console for error message
- Verify database connection
- Check .env variables are set

### Emails Not Sending
- Verify SMTP credentials in .env
- Check Gmail App Password (if using Gmail)
- Look at backend logs for errors

---

## ✅ Quick Test Checklist

- [ ] Backend health check: `GET /health`
- [ ] Password reset request works
- [ ] Submit rating successful
- [ ] Get ratings returns data
- [ ] Update status sends email
- [ ] Status history shows changes
- [ ] Admin-only endpoints reject non-admin tokens
- [ ] All error codes return correct status

---

## 📞 Support

If endpoints aren't working:
1. Check backend is running: `http://localhost:3001/health`
2. Check .env file has all variables
3. Check database tables exist
4. Review backend console logs
5. Try simple test first (password reset request)
