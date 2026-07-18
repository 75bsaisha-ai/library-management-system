# Development Testing Checklist & Guide

## 🧪 Testing Scenarios

### 1. Authentication Flow Tests

#### 1.1 User Registration
- [ ] Navigate to `/register`
- [ ] Fill form with valid data (name, email, password)
- [ ] Verify password strength indicator updates in real-time
- [ ] Submit form
- [ ] Verify success toast notification
- [ ] Verify redirects to dashboard (`/`)
- [ ] Verify user is logged in (check sidebar for user name/email)
- [ ] Verify token stored in sessionStorage

#### 1.2 User Registration - Error Cases
- [ ] Try registering with existing email → should show error
- [ ] Try registering with weak password (< 8 chars) → button disabled
- [ ] Try registering without all required fields → validation errors
- [ ] Fill mismatched passwords → error message displayed
- [ ] Close browser tab and reopen → user should be logged out

#### 1.3 User Login
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Check "Remember Me" checkbox
- [ ] Submit form
- [ ] Verify success toast notification
- [ ] Verify redirects to dashboard
- [ ] Verify token stored in localStorage (persistent)
- [ ] Close browser completely and reopen → user still logged in
- [ ] Verify sidebar shows user info

#### 1.4 User Login - Error Cases
- [ ] Try logging in with wrong password → error message
- [ ] Try logging in with non-existent email → error message
- [ ] Try logging in without "Remember Me" → token in sessionStorage
- [ ] Leave fields empty → validation error

---

### 2. Password Reset Flow Tests

#### 2.1 Forgot Password - Complete Flow
- [ ] Click "Forgot Password?" link from login page
- [ ] Enter email address → request sent
- [ ] Verify success toast: "Verification Code Sent"
- [ ] Move to verification step (6-digit code input)
- [ ] Enter verification code
- [ ] Verify code accepted → move to reset password step
- [ ] Enter new password with strength indicator
- [ ] Confirm new password matches
- [ ] Verify all 4 password strength indicators are green
- [ ] Submit password reset
- [ ] Verify success message and redirect to login
- [ ] Test login with new password

#### 2.2 Forgot Password - Error Scenarios
- [ ] Try verifying with wrong code → error message "Invalid code"
- [ ] Try submitting without entering code → validation error
- [ ] Try resetting password with weak password → strength indicator shows gaps
- [ ] Click back button to go between steps → navigation works
- [ ] Passwords don't match → error "Passwords must match"

#### 2.3 Forgot Password - Back Navigation
- [ ] Go through steps, then click back in step 2 → return to step 1
- [ ] Edit email in step 1 and re-send code
- [ ] Complete reset flow correctly

---

### 3. Protected Routes Tests

#### 3.1 Access Control
- [ ] Try accessing `/profile` without login → redirect to `/login`
- [ ] Try accessing `/` (dashboard) without login → redirect to `/login`
- [ ] Try accessing `/books` without login → redirect to `/login`
- [ ] Login successfully
- [ ] Access `/profile` → should display profile page
- [ ] Access `/` → should display dashboard
- [ ] Access `/books` → should display books page

#### 3.2 PrivateRoute Loading States
- [ ] Observe skeleton loading briefly when accessing protected page
- [ ] Verify page renders after loading
- [ ] Check browser dev tools - network request for auth check

---

### 4. Profile Management Tests

#### 4.1 Edit Profile
- [ ] Login and navigate to `/profile`
- [ ] Click "Edit Profile" button
- [ ] Modal opens with current profile data
- [ ] Modify name field
- [ ] Modify email field
- [ ] Modify phone field
- [ ] Click "Save" button
- [ ] Verify success toast notification
- [ ] Verify sidebar updates with new name immediately
- [ ] Refresh page → data persists
- [ ] Try saving with invalid email → error message

#### 4.2 Change Password
- [ ] From profile page, click "Change Password" button
- [ ] Modal opens with password form
- [ ] Try entering current password incorrectly → error
- [ ] Enter correct current password
- [ ] Enter weak new password → strength indicator shows gaps
- [ ] Enter strong new password with all requirements met
- [ ] Confirm password matches
- [ ] Click "Change Password" button
- [ ] Verify success toast notification
- [ ] Modal closes and form clears
- [ ] Try logging in with old password → should fail
- [ ] Login with new password → should succeed

