# Quick Start Guide - CivicServe

## 🎯 5-Minute Setup

### Step 1: Start the Backend

```powershell
cd backend
npm install
```

Create `.env` file in backend folder:
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret_key_12345
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
```

Start backend:
```powershell
npm run dev
```

✅ Backend should be running on `http://localhost:3001`

### Step 2: Start the Frontend

In a new terminal:

```powershell
cd code
npm install
npm run dev
```

✅ Frontend should be running on `http://localhost:3000`

## 🔑 Default Test Credentials

Once you've set up users in Supabase:

**Admin User:**
- Email: `admin@civicserve.com`
- Password: `SecureAdmin123!`

**Regular User:**
- Email: `user@civicserve.com`
- Password: `SecureUser123!`

## 🧭 Feature Navigation

### For Users (after login)
1. **Dashboard** - View your requests
2. **Raise Request** - Create new service requests
3. **Review Request** - Rate completed work (Excellent/Good/Reopen)
4. **Help** - Contact support

### For Admins (after login)
1. **Dashboard** - View statistics and recent requests
2. **Raised Requests** - See all new requests
3. **Update Status** - Change request status and notify users
4. **Allocate Work** - Assign tasks to team members
5. **Team Members** - Manage team

## 📧 Password Recovery Flow

1. Go to `/auth/login`
2. Click "Forgot your password?"
3. Enter your email
4. Check your email for reset link
5. Click link and set new password
6. Log in with new password

## ⭐ New Features

### Work Rating System
After a request is marked as completed:
- Users can rate the work quality
- Options: Excellent ⭐ | Good 👍 | Reopen Request ⚠️
- Add comments for feedback
- If "Reopen" selected, request goes back to "raised" status

### Admin Status Management
Admin can set status to:
- **In Progress** - Work is being done
- **Needs Clarification** - Ask user for more details
- **Completed** - Work is done
- **Closed** - Request finalized

Each status change sends an email to the user.

## 🔗 API Base URL

```
http://localhost:3001/api
```

## 📋 Database Setup

Run these SQL scripts in your Supabase SQL editor:

1. `code/scripts/001_create_tables.sql` - Initial tables
2. `code/scripts/002_seed_departments.sql` - Sample data
3. `backend/db/003_add_ratings_and_recovery.sql` - New features

## 🎨 Key Pages

| Page | URL | Role |
|------|-----|------|
| Admin Dashboard | `/admin/dashboard` | Admin |
| Update Status | `/admin/update-status` | Admin |
| Allocate Work | `/admin/allocate-work` | Admin |
| User Dashboard | `/user/dashboard` | User |
| Raise Request | `/user/raise-request` | User |
| Review Request | `/user/review-request` | User |
| Login | `/auth/login` | All |
| Forgot Password | `/auth/forgot-password` | All |

## ✅ Testing Checklist

- [ ] Backend runs on port 3001
- [ ] Frontend runs on port 3000
- [ ] Can login as admin
- [ ] Can login as user
- [ ] Can raise a service request
- [ ] Can update request status (admin)
- [ ] Can rate completed work (user)
- [ ] Can allocate work to team (admin)
- [ ] Password reset email sends
- [ ] Status update notifications work

## 🆘 Common Issues

**Port already in use?**
```powershell
# Find and kill process on port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

**Modules not found?**
```bash
npm install --legacy-peer-deps
```

**Supabase connection error?**
- Check `.env` file has correct URL and key
- Verify Supabase project is active

**Emails not sending?**
- Enable Gmail app password (if using Gmail)
- Check SMTP credentials in `.env`
- Check backend logs

## 📞 Support

- Check README.md for detailed documentation
- Check backend logs: `npm run dev`
- Check browser console: F12 in Chrome

Happy coding! 🚀
