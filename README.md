# CivicServe - Citizen Service Management Platform

A modern civic service request and management system built with Next.js, TypeScript, Express, and MongoDB.

## Quick Start

**Backend** (Terminal 1):
```bash
cd backend && npm install && npm run dev
# Runs on http://localhost:3001
```

**Frontend** (Terminal 2):
```bash
cd frontend && npm install && npm run dev
# Runs on http://localhost:3000
```

## Architecture

### Tech Stack
- **Frontend:** Next.js 16 + React + Tailwind CSS (black & white theme)
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB with Mongoose
- **Auth:** JWT (7-day tokens) + bcryptjs
- **Realtime:** Server-Sent Events (SSE)
- **Uploads:** Multer (5MB/file, served from `/uploads`)
- **Email:** Nodemailer (Ethereal fallback)

### Features

**Citizen:**
- Create service requests with file attachments
- Track request status in real-time
- Rate and review services
- Security questions for password recovery
- View request history

**Admin:**
- View all service requests
- Allocate work to staff
- Update request status
- Send notifications/alarms to citizens
- Monitor system activity

**System:**
- JWT authentication
- File upload handling
- SSE real-time notifications
- Email alerts (status updates, alarms)
- MongoDB persistence
- TypeScript type safety

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/password-reset` - Reset password

### Requests
- `GET /api/requests` - List requests
- `POST /api/requests` - Create request (multipart with attachments)
- `PATCH /api/requests/:id/status` - Update status
- `GET /api/requests/:id` - Get request details

### Admin
- `GET /api/admin/requests` - Admin view of all requests
- `POST /api/admin/allocate-work` - Assign work
- `POST /api/admin/alarms` - Broadcast notification

### Notifications
- `GET /api/notifications/subscribe` - SSE stream
- `POST /api/notifications/send` - Send notification
- `POST /api/notifications/alarms` - Send alarm

## Environment Variables

Create `.env` in backend root:
```env
MONGODB_URI=mongodb://localhost:27017/civicserve
JWT_SECRET=your-secret-key
NODE_ENV=development
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
```

## Project Structure

```
backend/
  src/
    middleware/        # Auth & file upload
    routes/           # API endpoints
    services/         # Business logic
    db/               # MongoDB models
    utils/            # Helpers
  server.ts           # Express entry
  package.json

frontend/
  app/                # Next.js app router
    admin/            # Admin dashboard
    user/             # Citizen features
    api/              # API routes
  components/         # React components
  hooks/              # Custom hooks
  lib/                # Utilities
  package.json
```

## Notes

- Frontend uses Next.js App Router with client-side SSE for real-time updates
- Backend uses in-memory SSE subscriptions (suitable for dev; use Redis/pub-sub for production)
- Notifications are persisted in MongoDB
- All attachments served from `/uploads` directory

---

**Status:** Development | **Last Updated:** February 2026
