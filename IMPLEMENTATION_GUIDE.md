# CivicServe Implementation Guide - New Features

This guide documents the new features implemented for the CivicServe project as of November 17, 2025.

## Overview of New Features

The following features have been fully implemented and integrated:

1. **User Request Rating System** - Users can rate completed requests (Excellent, Good, Bad)
2. **Security Questions for Password Recovery** - Users set security questions during signup and can use them to reset forgotten passwords
3. **Forgot Password Feature** - Alternative password recovery method using security questions
4. **Request Status Updates** - Admins can update request status to: Raised, In Progress, Needs Clarification, Completed, Closed
5. **Admin Work Assignment** - Senior admins can assign requests to other admins with notifications
6. **User Request Details Page** - Users can view their request details, history, and rate completed requests

---

## Database Schema Changes

### New Tables Added

#### 1. `security_questions`
```sql
CREATE TABLE public.security_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- Stores predefined security questions for password recovery
- 10 default questions are pre-populated

#### 2. `user_security_answers`
```sql
CREATE TABLE public.user_security_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  question_id UUID NOT NULL REFERENCES public.security_questions(id),
  answer_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);
```
- Stores hashed security question answers for each user
- One answer per question per user
- Answers are hashed using bcryptjs for security

#### 3. `admin_work_assignments`
```sql
CREATE TABLE public.admin_work_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id),
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_to UUID NOT NULL REFERENCES public.profiles(id),
  assignment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- Tracks work assignments between admins
- Maintains assignment status and history

