# ✅ Setup Verification Checklist

Complete this checklist to ensure your CivicServe system is fully set up and working.

## 📋 Pre-Setup Requirements

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or pnpm available
- [ ] Supabase project created and active
- [ ] Gmail account (or other SMTP provider) ready
- [ ] Gmail App Password generated (if using Gmail)

## 🔧 Backend Setup Verification

### Installation & Configuration
- [ ] Backend folder exists: `backend/`
- [ ] `backend/package.json` exists
- [ ] `backend/src/server.ts` exists
- [ ] All dependencies installed: `npm install` completed
- [ ] `.env` file created in backend folder
- [ ] `.env` contains all required variables:
  - [ ] `PORT=3001`
  - [ ] `SUPABASE_URL` (from Supabase)
  - [ ] `SUPABASE_KEY` (anon key from Supabase)
  - [ ] `JWT_SECRET` (any secure string)
  - [ ] `SMTP_HOST` (e.g., smtp.gmail.com)
  - [ ] `SMTP_PORT` (e.g., 587)
  - [ ] `SMTP_USER` (your email)
  - [ ] `SMTP_PASS` (Gmail app password)
  - [ ] `FRONTEND_URL=http://localhost:3000`

### Backend Routes
- [ ] `backend/src/routes/auth.ts` exists with:
  - [ ] Rating endpoints
  - [ ] Password reset endpoints
- [ ] `backend/src/routes/requests.ts` exists with:
  - [ ] Status update endpoints
  - [ ] Work allocation endpoints
  - [ ] History tracking

### Backend Server Start
- [ ] Run: `npm run dev` in backend folder
- [ ] Check console for: "CivicServe Backend Server running on port 3001"
- [ ] Test health check: Open `http://localhost:3001/health` in browser
- [ ] Should see: `{"status":"ok","timestamp":"..."}`

## 🎨 Frontend Setup Verification

### Installation & Configuration
- [ ] Frontend folder: `code/`
- [ ] `code/package.json` exists
- [ ] All dependencies installed: `npm install` completed
- [ ] Supabase configuration files exist:
  - [ ] `code/lib/supabase/client.ts`
  - [ ] `code/lib/supabase/server.ts`

### Frontend Pages - Authentication
- [ ] `code/app/auth/login/page.tsx` exists
- [ ] `code/app/auth/forgot-password/page.tsx` exists
- [ ] `code/app/auth/reset-password/page.tsx` exists

### Frontend Pages - Admin
- [ ] `code/app/admin/update-status/page.tsx` exists and contains:
  - [ ] 5 status options visible
  - [ ] Needs Clarification option
  - [ ] Message field for updates
- [ ] `code/app/admin/allocate-work/page.tsx` exists

### Frontend Pages - User
- [ ] `code/app/user/review-request/page.tsx` exists and contains:
  - [ ] Excellent rating option
  - [ ] Good rating option
  - [ ] Reopen Request option
  - [ ] Comments field

### Frontend Server Start
- [ ] Run: `npm run dev` in code folder
- [ ] Check console for: "Local: http://localhost:3000"
- [ ] Frontend loads without errors
- [ ] Can see login page

## 🗄️ Database Setup Verification

### Database Tables Exist
- [ ] `service_requests` table
- [ ] `profiles` table
- [ ] `departments` table
- [ ] `work_allocations` table
- [ ] `request_updates` table
- [ ] New tables:
  - [ ] `request_ratings` ✨
  - [ ] `password_reset_tokens` ✨
  - [ ] `request_status_history` ✨

### Database Schema Verification
In Supabase SQL Editor, run:
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
- [ ] All 9 tables should be visible

### Row Level Security (RLS) Enabled
- [ ] Enable RLS on all tables in Supabase dashboard
- [ ] Policies are set up correctly

## 🔗 API Connectivity Verification

### Backend Health Check
- [ ] Open: `http://localhost:3001/health`
- [ ] Response shows: `{"status":"ok"}`

