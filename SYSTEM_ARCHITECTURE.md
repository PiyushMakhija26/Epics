# 🔄 System Architecture & Data Flow

Complete visual guide to how CivicServe works end-to-end.

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CIVICSERVE SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                    ┌──────────────────────┐
│   FRONTEND (React)   │                    │  BACKEND (Express)   │
│  http://3000         │                    │  http://3001         │
└──────────────────────┘                    └──────────────────────┘
         │                                           │
         ├── Auth Pages                              ├── /api/auth
         │   ├── Login                               │   ├── ratings (POST, GET)
         │   ├── Forgot Password                     │   └── password-reset
         │   └── Reset Password                      │       ├── /request
         │                                           │       └── /verify
         ├── User Pages                              │
         │   ├── Dashboard                           ├── /api/requests
         │   ├── Raise Request                       │   ├── /:id/status (PUT)
         │   ├── Review Request                      │   ├── /:id/history (GET)
         │   └── Close Request                       │   └── /:id/allocate (POST)
         │                                           │
         └── Admin Pages                             └── Middleware
             ├── Dashboard                               └── JWT Auth
             ├── Raised Requests
             ├── Update Status
             ├── Allocate Work
             └── Team Management
                                                      └──────────────────────┐
                                                      │  DATABASE (Supabase) │
                                                      │      PostgreSQL      │
                                                      └──────────────────────┘
                                                              │
                                                      ├── request_ratings
                                                      ├── password_reset_tokens
                                                      └── request_status_history
```

---

## 👤 User Flow - Request Lifecycle

```
┌─ USER WORKFLOW ─────────────────────────────────────────────────────┐
│                                                                       │
│  1. RAISE REQUEST                                                    │
│     │                                                                │
│     ├─ User fills form                                              │
│     ├─ Uploads images                                               │
│     └─ Submits request → Database                                   │
│         │                                                            │
│         └─ Status: "raised" 🔵                                       │
│                                                                      │
│  2. NOTIFICATION                                                     │
│     │                                                                │
│     ├─ Admin sees in dashboard                                      │
│     └─ User sees in "My Requests"                                   │
│                                                                      │
│  3. ADMIN PROCESSES                                                  │
│     │                                                                │
│     ├─ Admin views details                                          │
│     ├─ Updates status:                                              │
│     │  ├─ → "in_progress" 🟠 (work started)                        │
│     │  ├─ → "needs_clarification" 🟣 (need info)                   │
│     │  ├─ → "completed" 🟢 (work done)                             │
│     │  └─ → "closed" ⚪ (finalized)                                 │
│     │                                                                │
│     ├─ Adds message                                                 │
│     └─ Email sent to user 📧                                        │
│                                                                      │
│  4. USER RECEIVES NOTIFICATION                                      │
│     │                                                                │
│     ├─ Email with update                                            │
│     └─ Logs in to see new status                                    │
│         │                                                            │
│         ├─ If status = "needs_clarification"                        │
│         │  └─ User responds in app                                  │
│         │                                                            │
│         └─ If status = "completed"                                  │
│            └─ User can rate work ⭐                                 │
│                │                                                     │
│                ├─ Rating: "excellent" ✅                            │
│                │  └─ Saved to database                              │
│                ├─ Rating: "good" ✅                                 │
│                │  └─ Saved to database                              │
│                └─ Rating: "open_again" ⚠️                           │
│                   ├─ Request re-opened                              │
│                   ├─ Status back to "raised" 🔵                     │
│                   └─ Admins see again in queue                      │
│                                                                      │
│  5. WORKFLOW COMPLETE ✅                                            │
│     │                                                                │
│     └─ Request finalized or reopened                                │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## 👨‍💼 Admin Flow - Request Management

