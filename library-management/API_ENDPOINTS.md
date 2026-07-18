# Library Management System - API Endpoints Documentation

This document outlines all the API endpoints required by the frontend authentication and user management system.

## Base URL
All endpoints use the base path: `/api`

## Authentication Endpoints

### POST `/api/auth/login`
**Purpose:** Authenticate user with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "555-0123",
    "membershipType": "REGULAR",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (401/400):**
```json
{
  "message": "Invalid email or password"
}
```

---

### POST `/api/auth/register`
**Purpose:** Create a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (201):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "phone": null,
    "membershipType": "REGULAR",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Email already in use"
}
```

---

### POST `/api/auth/request-password-reset`
**Purpose:** Request password reset by sending verification code to email

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Reset code sent to email"
}
```

**Error Response (404):**
```json
{
  "message": "User not found"
}
```

---

### POST `/api/auth/verify-reset-code`
**Purpose:** Verify password reset code sent to user's email

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "token": "reset_token_here",
  "message": "Code verified successfully"
}
```

**Error Response (400):**
```json
{
  "message": "Invalid or expired verification code"
}
```

---

### POST `/api/auth/reset-password`
**Purpose:** Reset user password after verification

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "reset_token_from_verification",
  "password": "NewSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Error Response (400):**
```json
{
  "message": "Invalid reset token or expired"
}
```

---

## User Endpoints

### PUT `/api/users/profile`
**Purpose:** Update user profile information

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "newemail@example.com",
  "phone": "555-0456"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "newemail@example.com",
  "phone": "555-0456",
  "membershipType": "REGULAR",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Response (401):**
```json
{
  "message": "Unauthorized"
}
```

**Error Response (400):**
```json
{
  "message": "Email already in use"
}
```

---

### POST `/api/auth/change-password`
**Purpose:** Change user password with current password verification

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "OldSecurePassword123",
  "newPassword": "NewSecurePassword456"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Response (401):**
```json
{
  "message": "Current password is incorrect"
}
```

**Error Response (400):**
```json
{
  "message": "Invalid password format"
}
```

---

## Implementation Notes

### Frontend Storage
- **Login with "Remember Me":** Token stored in `localStorage` for persistent login
- **Login without "Remember Me":** Token stored in `sessionStorage` for session-only login
- **Token Cleanup:** All tokens and user data cleared on logout

### Password Requirements
The frontend validates passwords against these requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

### Error Handling
All error responses should return appropriate HTTP status codes:
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (invalid credentials, expired token)
- `404` - Not Found (user/resource doesn't exist)
- `500` - Server Error (unexpected issues)

### CORS
Ensure CORS headers are properly configured to allow requests from the frontend origin.

### Rate Limiting (Recommended)
Implement rate limiting on authentication endpoints to prevent brute force attacks:
- Login endpoint: 5 attempts per minute per IP
- Password reset request: 3 attempts per hour per email
- Verification code verification: 10 attempts per 15 minutes

### Token Format
JWTs should include:
- User ID in claims
- Expiration time (recommended: 24 hours)
- Issue time
- Optional: refresh token for long-lived sessions

---

## Testing Endpoints

You can test these endpoints using curl, Postman, or similar tools:

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Test Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

---

## Frontend Implementation Reference

The frontend makes these API calls from:
- **AuthContext.tsx**: Login, Register
- **ForgotPassword.tsx**: Request Reset, Verify Code, Reset Password
- **Profile.tsx**: Update Profile, Change Password

All API calls are made using the Fetch API with proper error handling and user notifications via toast messages.