### Test Rating Endpoint
```bash
curl -X GET http://localhost:3001/api/auth/ratings/test-id \
  -H "Authorization: Bearer test-token"
```
- [ ] Returns response (may be 401, that's OK)

### Test Password Reset Endpoint
```bash
curl -X POST http://localhost:3001/api/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```
- [ ] Returns 200 response

## 🌐 Frontend-Backend Integration

### CORS Configuration
- [ ] Backend allows requests from `http://localhost:3000`
- [ ] No CORS errors in browser console

### API URL Configuration
- [ ] Frontend uses: `http://localhost:3001` for API calls
- [ ] API calls go to: `/api/auth/` and `/api/requests/`

## 📧 Email Configuration Verification

### Gmail SMTP Test (if using Gmail)
- [ ] Gmail account has 2FA enabled
- [ ] App Password generated at: https://myaccount.google.com/apppasswords
- [ ] App Password added to `.env` as `SMTP_PASS`

### Email Service Test
- [ ] Check backend logs for email sending
- [ ] Look for nodemailer initialization messages

## ✨ New Features Verification

### 1. Rating System
- [ ] Can navigate to: `http://localhost:3000/user/review-request`
- [ ] See "Excellent", "Good", "Reopen Request" options
- [ ] Comments field is present
- [ ] Submit button works

### 2. Password Recovery
- [ ] Can navigate to: `http://localhost:3000/auth/forgot-password`
- [ ] Form accepts email
- [ ] "Forgot password?" link on login page
- [ ] Can navigate to: `http://localhost:3000/auth/reset-password`

### 3. Admin Status Management
- [ ] Can navigate to: `http://localhost:3000/admin/update-status`
- [ ] See all 5 status options:
  - [ ] Raised (New Request)
  - [ ] In Progress
  - [ ] Needs Clarification from Requester
  - [ ] Completed
  - [ ] Closed
- [ ] Message field for updates
- [ ] "Requires user feedback" option for clarifications

### 4. Work Allocation
- [ ] Can navigate to: `http://localhost:3000/admin/allocate-work`
- [ ] Team members are listed
- [ ] Can select and allocate work

## 📊 Data Flow Verification

### Complete User Flow
1. [ ] User logs in successfully
2. [ ] User can see dashboard
3. [ ] User can raise a request
4. [ ] Admin can see request in dashboard
5. [ ] Admin can update status (request email sent)
6. [ ] User receives status update notification
7. [ ] When request is completed, user can rate it
8. [ ] Admin can see the rating

### Admin Flow
1. [ ] Admin logs in successfully
2. [ ] Admin can see all requests in dashboard
3. [ ] Admin can update status with message
4. [ ] Admin can allocate work to team members
5. [ ] Status updates send emails to users

### Password Recovery Flow
1. [ ] Click "Forgot Password" on login
2. [ ] Enter email
3. [ ] Check email for reset link
4. [ ] Click link
5. [ ] Set new password
6. [ ] Log in with new password

## 📝 Documentation Verification

- [ ] `README.md` exists (comprehensive guide)
- [ ] `QUICKSTART.md` exists (5-minute setup)
- [ ] `IMPLEMENTATION_SUMMARY.md` exists (what was built)
- [ ] `.env.example` exists in backend folder

## 🚀 Performance Verification

### Backend Performance
- [ ] Server responds in < 100ms
- [ ] No console errors on startup
- [ ] Database connection established

### Frontend Performance
- [ ] Pages load in < 2 seconds
- [ ] No JavaScript errors in console
- [ ] Forms are responsive

## ✅ Final Checklist

- [ ] Both servers running without errors
- [ ] Can navigate all pages without 404s
- [ ] Database has all required tables
- [ ] API endpoints respond correctly
- [ ] Email service configured
- [ ] Frontend can call backend APIs
- [ ] All new features are visible in UI
- [ ] User flow complete and working
- [ ] Admin flow complete and working
- [ ] Documentation is comprehensive

## 🎉 If All Checkmarks Are Complete!

Congratulations! Your CivicServe system is fully set up and ready to use.

### Next Steps:
1. Create test users in Supabase
2. Test the complete user and admin flows
3. Configure email provider for production
4. Plan deployment strategy
5. Add any custom features needed

### To Report Issues:
1. Check backend console logs
2. Check browser console (F12)
3. Check `.env` file for missing variables
4. Refer to README.md troubleshooting section

---

**Setup Date:** _______________  
**Verified By:** _______________  
**Issues Found:** _______________