```
┌─ ADMIN WORKFLOW ───────────────────────────────────────────────────┐
│                                                                      │
│  1. DASHBOARD                                                        │
│     │                                                                │
│     ├─ View statistics                                              │
│     │  ├─ Total requests                                            │
│     │  ├─ Raised                                                    │
│     │  ├─ In Progress                                               │
│     │  └─ Completed                                                 │
│     │                                                                │
│     └─ See recent requests                                          │
│                                                                      │
│  2. VIEW RAISED REQUESTS                                            │
│     │                                                                │
│     ├─ List of new requests                                         │
│     ├─ Click to see details                                         │
│     ├─ See description & images                                     │
│     └─ See request history                                          │
│                                                                      │
│  3. UPDATE STATUS                                                    │
│     │                                                                │
│     ├─ Select request                                               │
│     ├─ Choose new status:                                           │
│     │  ├─ In Progress                                               │
│     │  ├─ Needs Clarification                                       │
│     │  ├─ Completed                                                 │
│     │  └─ Closed                                                    │
│     ├─ Add message to user                                          │
│     ├─ If clarification needed:                                     │
│     │  └─ User must respond before proceeding                       │
│     │                                                                │
│     └─ Send → Email sent to user 📧                                │
│                                                                      │
│  4. ALLOCATE WORK                                                    │
│     │                                                                │
│     ├─ Select request                                               │
│     ├─ Choose team member                                           │
│     ├─ Auto-assigns notes/details                                   │
│     │                                                                │
│     └─ Allocate → Status auto-set to "in_progress" 🟠              │
│                                                                      │
│  5. TRACK PROGRESS                                                   │
│     │                                                                │
│     ├─ View all allocated work                                      │
│     ├─ See status history                                           │
│     ├─ Check user ratings                                           │
│     │                                                                │
│     └─ Monitor completion rates                                     │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Password Recovery Flow

```
┌─ PASSWORD RECOVERY ────────────────────────────────────────────────┐
│                                                                     │
│  1. USER INITIATES                                                 │
│     │                                                              │
│     ├─ User on login page                                         │
│     ├─ Clicks "Forgot password?"                                  │
│     └─ Navigates to /auth/forgot-password                         │
│                                                                    │
│  2. REQUEST RESET                                                 │
│     │                                                              │
│     ├─ Enter email address                                        │
│     ├─ Click "Send Reset Link"                                   │
│     │                                                              │
│     └─ Backend:                                                   │
│        ├─ Generate random token                                  │
│        ├─ Save to password_reset_tokens table                    │
│        │  ├─ token: random_uuid                                  │
│        │  ├─ expires_at: now + 1 hour                            │
│        │  └─ user_id: user's id                                  │
│        │                                                          │
│        └─ Send email 📧                                          │
│           └─ Link: /auth/reset-password?token=XXXXXX             │
│                                                                    │
│  3. USER CHECKS EMAIL                                            │
│     │                                                              │
│     ├─ Email arrives                                              │
│     ├─ Contains reset link                                        │
│     └─ Clicks link                                                │
│        └─ Goes to /auth/reset-password?token=XXXXXX              │
│                                                                    │
│  4. RESET PASSWORD                                               │
│     │                                                              │
│     ├─ Form shows password fields                                 │
│     ├─ User enters new password                                   │
│     ├─ User confirms password                                     │
│     ├─ Click "Reset Password"                                    │
│     │                                                              │
│     └─ Backend:                                                   │
│        ├─ Find token in DB                                       │
│        ├─ Check not expired (< 1 hour)                           │
│        ├─ Check not already used                                 │
│        ├─ Mark as used: used_at = now                            │
│        ├─ Update user password 🔐                                │
│        │                                                          │
│        └─ Return success message                                 │
│                                                                    │
│  5. USER LOGS IN                                                 │
│     │                                                              │
│     ├─ Redirected to /auth/login                                 │
│     ├─ Enters email & new password                               │
│     └─ ✅ Login successful!                                       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## ⭐ Rating System Flow

