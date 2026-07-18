# Quick Reference - Authentication System

## 🚀 Quick Start

### For Frontend Developers:
```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build
```

Then navigate to:
- **Login:** http://localhost:5173/login
- **Register:** http://localhost:5173/register
- **Forgot Password:** http://localhost:5173/forgot-password
- **Dashboard (Protected):** http://localhost:5173/ (redirects to login if not authenticated)
- **Profile (Protected):** http://localhost:5173/profile (redirects to login if not authenticated)

---

## 📁 File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Global auth state & hooks
├── components/
│   ├── PrivateRoute.tsx          # Route protection wrapper
│   └── layout/
│       └── Sidebar.tsx           # Updated with auth controls
├── pages/
│   ├── Login.tsx                 # Login page (integrated)
│   ├── Register.tsx              # Registration page (integrated)
│   ├── ForgotPassword.tsx        # 4-step password reset
│   ├── Profile.tsx               # User profile management
│   └── ... other pages
└── App.tsx                       # Router with all routes

API_ENDPOINTS.md                  # Complete API documentation
AUTHENTICATION_IMPLEMENTATION.md  # Implementation details
```

---

## 🔑 Using the Auth System

### In Components:
```tsx
import { useAuth } from "@/contexts/AuthContext";

export function MyComponent() {
  const { user, token, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <p>Please log in</p>;
  
  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes:
```tsx
// In App.tsx (already done)
<Route path="/protected">
  {() => (
    <PrivateRoute>
      <ProtectedComponent />
    </PrivateRoute>
  )}
</Route>
```

---

## 🌐 API Endpoints Ready

All endpoints configured to call:

### Auth Endpoints:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/verify-reset-code`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`

### User Endpoints:
- `PUT /api/users/profile`

See `API_ENDPOINTS.md` for full documentation.

---

## 🎨 Design Features

- ✅ Glass-morphism UI with blur effects
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark/light theme support
- ✅ Real-time password strength indicators
- ✅ Toast notifications for feedback
- ✅ Form validation with Zod
- ✅ Loading states and error handling

---

## 🔐 Authentication Flow

### Login:
1. User enters email/password
2. Optional "Remember Me" checkbox
3. Frontend calls `POST /api/auth/login`
4. Backend returns JWT token and user object
5. Token stored in localStorage (Remember Me) or sessionStorage
6. User redirected to dashboard

### Registration:
1. User fills registration form
2. Password strength validated (8+ chars, uppercase, lowercase, number)
3. Frontend calls `POST /api/auth/register`
4. Backend creates user and returns token
5. User automatically logged in and redirected to dashboard

### Password Reset:
1. **Step 1:** User enters email → calls `POST /api/auth/request-password-reset`
2. **Step 2:** User enters 6-digit code → calls `POST /api/auth/verify-reset-code`
3. **Step 3:** User enters new password → calls `POST /api/auth/reset-password`
4. **Step 4:** Success confirmation → redirects to login

### Protected Pages:
1. User tries to access `/profile` without authentication
2. PrivateRoute component checks `isAuthenticated`
3. If not authenticated → redirects to `/login`
4. If authenticated → displays profile page

---

## 📝 Password Requirements

Frontend validates:
- ✓ Minimum 8 characters
- ✓ At least one UPPERCASE letter
- ✓ At least one lowercase letter
- ✓ At least one number (0-9)

Visual indicator shows progress:
- 🔴 Red: 0-2 requirements met
- 🟡 Amber: 3 requirements met
- 🟢 Green: All 4 requirements met

---

## 💾 Storage Strategy

### With "Remember Me" ✓:
- Token stored in `localStorage`
- Persists across browser sessions
- Restored automatically on page load

### Without "Remember Me":
- Token stored in `sessionStorage`
- Cleared when browser tab closes
- Also persists through page refresh (but not browser restart)

### On Logout:
- All tokens cleared from both storages
- User object removed
- Redirected to login page

---

## ⚠️ Error Handling

All API calls include error handling:
- Network errors → "Connection failed"
- 400 errors → Specific error message from API
- 401 errors → "Unauthorized" or "Invalid credentials"
- 500 errors → "Server error"

Users notified via toast notifications.

---

## 🧪 Testing Checklist

- [ ] Register new account
- [ ] Login with registered account
- [ ] Verify "Remember Me" works
- [ ] Access protected page without login (should redirect)
- [ ] Access protected page with login (should display)
- [ ] Test password reset flow
- [ ] Test edit profile
- [ ] Test change password
- [ ] Test logout
- [ ] Verify dark/light theme works
- [ ] Test on mobile viewport

---

## 🔧 Backend Integration Checklist

- [ ] Implement `/api/auth/login`
- [ ] Implement `/api/auth/register`
- [ ] Implement `/api/auth/request-password-reset`
- [ ] Implement `/api/auth/verify-reset-code`
- [ ] Implement `/api/auth/reset-password`
- [ ] Implement `/api/auth/change-password`
- [ ] Implement `PUT /api/users/profile`
- [ ] Setup database with users table
- [ ] Add email service for password reset codes
- [ ] Configure CORS for frontend origin
- [ ] Test with frontend

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Global auth state, login/register functions |
| `src/components/PrivateRoute.tsx` | Protects authenticated routes |
| `src/pages/Login.tsx` | Login UI and logic |
| `src/pages/Register.tsx` | Registration UI and logic |
| `src/pages/ForgotPassword.tsx` | 4-step password reset flow |
| `src/pages/Profile.tsx` | User profile & settings management |
| `src/App.tsx` | Router configuration with protected routes |
| `API_ENDPOINTS.md` | Complete backend API specification |

---

## 🎯 Next Steps

1. **Backend:** Implement all API endpoints (see API_ENDPOINTS.md)
2. **Testing:** Run through testing checklist above
3. **Deployment:** Build frontend with `npm run build`
4. **Monitoring:** Track auth errors and user sessions

---

## 💬 Common Issues & Solutions

### "Module not found" errors
- These are IDE warnings, not runtime errors
- Run `npm run dev` and they disappear
- Solution: Wait for npm install to complete

### Form not submitting
- Check console for validation errors
- Ensure all required fields are filled
- Verify backend API is responding

### Redirect not working
- Check that AuthProvider wraps entire app (it does in App.tsx)
- Verify PrivateRoute is properly wrapping pages
- Check browser dev tools for redirect loops

### Remember Me not working
- Verify browser allows localStorage
- Check privacy mode (uses sessionStorage instead)
- Verify token is being set correctly

---

## 📞 Support

For issues or questions:
1. Check error console in browser dev tools
2. Review API_ENDPOINTS.md for correct formats
3. Verify backend is running and responding
4. Check network tab in dev tools for API calls

---

**Status:** ✅ Complete and ready for backend integration
**Last Updated:** 2024
**Version:** 1.0