#### 4.3 Member Info Display
- [ ] Profile page shows member information section
- [ ] Displays membership ID
- [ ] Displays membership type
- [ ] Displays account status
- [ ] Displays account created date

---

### 5. Logout Tests

#### 5.1 Basic Logout
- [ ] Login successfully
- [ ] Click logout button in sidebar
- [ ] Confirmation dialog appears
- [ ] Click "Cancel" → dialog closes
- [ ] Click logout button again
- [ ] Click "Confirm" in logout dialog
- [ ] Verify success toast: "Logged Out"
- [ ] Redirects to login page
- [ ] Verify all storage cleared (dev tools)
- [ ] Try accessing protected page → redirect to login

#### 5.2 Logout State Cleanup
- [ ] Login with "Remember Me" checked
- [ ] Logout
- [ ] Verify localStorage cleared
- [ ] Verify sessionStorage cleared
- [ ] Refresh page → still logged out
- [ ] Login without "Remember Me"
- [ ] Logout
- [ ] Verify all storage properly cleared

---

### 6. Form Validation Tests

#### 6.1 Password Strength Indicator
- [ ] Type password with 7 characters → shows 1/4 requirements
- [ ] Add uppercase letter → shows 2/4
- [ ] Add lowercase letter → shows 3/4
- [ ] Add number → shows 4/4 (green)
- [ ] Color progression: Red → Amber → Green
- [ ] Visual bars match checklist

#### 6.1 Real-time Validation
- [ ] Clear email field → error appears
- [ ] Clear password field → error appears
- [ ] Enter invalid email → error: "Invalid email"
- [ ] Enter valid email → error clears
- [ ] Fix all errors → submit button becomes enabled

---

### 7. Theme & Responsive Design Tests

#### 7.1 Dark/Light Theme
- [ ] Click theme toggle button
- [ ] All auth pages switch to light theme
- [ ] Backgrounds, text colors, borders update appropriately
- [ ] Click theme toggle again → returns to dark
- [ ] Theme persists on page refresh
- [ ] Theme persists on new pages within session

#### 7.2 Responsive Design - Mobile
- [ ] Open browser dev tools, set to iPhone 12 (390px)
- [ ] All pages display correctly
- [ ] Forms are full width with proper padding
- [ ] Buttons are large enough for touch (>44px)
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling

#### 7.3 Responsive Design - Tablet
- [ ] Set viewport to iPad (768px)
- [ ] All pages display correctly
- [ ] Multi-column layouts are appropriate
- [ ] Forms are properly sized
- [ ] Spacing is consistent

#### 7.4 Responsive Design - Desktop
- [ ] Set viewport to 1920px
- [ ] Page layouts use available space well
- [ ] Cards have appropriate max-widths
- [ ] Not stretched too wide

---

### 8. Error Handling Tests

#### 8.1 Network Errors
- [ ] Open browser dev tools Network tab
- [ ] Throttle network to "Slow 3G"
- [ ] Try logging in → should eventually succeed or show timeout error
- [ ] Set network to offline
- [ ] Try logging in → should show connection error
- [ ] Restore network → try again should work

#### 8.2 API Error Responses
- [ ] Backend returns 400 error → shows specific error message
- [ ] Backend returns 401 error → redirects to login
- [ ] Backend returns 500 error → shows server error message
- [ ] Check console for proper error logging

#### 8.3 Form Error Handling
- [ ] All required fields show validation errors if empty
- [ ] Email field shows error for invalid format
- [ ] Password fields show error if mismatched
- [ ] Phone field accepts valid phone formats

---

### 9. Session Management Tests

#### 9.1 Session Persistence
- [ ] Login with "Remember Me"
- [ ] Close browser completely
- [ ] Reopen and visit app → user still logged in
- [ ] Navigate to different pages → still logged in
- [ ] Refresh page → still logged in

#### 9.2 Session Cleanup
- [ ] Login without "Remember Me"
- [ ] Close browser tab (not entire browser)
- [ ] Reopen app → still logged in (different tab session)
- [ ] Close entire browser
- [ ] Reopen app → logged out

