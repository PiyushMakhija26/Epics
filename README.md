# CivicServe - Service Request Management System

A comprehensive full-stack application for managing civic service requests, built with Next.js frontend and Express.js backend.

## 🚀 Features

### User Features
- **Request Management**: Raise, track, and manage service requests
- **Rating System**: Rate completed work as Excellent, Good, or request reopening
- **Password Recovery**: Secure password reset via email
- **Request History**: Track all past requests and their status updates
- **Notifications**: Email notifications for status updates

### Admin Features
- **Request Dashboard**: Overview of all service requests with real-time statistics
- **Status Management**: Update request status with multiple options:
  - Raised (New Request)
  - In Progress
  - Needs Clarification from Requester
  - Completed
  - Closed
- **Work Allocation**: Assign requests to team members
- **Team Management**: Manage team members and their workload
- **Email Notifications**: Automatic status update emails to users

## 📁 Project Structure

```
Modern Epics/
├── code/                          # Frontend (Next.js)
│   ├── app/
│   │   ├── admin/                # Admin dashboard routes
│   │   │   ├── dashboard/
│   │   │   ├── update-status/
│   │   │   ├── allocate-work/
│   │   │   └── layout.tsx
│   │   ├── auth/                 # Authentication routes
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── user/                 # User routes
│   │   │   ├── dashboard/
│   │   │   ├── raise-request/
│   │   │   ├── review-request/
│   │   │   └── close-request/
│   │   └── api/                  # API routes
│   ├── components/               # Reusable UI components
│   ├── lib/                      # Utilities
│   │   └── supabase/
│   ├── hooks/                    # Custom React hooks
│   └── styles/
│
└── backend/                       # Backend (Express.js)
    ├── src/
    │   ├── routes/
    │   │   ├── auth.ts           # Authentication endpoints
    │   │   └── requests.ts        # Request management endpoints
    │   ├── middleware/
    │   │   └── auth.ts           # JWT authentication
    │   ├── utils/
    │   │   ├── supabase.ts       # Supabase client
    │   │   ├── jwt.ts            # JWT utilities
    │   │   └── email.ts          # Email service
    │   ├── services/             # Business logic
    │   └── server.ts             # Main server file
    └── db/
        ├── 001_create_tables.sql  # Initial schema
        ├── 002_seed_departments.sql
        └── 003_add_ratings_and_recovery.sql
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ (with npm or pnpm)
- Supabase account and project
- SMTP server for email (Gmail recommended)

### Backend Setup

1. **Navigate to backend folder**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_secure_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

4. **Start the backend server**:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to code folder**:
```bash
cd code
```

2. **Install dependencies**:
```bash
npm install
# or
pnpm install
```

3. **Set up Supabase** (already configured in the frontend)

4. **Start the development server**:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📊 Database Schema

### New Tables (for ratings and recovery)

#### request_ratings
Stores user ratings of completed work
- `id`: UUID primary key
- `request_id`: Foreign key to service_requests
- `user_id`: Foreign key to profiles
- `rating`: 'excellent' | 'good' | 'open_again'
- `comments`: Text feedback from user
- `created_at`: Timestamp

#### password_reset_tokens
Manages password reset functionality
- `id`: UUID primary key
- `user_id`: Foreign key to profiles
- `token`: Unique reset token
- `expires_at`: Expiration time (1 hour)
- `used_at`: When token was used
- `created_at`: Timestamp

#### request_status_history
Detailed tracking of status changes
- `id`: UUID primary key
- `request_id`: Foreign key to service_requests
- `admin_id`: Admin who made the change
- `old_status`: Previous status
- `new_status`: New status
- `reason`: Reason for change
- `requires_user_feedback`: Boolean flag
- `created_at`: Timestamp

## 🔐 API Endpoints

### Authentication Routes (`/api/auth`)

#### Rate Work
```
POST /api/auth/ratings
Authorization: Bearer {token}
Body: {
  request_id: string,
  rating: 'excellent' | 'good' | 'open_again',
  comments?: string
}
```

#### Get Ratings
```
GET /api/auth/ratings/:requestId
Authorization: Bearer {token}
```

#### Request Password Reset
```
POST /api/auth/password-reset/request
Body: {
  email: string
}
```

#### Verify and Reset Password
```
POST /api/auth/password-reset/verify
Body: {
  token: string,
  newPassword: string
}
```

### Request Routes (`/api/requests`)

#### Update Status (Admin Only)
```
PUT /api/requests/:requestId/status
Authorization: Bearer {token}
Body: {
  status: 'raised' | 'in_progress' | 'needs_clarification' | 'completed' | 'closed',
  message: string,
  requiresUserFeedback?: boolean
}
```

#### Get Status History
```
GET /api/requests/:requestId/history
Authorization: Bearer {token}
```

#### Allocate Work (Admin Only)
```
POST /api/requests/:requestId/allocate
Authorization: Bearer {token}
Body: {
  teamMemberId: string,
  notes?: string
}
```

## 🎨 User Interface

### Admin Dashboard
- Real-time statistics (Total, Raised, In Progress, Completed requests)
- Quick access to all admin functions
- Recent requests overview

### Update Status Page
- List of all pending requests
- Multiple status options
- Email notification to users
- Option to request clarification from requester

### Rate Work Page (User)
- View all completed requests
- Rate quality of work (Excellent/Good/Reopen)
- Add comments and feedback
- Visual indicators for ratings

### Allocate Work Page
- Assign tasks to team members
- View team member list
- Confirmation of allocation

### Password Recovery Flow
1. User clicks "Forgot Password" on login
2. Enters email address
3. Receives reset link via email
4. Clicks link and enters new password
5. Returns to login and signs in with new password

## 🛡️ Security Features

- JWT-based authentication
- Row-level security (RLS) on all database tables
- Email verification for password resets
- Token expiration (1 hour for reset tokens)
- Admin-only endpoints for sensitive operations
- CORS protection with configurable origins

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password as `SMTP_PASS` in `.env`

### Other Email Providers
Update `SMTP_HOST` and `SMTP_PORT` accordingly in the backend `.env` file

## 🚀 Deployment

### Backend Deployment (Heroku/Vercel)
```bash
npm run build
npm start
```

### Frontend Deployment (Vercel)
```bash
npm run build
npm start
```

## 🧪 Testing

### Backend API Testing
Use Postman or curl to test endpoints:
```bash
curl -X POST http://localhost:3001/api/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Backend server port | 3001 |
| SUPABASE_URL | Supabase project URL | https://xxx.supabase.co |
| SUPABASE_KEY | Supabase anon key | eyJhbGc... |
| JWT_SECRET | Secret for JWT signing | your_secure_key_here |
| SMTP_HOST | Email server host | smtp.gmail.com |
| SMTP_PORT | Email server port | 587 |
| SMTP_USER | Email account username | your_email@gmail.com |
| SMTP_PASS | Email account password | app_password |
| FRONTEND_URL | Frontend application URL | http://localhost:3000 |

## 🐛 Troubleshooting

### Backend won't start
- Ensure all environment variables are set
- Check if port 3001 is not already in use
- Verify Supabase credentials

### Emails not sending
- Verify SMTP credentials
- Check email provider's app password setup
- Look at backend console logs for errors

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check CORS settings in backend `server.ts`
- Verify frontend is trying to connect to correct URL

## 📄 License

This project is part of the Modern Epics initiative.

## 🤝 Support

For issues or questions, please check the documentation or contact the development team.