```
┌─ WORK RATING ─────────────────────────────────────────────────────┐
│                                                                    │
│  1. WORK COMPLETED                                                │
│     │                                                              │
│     ├─ Admin marks request "completed" 🟢                         │
│     ├─ Email sent to user 📧                                      │
│     └─ User sees "Completed" in their dashboard                  │
│                                                                    │
│  2. USER REVIEWS WORK                                            │
│     │                                                              │
│     ├─ User navigates to /user/review-request                    │
│     ├─ Sees list of completed requests                           │
│     ├─ Clicks on request to rate                                 │
│     │                                                              │
│     └─ Shows details:                                            │
│        ├─ Request title & description                            │
│        ├─ Completion date                                        │
│        └─ Three rating options ⬇️                                │
│                                                                    │
│  3. RATE THE WORK                                                │
│     │                                                              │
│     ├─ Option 1: ⭐ EXCELLENT                                    │
│     │  ├─ Perfect work, meets all expectations                   │
│     │  └─ Request stays "completed"                              │
│     │                                                              │
│     ├─ Option 2: 👍 GOOD                                         │
│     │  ├─ Satisfactory work, minor issues                        │
│     │  └─ Request stays "completed"                              │
│     │                                                              │
│     └─ Option 3: ⚠️ OPEN AGAIN                                   │
│        ├─ Work unsatisfactory                                    │
│        ├─ Request status → "raised" 🔵                           │
│        ├─ Back in admin queue                                    │
│        ├─ Email sent to admin                                    │
│        └─ Work needs to be redone                                │
│                                                                    │
│  4. ADD COMMENTS (OPTIONAL)                                      │
│     │                                                              │
│     ├─ User adds detailed comments                               │
│     ├─ Examples:                                                 │
│     │  ├─ "Great team, very professional"                        │
│     │  ├─ "Could have been faster"                               │
│     │  └─ "Please redo - not completed properly"                 │
│     │                                                              │
│     └─ Comments saved to database                                │
│                                                                    │
│  5. SUBMIT RATING                                                │
│     │                                                              │
│     ├─ Click "Submit Rating"                                     │
│     │                                                              │
│     └─ Backend:                                                   │
│        ├─ Verify user owns request                               │
│        ├─ Check rating is valid                                  │
│        ├─ Save to request_ratings table                          │
│        │  ├─ rating: excellent/good/open_again                  │
│        │  ├─ comments: user feedback                            │
│        │  └─ created_at: timestamp                              │
│        │                                                          │
│        └─ If "open_again":                                       │
│           ├─ Update request status → "raised"                   │
│           ├─ Email admin about reopen                           │
│           └─ Email user confirmation                            │
│                                                                    │
│  6. CONFIRMATION                                                 │
│     │                                                              │
│     ├─ Show success message                                      │
│     ├─ Rating saved ✅                                           │
│     └─ If reopened, show "Request reopened" ℹ️                   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Status Lifecycle Diagram

```
                    ┌─ IN PROGRESS ─┬─ NEEDS CLARIFICATION
                    │ (Work Started)│ (More Info Needed)
                    │     🟠        │      🟣
                    │               │       │
                    │               └──────┐│
        RAISED ────►│                      ││
       (New)        │                      ││
        🔵          │                      ││
        │           │                      ││
        │           └──────┬───────────────┘│
        │                  │                 │
        │                  ▼                 │
        │            COMPLETED ──────────►CLOSED
        │           (Work Done)          (Final)
        │              🟢                  ⚪
        │              │
        │              ├─ Rating: Excellent
        │              │  └─ Stays Completed
        │              │
        │              ├─ Rating: Good
        │              │  └─ Stays Completed
        │              │
        │              └─ Rating: Open Again
        │                 └─ Goes Back to RAISED ◀
        │
        └──────────────► Back to Queue
                     (If "Open Again")

Legend:
🔵 Raised     - New request
🟠 In Progress - Work started
🟣 Needs Clarity - More info needed
🟢 Completed  - Work finished
⚪ Closed     - Finalized
```

---

## 🔐 Data Security Flow

```
┌─ SECURITY ARCHITECTURE ────────────────────────────────────────────┐
│                                                                    │
│  FRONTEND                          BACKEND                DATABASE│
│  ────────                          ───────                ───────│
│                                                                    │
│  1. LOGIN                          JWT Token          Verify in │
│     ├─ Email                       ├─ Generate         RLS       │
│     └─ Password                    └─ 7-day exp                  │
│         │                              │                          │
│         └─────────────────────────────►│                          │
│                                        │                          │
│  2. REQUEST WITH TOKEN                │                          │
│     Authorization: Bearer <token>      │                          │
│         │                              │                          │
│         └─────────────────────────────►├─ Verify Token           │
│                                        │                          │
│  3. MIDDLEWARE                        └─ Check RLS              │
│     ├─ Valid Token?                      ├─ User isolation       │
│     ├─ Not Expired?                      ├─ Admin checks         │
│     ├─ User Authorized?                  └─ Row filtering        │
│     └─ Admin Check?                                              │
│         │                                                         │
│         └─ ✅ PROCEED                                            │
│         or                                                       │
│         └─ ❌ REJECT (401/403)                                   │
│                                                                    │
│  4. PASSWORD SECURITY                                            │
│     ├─ Token expires: 1 hour              Token DB               │
│     ├─ One-time use                  ├─ Random UUID             │
│     ├─ Email verified                ├─ Expiration time         │
│     └─ New password hashed           └─ Used flag               │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📧 Email Notification Flow

