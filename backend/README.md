# Citizen Request Management System - Backend

A Node.js/Express backend server with MongoDB for the Citizen Request Management System.

## Setup Instructions

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   copy .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string (e.g., mongodb://localhost:27017/citizen-requests)
   - `JWT_SECRET`: A secure secret key for JWT tokens
   - `PORT`: Server port (default: 5000)

5. Make sure MongoDB is running on your system

6. Start the server:
   ```bash
   npm start
   ```
   
   Or with nodemon for development:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/user/register` - Register as a citizen
- `POST /api/auth/user/login` - Login as citizen
- `POST /api/auth/admin/register` - Register as admin
- `POST /api/auth/admin/login` - Login as admin

### User Routes
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Admin Routes
- `GET /api/admins/profile` - Get admin profile
- `PUT /api/admins/profile` - Update admin profile
- `GET /api/admins/department` - Get all admins in same department

### Request Routes
- `POST /api/requests/create` - Create new request
- `GET /api/requests/user/all` - Get all user requests
- `GET /api/requests/user/:status` - Get requests by status
- `GET /api/requests/:id` - Get single request details
- `GET /api/requests/admin/raised` - Get raised requests for admin's department
- `GET /api/requests/admin/assigned` - Get requests assigned to admin
- `PUT /api/requests/:id/allocate` - Allocate request to another admin
- `PUT /api/requests/:id/status` - Update request status
- `POST /api/requests/:id/alarm` - Send alarm for request
- `PUT /api/requests/:id/close` - Close request
- `GET /api/requests/help/recent` - Get recent requests for help section

## Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- JWT (JSON Web Tokens)
- bcryptjs (Password hashing)
- CORS

## Database Models

### User Schema
- name, email, password, address, state, city, phone
- userType (default: 'user')
- createdAt, updatedAt

### Admin Schema
- name, email, password, department, phone, designation
- userType (default: 'admin')
- createdAt, updatedAt

### Request Schema
- userId (reference to User)
- title, description, department
- images (array of image URLs)
- status (raised, in-progress, completed, closed, clarification-needed)
- allocatedTo (reference to Admin)
- priority (low, medium, high)
- statusUpdates (array of status change records)
- alarms (array of alarm records)
- createdAt, updatedAt

## Notes

- All passwords are hashed using bcryptjs before storage
- JWT tokens expire after 7 days
- CORS is enabled for frontend communication
- Request descriptions are limited to 150 characters
- Departments: electricity, water, agriculture, law, medical, services