#### 4. `admin_notifications`
```sql
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- Sends notifications to admins about work assignments and updates

#### 5. `request_ratings` (Previously Added)
- Already present in the database
- Stores user ratings for completed requests

#### 6. `request_status_history` (Previously Added)
- Already present in the database
- Tracks all status changes for requests

### Schema Modifications

Added new columns to `service_requests` table:
```sql
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS work_assigned_to UUID REFERENCES public.profiles(id);
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES public.profiles(id);
```

---

## Backend Implementation

### Services Created

#### 1. `src/services/securityQuestions.ts`
Manages security question operations:
- `getAllQuestions()` - Retrieves all available security questions
- `setUserAnswers(userId, answers)` - Sets hashed security answers for a user
- `getUserSecurityQuestions(userId)` - Gets user's security questions for password reset
- `verifySecurityAnswer(userId, questionId, answer)` - Verifies security answer with bcrypt
- `hasSecurityAnswers(userId)` - Checks if user has set security answers

#### 2. `src/services/adminWorkAssignment.ts`
Manages admin work assignments:
- `assignWork(requestId, assignedById, assignedToId, notes)` - Assigns work to another admin
- `getAdminAssignments(adminId, status?)` - Gets work assignments for an admin
- `updateAssignmentStatus(assignmentId, status, adminId)` - Updates assignment status
- `getRequestAssignments(requestId)` - Gets all assignments for a request
- `getAdminNotifications(adminId, unreadOnly?)` - Retrieves admin notifications
- `markNotificationAsRead(notificationId)` - Marks notification as read

### API Routes

#### 1. Auth Routes (`src/routes/auth.ts`)

**New Endpoints:**

- `GET /api/auth/security-questions`
  - Returns all available security questions
  - No authentication required

- `POST /api/auth/security-answers`
  - Sets user's security question answers
  - Requires authentication
  - Body: `{ answers: [{ questionId, answer }, ...] }`

- `GET /api/auth/forgot-password/questions/:email`
  - Returns security questions for a given email
  - No authentication required

- `POST /api/auth/forgot-password/verify-questions`
  - Verifies security answers and sends password reset link
  - Body: `{ email, answers: [{ questionId, answer }, ...] }`

#### 2. Requests Routes (`src/routes/requests.ts`)

**New Endpoints:**

- `POST /api/requests`
  - Create a new service request
  - Requires authentication

- `GET /api/requests`
  - Get all requests (users see own, admins see all)
  - Requires authentication

- `GET /api/requests/:requestId`
  - Get a single request
  - Requires authentication

- `POST /api/requests/:requestId/rate`
  - Rate a completed request
  - Requires authentication
  - Body: `{ rating: 'excellent'|'good'|'bad', comments?: string }`

- `GET /api/requests/:requestId/ratings`
  - Get ratings for a request
  - Requires authentication

- `PUT /api/requests/:requestId/status`
  - Update request status (admin only)
  - Body: `{ status, message?, requiresUserFeedback?: boolean }`

- `GET /api/requests/:requestId/history`
  - Get request status history
  - Requires authentication

#### 3. Admin Routes (`src/routes/admin.ts`)

**New Route: `/api/admin/*`**

- `POST /api/admin/assign-work`
  - Assign work to another admin
  - Requires admin authentication
  - Body: `{ requestId, assignedToId, notes? }`

- `GET /api/admin/assignments`
  - Get admin's work assignments
  - Query params: `status?` (pending|accepted|completed|rejected)

- `PUT /api/admin/assignments/:assignmentId/status`
  - Update assignment status
  - Body: `{ status }`

- `GET /api/admin/notifications`
  - Get admin notifications
  - Query params: `unreadOnly?` (true|false)

- `PUT /api/admin/notifications/:notificationId/read`
  - Mark notification as read

---

## Frontend Implementation

### New Pages

#### 1. `app/auth/forgot-password/page.tsx`
Multi-step password recovery process:
- Step 1: Enter email
- Step 2: Answer security questions
- Step 3: Set new password
- Step 4: Success confirmation

**Features:**
- Security question validation
- Email verification
- Password strength checking
- Secure token-based reset

#### 2. `app/user/review-request/[id]/page.tsx`
User request review and rating page:
- Display full request details
- Show request status and priority
- Display status history with timeline
- Rate completed requests
- Re-open request option

#### 3. `app/admin/allocate-work/page.tsx`
Admin work allocation interface:
- Search and filter requests
- Select recipient admin
- Add assignment notes
- Real-time allocation confirmation

#### 4. Updated `app/admin/update-status/page.tsx`
Enhanced status update interface:
- Search pending requests
- Select new status (Raised, In Progress, Needs Clarification, Completed, Closed)
- Add messages to users
- Real-time feedback

#### 5. Updated `app/auth/login/page.tsx`
- Added "Forgot Password?" link
- Redirects to forgot-password page

#### 6. Updated `app/auth/signup/page.tsx`
- Added security questions setup step
- Occurs after profile creation
- Integrated with new security questions component

### New Components

#### 1. `components/security-questions-setup.tsx`
Reusable component for setting security questions:
- Dynamically fetches available questions
- Allows users to select 3 different questions
- Validates all questions are answered
- Prevents duplicate question selection

#### 2. `components/rate-request.tsx`
Request rating component:
- Star-based rating system (Excellent, Good, Bad)
- Optional comments field
- Real-time submission with feedback
- Success confirmation

---

## Feature Workflows

### User: Password Recovery via Security Questions

1. User clicks "Forgot Password" on login page
2. Enters email address
3. System retrieves security questions associated with that email
4. User answers all security questions
5. System verifies answers against stored hashes
6. If correct, system sends password reset link to email
7. User clicks link and sets new password
8. Password reset confirmed

### User: Rating a Completed Request

1. User navigates to completed request
2. Request shows "Rate This Request" button
3. User selects rating (Excellent, Good, Bad)
4. User optionally adds comments
5. Rating is submitted to backend
6. Admin can see ratings for analysis

### Admin: Assigning Work to Other Admins

1. Admin navigates to "Allocate Work" page
2. Admin searches/filters for requests
3. Admin selects target request
4. Admin chooses admin to assign work to
5. Admin optionally adds assignment notes
6. System creates work assignment
7. Assigned admin receives notification
8. Request status updates to "In Progress"

### Admin: Updating Request Status

1. Admin navigates to "Update Status" page
2. Admin searches/filters for requests
3. Admin selects a request
4. Admin chooses new status from dropdown
5. Admin optionally adds message to user
6. System updates status
7. Status history is logged
8. User receives email notification

---

## Security Considerations

### Password Recovery
- Security answers are hashed using bcryptjs (10 salt rounds)
- Case-insensitive answer matching
- Answers are trimmed of whitespace
- Password reset tokens expire after 1 hour
- One-time use tokens that are marked as used

### Data Protection
- All endpoints with user data require authentication
- Role-based access control (admin vs user)
- Row-level security policies on all tables
- Sensitive fields (answer hashes) are never exposed

### Input Validation
- Email validation on all endpoints
- Password length minimum (8 characters)
- Security questions must be selected
- Answers are required and trimmed

---

## Environment Variables Required

Add to your `.env.local` or `.env`:

```env
# Backend
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
FRONTEND_URL=http://localhost:3000
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Testing Checklist

### User Features
- [ ] User can set security questions during signup
- [ ] User can see "Forgot Password?" link on login
- [ ] User can recover password using security questions
- [ ] User can view their requests
- [ ] User can view request details and history
- [ ] User can rate completed requests (Excellent, Good, Bad)
- [ ] User receives email when request status changes

### Admin Features
- [ ] Admin can view all requests
- [ ] Admin can update request status
- [ ] Admin can add messages when updating status
- [ ] Admin can assign work to other admins
- [ ] Admin receives notifications for work assignments
- [ ] Admin can view work assignments
- [ ] Admin can see request ratings

### Integration Tests
- [ ] Complete user signup with security questions flow
- [ ] Complete password recovery workflow
- [ ] Complete request status update with email notification
- [ ] Complete admin work assignment with notification

---

## Database Migration Steps

1. Run the SQL migration:
   ```bash
   # If using Supabase dashboard
   # Go to SQL Editor and paste contents of:
   # backend/db/004_add_security_questions_and_admin_features.sql
   
   # Or using CLI (if available)
   supabase db push
   ```

2. Verify tables are created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema='public';
   ```

3. Verify security questions were inserted:
   ```sql
   SELECT COUNT(*) FROM public.security_questions;
   ```

---

## Deployment Notes

### Backend
1. Ensure all environment variables are set
2. Install dependencies: `npm install`
3. Build TypeScript: `npm run build`
4. Run migrations: Apply SQL migration file
5. Start server: `npm start` or `npm run dev`

### Frontend
1. Set environment variables in `.env.local`
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Start: `npm run dev`

---

## File Structure Summary

```
backend/
├── db/
│   └── 004_add_security_questions_and_admin_features.sql (NEW)
├── src/
│   ├── routes/
│   │   ├── auth.ts (UPDATED)
│   │   ├── requests.ts (UPDATED)
│   │   └── admin.ts (NEW)
│   ├── services/
│   │   ├── securityQuestions.ts (NEW)
│   │   └── adminWorkAssignment.ts (NEW)
│   └── server.ts (UPDATED)

frontend/
├── app/
│   ├── auth/
│   │   ├── forgot-password/page.tsx (NEW)
│   │   ├── login/page.tsx (UPDATED)
│   │   └── signup/page.tsx (UPDATED)
│   ├── admin/
│   │   ├── allocate-work/page.tsx (UPDATED)
│   │   └── update-status/page.tsx (UPDATED)
│   └── user/
│       └── review-request/[id]/page.tsx (NEW)
└── components/
    ├── security-questions-setup.tsx (NEW)
    └── rate-request.tsx (NEW)
```

---

## API Response Examples

### Get Security Questions
```json
[
  {
    "id": "uuid",
    "question": "What is your mother's maiden name?"
  },
  ...
]
```

### Rate Request Response
```json
{
  "id": "uuid",
  "request_id": "uuid",
  "user_id": "uuid",
  "rating": "excellent",
  "comments": "Great service!",
  "created_at": "2025-11-17T12:00:00Z",
  "message": "Rating submitted successfully"
}
```

### Assign Work Response
```json
{
  "id": "uuid",
  "request_id": "uuid",
  "assigned_by": "uuid",
  "assigned_to": "uuid",
  "status": "pending",
  "notes": "Please prioritize this",
  "created_at": "2025-11-17T12:00:00Z",
  "message": "Work assigned successfully"
}
```

---

## Troubleshooting

### Issue: Security questions not loading
- Check if SQL migration was applied
- Verify `security_questions` table exists
- Check API endpoint: `GET /api/auth/security-questions`

### Issue: Password reset token invalid
- Token expires after 1 hour
- Token can only be used once
- Check if email is correct before submitting

### Issue: Work assignment notifications not received
- Check if `admin_notifications` table exists
- Verify admin's email is correct
- Check email service configuration

### Issue: Security answers not matching
- Answers are case-insensitive
- Whitespace is trimmed
- Try exact answer including punctuation (if present)

---

## Future Enhancements

1. **SMS Notifications** - Send notifications via SMS in addition to email
2. **Two-Factor Authentication** - Add 2FA for additional security
3. **Audit Logging** - Log all admin actions for compliance
4. **Request Bulk Operations** - Admins can update multiple requests at once
5. **Advanced Analytics** - Dashboard showing request metrics and ratings
6. **Escalation System** - Auto-escalate requests not resolved in time
7. **Service Level Agreements** - Track SLA compliance per request
8. **Feedback Surveys** - Post-completion surveys for users

---

## Support & Documentation

For more information:
- See main README.md for project overview
- See QUICKSTART.md for setup instructions
- See API_TESTING_GUIDE.md for API testing
- Check SYSTEM_ARCHITECTURE.md for system design

---

Last Updated: November 17, 2025
Version: 1.0