#### 9.3 Multiple Instances
- [ ] Open two browser tabs, both at login
- [ ] Log in first tab → tab 1 user is authenticated
- [ ] Go to protected page in tab 1 → works
- [ ] Go to protected page in tab 2 → redirects to login
- [ ] Log in tab 2 with different user
- [ ] Verify each tab maintains its own session

---

### 10. Accessibility Tests

#### 10.1 Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Enter/Space on buttons works
- [ ] Shift+Tab goes backwards
- [ ] No keyboard traps (can always tab forward)
- [ ] Focus indicators are visible

#### 10.2 Screen Reader Testing
- [ ] Use browser accessibility inspector
- [ ] All form labels properly associated
- [ ] Error messages are announced
- [ ] Button purposes are clear
- [ ] Page structure is semantic

#### 10.3 ARIA Labels
- [ ] Check form fields have proper labels
- [ ] Icons have aria-labels or titles
- [ ] Dialogs have proper roles
- [ ] Loading states are announced

---

## 🔧 Development Environment Setup

### Prerequisites:
```bash
# Node.js 18+ and npm
node --version  # Should be v18+
npm --version   # Should be v8+
```

### Initial Setup:
```bash
# Navigate to project
cd /path/to/library-management

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# http://localhost:5173
```

### Available Scripts:
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run typecheck    # Check TypeScript types
npm run lint         # Lint code (if configured)
```

---

## 📊 Performance Testing

### Browser DevTools Checklist:
- [ ] Check Network tab - API calls complete < 1 second
- [ ] Check Performance tab - Lighthouse score > 90
- [ ] Check Console - No errors or warnings
- [ ] Check Storage - Tokens stored correctly
- [ ] Check Application - No memory leaks with repeated login/logout

### Loading States:
- [ ] Skeleton loading displays while fetching
- [ ] Buttons are disabled during form submission
- [ ] Loading indicator shows during password reset
- [ ] No double-submissions possible

---

## 🐛 Common Issues & Debugging

### Issue: "Module not found" errors
**Solution:** These are IDE warnings. Run `npm run dev` - they disappear at runtime.

### Issue: Login not working
1. Check Network tab in DevTools
2. Verify `/api/auth/login` returns 200
3. Check response has `token` and `user` properties
4. Check browser console for errors

### Issue: Protected routes redirecting unexpectedly
1. Verify AuthProvider wraps entire app (check App.tsx)
2. Verify PrivateRoute wrapping protected pages
3. Check browser storage for token
4. Check console for useAuth errors

### Issue: Form validation not working
1. Verify Zod schemas are defined
2. Check react-hook-form integration
3. Verify zodResolver is used
4. Check browser console for validation errors

### Issue: Theme not persisting
1. Check localStorage for theme setting
2. Verify next-themes is properly configured
3. Check HTML element has correct class
4. Verify CSS variables are defined

---

## ✅ Final Verification Checklist

- [ ] All 10 test scenario categories passed
- [ ] No console errors
- [ ] No TypeScript type errors (`npm run typecheck`)
- [ ] All API calls working (Network tab shows 200 responses)
- [ ] Responsive design verified (mobile/tablet/desktop)
- [ ] Theme switching works
- [ ] Session persistence works
- [ ] Logout clears all data
- [ ] Password strength indicator accurate
- [ ] Error messages user-friendly
- [ ] Toast notifications appear
- [ ] Redirects work as expected
- [ ] No memory leaks

---

## 🚀 Deployment Readiness

Once all tests pass:

1. **Build:**
   ```bash
   npm run build
   ```

2. **Test Production Build:**
   ```bash
   npm run preview
   ```

3. **Verify:**
   - [ ] All pages load correctly
   - [ ] API calls work from production build
   - [ ] No console errors
   - [ ] Performance is acceptable

4. **Deploy to Server:**
   ```bash
   # Follow your deployment process
   ```

---

## 📝 Notes

- Backend API must be running on `http://localhost:3000` (or configured in VITE_API_URL)
- CORS must be properly configured for frontend origin
- All API endpoints must implement proper error responses
- Consider adding rate limiting on authentication endpoints
- Monitor auth errors in production

---

**Last Updated:** July 2026  
**Status:** Ready for testing