```
┌─ EMAIL SERVICE ────────────────────────────────────────────────────┐
│                                                                    │
│  EVENT TRIGGERED                                                  │
│  ↓                                                                 │
│  ├─ Status Update                                                 │
│  │  └─ Admin changes status                                       │
│  │     └─ Send to: request owner                                 │
│  │                                                                 │
│  ├─ Password Reset                                                │
│  │  └─ User requests password reset                               │
│  │     └─ Send to: user's email                                  │
│  │                                                                │
│  ├─ Work Reopened                                                 │
│  │  └─ User rates "open_again"                                   │
│  │     └─ Send to: request owner & admin                         │
│  │                                                                │
│  └─ Work Allocated                                                │
│     └─ Admin assigns to team                                     │
│        └─ Send to: assigned team member                          │
│                                                                    │
│  BACKEND EMAIL SERVICE                                           │
│  ├─ Format email HTML                                             │
│  ├─ Connect to SMTP server                                        │
│  │  └─ Gmail / Outlook / Custom                                  │
│  │                                                                 │
│  ├─ Send email                                                    │
│  │  ├─ To: recipient                                             │
│  │  ├─ Subject: Relevant title                                   │
│  │  └─ Body: Formatted HTML                                      │
│  │                                                                 │
│  └─ Log result ✅ or ❌                                           │
│                                                                    │
│  USER RECEIVES                                                    │
│  └─ Email in inbox                                               │
│     ├─ Read content                                              │
│     ├─ Click links if applicable                                │
│     └─ Take action                                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 API Request-Response Cycle

```
┌─ API CALL CYCLE ──────────────────────────────────────────────────┐
│                                                                    │
│  FRONTEND                                                         │
│  ├─ User action (click, submit)                                  │
│  ├─ Get JWT token from localStorage                              │
│  ├─ Prepare request data                                         │
│  │  ├─ Method: POST/PUT/GET                                      │
│  │  ├─ URL: http://localhost:3001/api/...                       │
│  │  ├─ Headers:                                                  │
│  │  │  ├─ Authorization: Bearer <token>                          │
│  │  │  └─ Content-Type: application/json                         │
│  │  └─ Body: JSON data                                           │
│  │                                                                │
│  └─ Send fetch() request                                         │
│     │                                                             │
│     ▼                                                             │
│                                                                   │
│  BACKEND                                                         │
│  ├─ Receive request                                              │
│  ├─ Check Authorization header                                   │
│  │  └─ Extract & verify JWT token                               │
│  │                                                               │
│  ├─ Auth Middleware                                              │
│  │  ├─ Token valid? ✅                                          │
│  │  └─ If not: Return 401                                       │
│  │                                                               │
│  ├─ Route Handler                                                │
│  │  ├─ Parse request body                                        │
│  │  ├─ Validate input                                            │
│  │  ├─ Check admin role (if needed)                              │
│  │  ├─ Process business logic                                    │
│  │  └─ Query database                                            │
│  │                                                               │
│  ├─ Database Query                                               │
│  │  ├─ RLS checks row access                                     │
│  │  ├─ Execute query                                             │
│  │  └─ Return results                                            │
│  │                                                               │
│  ├─ Format Response                                              │
│  │  ├─ Status: 200/201/400/401/403/500                           │
│  │  └─ Body: JSON                                                │
│  │                                                               │
│  └─ Send response                                                │
│     │                                                             │
│     ▼                                                             │
│                                                                   │
│  FRONTEND                                                        │
│  ├─ Receive response                                             │
│  ├─ Check status code                                            │
│  ├─ Parse response body                                          │
│  ├─ Handle success                                               │
│  │  ├─ Update UI                                                 │
│  │  ├─ Show success message                                      │
│  │  └─ Navigate if needed                                        │
│  │                                                               │
│  └─ or Handle error                                              │
│     ├─ Show error message                                        │
│     ├─ Log to console                                            │
│     └─ Stay on page                                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Complete Data Model

```
USERS (Supabase Auth)
├─ id (UUID)
├─ email
├─ password (hashed)
└─ created_at

PROFILES
├─ id (FK: users.id)
├─ email
├─ full_name
├─ user_type: admin | user
├─ phone
└─ created_at

SERVICE_REQUESTS
├─ id
├─ user_id (FK: profiles)
├─ title
├─ description
├─ status: raised|in_progress|needs_clarification|completed|closed
├─ created_at
└─ updated_at
    │
    ├─ REQUEST_RATINGS 📊 NEW
    │  ├─ id
    │  ├─ request_id (FK)
    │  ├─ rating: excellent|good|open_again
    │  ├─ comments
    │  └─ created_at
    │
    ├─ REQUEST_STATUS_HISTORY 📋 NEW
    │  ├─ id
    │  ├─ old_status
    │  ├─ new_status
    │  ├─ reason
    │  └─ created_at
    │
    └─ WORK_ALLOCATIONS
       ├─ id
       ├─ allocated_admin_id (FK: profiles)
       └─ created_at

PASSWORD_RESET_TOKENS 🔑 NEW
├─ id
├─ user_id (FK: profiles)
├─ token
├─ expires_at
├─ used_at
└─ created_at
```

---

## ✅ Complete System Summary

This architecture ensures:
- ✅ Secure authentication
- ✅ Data isolation
- ✅ Audit trails
- ✅ Email notifications
- ✅ Multiple status options
- ✅ User feedback via ratings
- ✅ Work allocation tracking
- ✅ Password recovery

Everything is integrated and ready to use! 🚀

---

*System Architecture Documentation Complete*  
*Ready for Implementation*
