# 🏃 How to Run CivicServe Locally

## ✅ Current Status
- **Backend:** Running on http://localhost:3001 ✅
- **Frontend:** Running on http://localhost:3000 ✅
- **Database:** MongoDB connected ✅

---

## 🎯 Prerequisites

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/

2. **MongoDB** (running locally)
   - Download: https://www.mongodb.com/try/download/community
   - Windows: Install as service and start it
   - Command: `mongosh` to verify connection

3. **Git** (optional, for version control)

---

## 🚀 First Time Setup

### Step 1: Install Backend Dependencies

```powershell
cd C:\Users\piyu4\OneDrive\Desktop\Epics\backend
npm install
```

Output should show:
```
added 173 packages...
```

### Step 2: Install Frontend Dependencies

```powershell
cd C:\Users\piyu4\OneDrive\Desktop\Epics\frontend
npm install --legacy-peer-deps
```

Output should show:
```
added 196 packages...
```

### Step 3: Start Backend Server

**Terminal 1:**
```powershell
cd C:\Users\piyu4\OneDrive\Desktop\Epics\backend
npm run dev
```

Wait for message:
```
✅ CivicServe Backend Server running on port 3001
✅ MongoDB connected successfully
```

### Step 4: Start Frontend Server

**Terminal 2:**
```powershell
cd C:\Users\piyu4\OneDrive\Desktop\Epics\frontend
$env:NEXT_PUBLIC_API_URL='http://localhost:3001'
npm run dev
```

Wait for message:
```
✓ Ready in XXXX ms
```

### Step 5: Open Application

**Terminal 3 (or browser):**
```powershell
start http://localhost:3000
```

---

## 📋 Daily Startup (After First Setup)

### Quick Start (3 steps):

**Terminal 1 - Backend:**
```powershell
cd C:\Users\piyu4\OneDrive\Desktop\Epics\backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\piyu4\OneDrive\Desktop\Epics\frontend
$env:NEXT_PUBLIC_API_URL='http://localhost:3001'
npm run dev
```

**Browser:**
```
http://localhost:3000
```

---

## 🧪 Testing the API

### Test 1: Health Check
```powershell
Invoke-RestMethod -Uri http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T18:30:45.123Z"
}
```

### Test 2: Get Indian States
```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/locations/states
```

Expected response:
```json
[
  { "state": "Andhra Pradesh", "cities": ["Visakhapatnam", "Vijayawada", ...] },
  { "state": "Karnataka", "cities": ["Bengaluru", "Mysuru", ...] },
  ...
]
```

### Test 3: Get Cities for State
```powershell
$uri = "http://localhost:3001/api/locations/cities?state=Karnataka"
Invoke-RestMethod -Uri $uri
```

### Test 4: Get Security Questions
```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/auth/security-questions
```

### Test 5: Chatbot (requires API key)
```powershell
$body = @{ message = "What is CivicServe?" } | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3001/api/chatbot `
  -Method POST `
  -ContentType 'application/json' `
  -Body $body
```

---

## 📊 MongoDB Commands

### Check MongoDB Status
```powershell
mongosh
```

### View Database Collections
```powershell
use civicserve
show collections
```

### View Sample Data
```powershell
db.profiles.find().pretty()
db.servicerequests.find().pretty()
db.securityquestions.find().pretty()
db.requestratings.find().pretty()
```

### Count Documents
```powershell
db.profiles.countDocuments()
db.servicerequests.countDocuments()
```

---

## 🛑 Stopping Servers

### Option 1: Manual Stop (Recommended)
```powershell
# In each terminal, press Ctrl+C
```

### Option 2: Force Kill All Node Processes
```powershell
Stop-Process -Name node -Force
```

---

## 🔧 Troubleshooting

### Problem: Backend won't start
**Solution:**
1. Check MongoDB is running: `mongosh`
2. Delete `backend/node_modules` and reinstall: `npm install`
3. Check port 3001 is free: `netstat -ano | findstr :3001`

### Problem: Frontend won't compile
**Solution:**
1. Check `NEXT_PUBLIC_API_URL` is set
2. Delete `frontend/node_modules` and `.next` folder
3. Reinstall with: `npm install --legacy-peer-deps`

### Problem: "Cannot connect to MongoDB"
**Solution:**
1. Ensure MongoDB is installed
2. Start MongoDB service (Windows Services)
3. Check `.env` has correct `MONGODB_URI`

### Problem: Chatbot shows error
**Solution:**
- This is OK if GEMINI_API_KEY not configured
- Add your key to `.env` if you want to test chatbot

### Problem: State/City dropdown empty
**Solution:**
1. Check backend is running: `Invoke-RestMethod -Uri http://localhost:3001/health`
2. Check API responds: `Invoke-RestMethod -Uri http://localhost:3001/api/locations/states`
3. Check browser console for errors (F12)

---

## 📝 Environment Variables

### Backend `.env`
Located: `backend/.env`
```
MONGODB_URI=mongodb://localhost:27017/civicserve
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=AIzaSyC5ejCxBpEpgobGi79t9nJ8NaqNqaAKgr8
PORT=3001
```

### Frontend Environment
Set before running `npm run dev`:
```powershell
$env:NEXT_PUBLIC_API_URL='http://localhost:3001'
```

---

## 📚 Useful PowerShell Commands

```powershell
# Navigate to directory
cd C:\Users\piyu4\OneDrive\Desktop\Epics

# List files
ls

# Check if port is in use
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# Check Node version
node --version
npm --version

# Clear npm cache if needed
npm cache clean --force

# Kill all node processes
Stop-Process -Name node -Force

# Open URL in browser
start http://localhost:3000

# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

---

## 🎯 Common Workflows

### First Time (Complete Setup)
```powershell
# Terminal 1
cd C:\Users\piyu4\OneDrive\Desktop\Epics\backend
npm install
npm run dev

# Terminal 2
cd C:\Users\piyu4\OneDrive\Desktop\Epics\frontend
npm install --legacy-peer-deps
$env:NEXT_PUBLIC_API_URL='http://localhost:3001'
npm run dev

# Browser
start http://localhost:3000
```

### Restart After Reboot
```powershell
# Make sure MongoDB is running
# Command 1
cd C:\Users\piyu4\OneDrive\Desktop\Epics\backend; npm run dev

# Command 2 (new terminal)
cd C:\Users\piyu4\OneDrive\Desktop\Epics\frontend; $env:NEXT_PUBLIC_API_URL='http://localhost:3001'; npm run dev

# Open browser to http://localhost:3000
```

### Make Code Changes
1. Edit file in VS Code
2. Save (Ctrl+S)
3. Both servers auto-reload (watch mode)
4. Refresh browser (F5)

---

## ✅ Verification Checklist

- [ ] Node.js installed: `node --version`
- [ ] MongoDB installed: `mongosh --version`
- [ ] Backend dependencies: `ls backend/node_modules`
- [ ] Frontend dependencies: `ls frontend/node_modules`
- [ ] Backend running: `Invoke-RestMethod -Uri http://localhost:3001/health`
- [ ] Frontend running: Open http://localhost:3000
- [ ] Can see signup page with state dropdown
- [ ] Can see chatbot widget at bottom right
- [ ] MongoDB connected: Check backend console logs

---

## 🚀 Ready to Go!

You now have:
- ✅ Full-stack development environment
- ✅ Both servers configured and running
- ✅ MongoDB database operational
- ✅ All features integrated
- ✅ Hot reload enabled for development

**Start building!** 🎉
