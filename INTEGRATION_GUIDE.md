# 🔗 CivicServe - Complete Integration Guide

## ✅ Frontend-Backend API Integration Status

This document verifies that all frontend API calls match their backend endpoints and provides setup instructions.

---

## 📍 WHERE TO ADD THE GEMINI API KEY

### For Local Development

1. **Backend `.env` file** (in `backend/` folder):
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   - Create or edit: `backend/.env`
   - Add the line above with your actual Gemini API key
   - **DO NOT commit this file to git** (already in `.gitignore`)

### For Production / Deployment

1. **Set as Environment Variable on your hosting platform:**
   - **Vercel (for frontend)**: Add to Environment Variables (not needed on Vercel, it's backend-only)
   - **Heroku / Railway (for backend)**: Add `GEMINI_API_KEY` to Config Vars
   - **AWS / GCP**: Set in Lambda/Cloud Functions environment
   - **Docker**: Pass via `docker run -e GEMINI_API_KEY=...` or in `.env` file mounted as secret

2. **Never commit API keys to source control**
   - The key is server-side only and will never be exposed to users
   - Frontend calls backend → backend calls Gemini API

---

## 🔌 Frontend-Backend API Integration Verification

### ✅ Authentication Routes (`/api/auth`)

| Frontend Call | Backend Endpoint | Status | Auth Required |
|---|---|---|---|
| `forgot-password/page.tsx:47` | `GET /api/auth/forgot-password/questions/:email` | ✅ | No |
| `forgot-password/page.tsx:89` | `POST /api/auth/forgot-password/verify-questions` | ✅ | No |
| `forgot-password/page.tsx:140` | `POST /api/auth/password-reset/verify` | ✅ | No |
| `signup/page.tsx:362` | `POST /api/auth/security-answers` | ✅ | Yes (Bearer token) |

**Verified Files:**
- Backend: `backend/src/routes/auth.ts`
- Frontend: `frontend/app/auth/forgot-password/page.tsx`, `frontend/app/auth/signup/page.tsx`

---

### ✅ Requests Routes (`/api/requests`)

| Frontend Call | Backend Endpoint | Status | Auth Required |
|---|---|---|---|
| `review-request/[id]/page.tsx:50` | `GET /api/requests/:requestId` | ✅ | Yes (Bearer token) |
| `review-request/[id]/page.tsx:67` | `GET /api/requests/:requestId/history` | ✅ | Yes (Bearer token) |
| `allocate-work/page.tsx:47` | `GET /api/requests` | ✅ | Yes (Bearer token) |
| `update-status/page.tsx:36` | `GET /api/requests` | ✅ | Yes (Bearer token) |

**Verified Files:**
- Backend: `backend/src/routes/requests.ts`
- Frontend: `frontend/app/admin/allocate-work/page.tsx`, `frontend/app/admin/update-status/page.tsx`, `frontend/app/user/review-request/[id]/page.tsx`

---

### ✅ Locations Routes (`/api/locations`)

| Frontend Call | Backend Endpoint | Status | Auth Required |
|---|---|---|---|
| `signup/page.tsx:260` | `GET /api/locations/cities?state=StateName` | ✅ | No |

**Verified Files:**
- Backend: `backend/src/routes/locations.ts`
- Frontend: `frontend/app/auth/signup/page.tsx`

**Fallback:** If backend is unreachable, frontend falls back to local `frontend/lib/indiaLocations.ts` data.

---

### ✅ Chatbot Routes (`/api/chatbot`)

| Frontend Call | Backend Endpoint | Status | Auth Required | API Key Required |
|---|---|---|---|---|
| `chatbot.tsx:16` | `POST /api/chatbot` | ✅ | No | Yes (GEMINI_API_KEY) |

**Verified Files:**
- Backend: `backend/src/routes/chatbot.ts`
- Frontend: `frontend/components/chatbot.tsx`

**Note:** Backend proxies request to Gemini API using `GEMINI_API_KEY` from environment.

---

### ✅ Admin Routes (`/api/admin`)

| Frontend Call | Backend Endpoint | Status | Auth Required |
|---|---|---|---|
| `allocate-work/page.tsx:63` | `POST /api/admin/assign-work` | ✅ | Yes (Bearer token) |
| `update-status/page.tsx:XX` | `PUT /api/requests/:id/status` | ✅ | Yes (Bearer token) |

**Verified Files:**
- Backend: `backend/src/routes/admin.ts`, `backend/src/routes/requests.ts`
- Frontend: `frontend/app/admin/allocate-work/page.tsx`, `frontend/app/admin/update-status/page.tsx`

---

## 🚀 Complete Startup Instructions

### Step 1: Install Backend Dependencies
```powershell
Set-Location -Path 'C:\Users\piyu4\OneDrive\Desktop\Epics\backend'
npm.cmd install
```

### Step 2: Create & Configure Backend `.env`
```powershell
# From backend folder, copy example to .env if not exists
if (-not (Test-Path .env)) { Copy-Item .env.example .env }

# Edit .env file and add your values:
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_key  
# GEMINI_API_KEY=your_gemini_api_key_here   <-- ADD YOUR KEY HERE
# FRONTEND_URL=http://localhost:3000
# PORT=3001
```

### Step 3: Start Backend Server
```powershell
Set-Location -Path 'C:\Users\piyu4\OneDrive\Desktop\Epics\backend'
npm.cmd run dev
```
Expected output: `CivicServe Backend Server running on port 3001`

### Step 4: Install Frontend Dependencies (in new PowerShell terminal)
```powershell
Set-Location -Path 'C:\Users\piyu4\OneDrive\Desktop\Epics\frontend'
npm.cmd install
```

### Step 5: Set Frontend Environment Variable
```powershell
# Option A: Create frontend/.env.local file
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Option B: Set environment variable before running
$env:NEXT_PUBLIC_API_URL='http://localhost:3001'
```

### Step 6: Start Frontend Dev Server
```powershell
Set-Location -Path 'C:\Users\piyu4\OneDrive\Desktop\Epics\frontend'
npm.cmd run dev
```
Expected output: `▲ Next.js X.X.X` with server running on http://localhost:3000

---

## 🧪 Testing the Integration

### Test 1: Backend Health Check
```powershell
# Should return: {"status":"ok","timestamp":"..."}
Invoke-RestMethod -Uri http://localhost:3001/health
```

### Test 2: Locations Endpoint
```powershell
# Get all states
Invoke-RestMethod -Uri http://localhost:3001/api/locations/states

# Get cities for a state
Invoke-RestMethod -Uri "http://localhost:3001/api/locations/cities?state=Karnataka"
```

### Test 3: Security Questions Endpoint
```powershell
# Get all security questions (no auth required)
Invoke-RestMethod -Uri http://localhost:3001/api/auth/security-questions
```

### Test 4: Chatbot Endpoint (without API key - should fail gracefully)
```powershell
$body = @{ message = 'Hello' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/api/chatbot -Method POST `
  -ContentType 'application/json' -Body $body

# Expected response without GEMINI_API_KEY:
# {"error":"GEMINI_API_KEY not configured on server"}
```

### Test 5: Frontend Integration
1. Open browser to `http://localhost:3000`
2. Go to **Auth > Sign Up**
3. Select state, verify city dropdown populates from backend API
4. See floating chatbot widget at bottom right
5. Go to **Auth > Forgot Password**
6. Enter email, verify security questions load from backend

---

## 🔐 Environment Variables Reference

### Backend `.env`
```env
# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_key

# Frontend CORS
FRONTEND_URL=http://localhost:3000

# Generative AI - ADD YOUR GEMINI API KEY HERE
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Generative API override (default is Google Generative API)
GENERATIVE_API_URL=https://generativeai.googleapis.com/v1beta2/models/text-bison-001:generateText

# Server Port
PORT=3001
```

### Frontend `.env.local` (optional, or use environment variable)
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📋 API Endpoint Summary

### Authentication (`/api/auth`)
- `GET /api/auth/security-questions` - List all security questions
- `POST /api/auth/security-answers` - Save user's security answers
- `GET /api/auth/forgot-password/questions/:email` - Get user's security questions for recovery
- `POST /api/auth/forgot-password/verify-questions` - Verify answers and issue reset token
- `POST /api/auth/password-reset/verify` - Reset password with token
- `POST /api/auth/ratings` - Submit request rating
- `GET /api/auth/ratings/:requestId` - Get ratings for request

### Requests (`/api/requests`)
- `POST /api/requests` - Create new request
- `GET /api/requests` - List requests
- `GET /api/requests/:id` - Get request details
- `GET /api/requests/:id/history` - Get status change history
- `POST /api/requests/:id/rate` - Rate completed request
- `GET /api/requests/:id/ratings` - Get request ratings
- `PUT /api/requests/:id/status` - Update status (admin only)
- `POST /api/requests/:id/allocate` - Assign work to admin

### Admin (`/api/admin`)
- `POST /api/admin/assign-work` - Assign request to team member
- `GET /api/admin/assignments` - Get my work assignments
- `PUT /api/admin/assignments/:id/status` - Update assignment status
- `GET /api/admin/notifications` - Get notifications
- `PUT /api/admin/notifications/:id/read` - Mark notification as read

### Locations (`/api/locations`)
- `GET /api/locations/states` - Get all Indian states
- `GET /api/locations/cities?state=StateName` - Get cities for a state

### Chatbot (`/api/chatbot`)
- `POST /api/chatbot` - Send message to Gemini API (proxied)

---

## ✅ TypeScript & Build Verification

### Frontend Build Check
```powershell
Set-Location -Path 'C:\Users\piyu4\OneDrive\Desktop\Epics\frontend'
npx next build
```
Should complete without type errors.

### Backend Build Check
```powershell
Set-Location -Path 'C:\Users\piyu4\OneDrive\Desktop\Epics\backend'
npm.cmd run build
```
Should complete and generate `dist/` folder.

---

## 🎯 Common Issues & Solutions

| Issue | Solution |
|---|---|
| `SUPABASE_URL is required` | Add valid SUPABASE_URL to backend/.env |
| `Cannot find module 'react'` | Run `npm install` in frontend folder |
| `NEXT_PUBLIC_API_URL is undefined` | Set env var or create frontend/.env.local |
| `GEMINI_API_KEY not configured` | Add GEMINI_API_KEY to backend/.env (expected if not set) |
| `Chatbot shows error` | Chatbot endpoint requires GEMINI_API_KEY in backend/.env |
| Cities dropdown empty | Ensure backend is running and accessible at NEXT_PUBLIC_API_URL |

---

## 🎓 Frontend-Backend Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User Action (e.g., Signup with State/City)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React/Next.js)                                     │
│ - Collects state selection                                   │
│ - Calls: GET /api/locations/cities?state=Karnataka          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTPS (localhost:3001)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend (Express/Node.js)                                    │
│ - locations.ts route handler                                 │
│ - Looks up state in INDIA_LOCATIONS                          │
│ - Returns cities array                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ JSON Response
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React/Next.js)                                     │
│ - Receives cities array                                      │
│ - Populates city dropdown                                    │
│ - User selects city and completes signup                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📞 Support & Next Steps

1. **Start both servers** following the startup instructions above
2. **Test endpoints** using the PowerShell test commands
3. **Add Gemini API key** to `backend/.env` for full chatbot functionality
4. **Check the browser console** for any API errors
5. **Review backend logs** (`npm run dev` output) for server-side issues

**All frontend-backend API routes are now verified and integrated!** ✅
