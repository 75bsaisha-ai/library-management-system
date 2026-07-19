# Authentication Pages - Implementation Guide

This document covers the Login and Register pages added to the Library Management System.

## Overview

Two new authentication pages have been created:

1. **Login Page** (`src/pages/Login.tsx`) - User sign-in interface
2. **Register Page** (`src/pages/Register.tsx`) - New user account creation

Both pages are accessible without the sidebar navigation and use a centered card design with decorative ambient lighting.

## Features

### Register Page

**Form Fields:**
- **Full Name** - Text input for user's name
- **Email Address** - Email validation with standard email format check
- **Password** - Secured password field with:
  - Real-time password strength indicator
  - Visual checklist of requirements (8+ chars, uppercase, lowercase, numbers)
  - Toggle button to show/hide password
  - Requirements validation: minimum 8 characters, at least one uppercase, one lowercase, and one number
- **Confirm Password** - Verify password matches

**Features:**
- ✅ Real-time password strength visualization (weak/good/strong)
- ✅ Password requirement checklist with visual feedback
- ✅ Show/hide password toggle
- ✅ Form validation with Zod schema
- ✅ Loading state during submission
- ✅ Link to Sign In page
- ✅ Responsive design that works on mobile, tablet, desktop
- ✅ Dark/light theme support
- ✅ Toast notifications for success/error states

### Login Page

**Form Fields:**
- **Email Address** - Email input with validation
- **Password** - Password field with show/hide toggle
- **Remember Me** - Checkbox to persist login session
- **Forgot Password** - Link placeholder for password recovery

**Features:**
- ✅ Clean, intuitive form layout
- ✅ Form validation with Zod schema
- ✅ Show/hide password toggle
- ✅ Remember me functionality
- ✅ Link to registration page
- ✅ Features showcase below login form
- ✅ Loading state during submission
- ✅ Toast notifications
- ✅ Responsive design

## Design System

Both pages follow the existing Library Management System design:

- **Typography:** 
  - Serif font (Cormorant Garamond) for headings
  - Sans font (Instrument Sans) for body text
  - Monospace font for technical inputs (email, password)

- **Colors:**
  - Primary color (#7c3aed) for active elements
  - Destructive color for errors
  - Emerald for success states
  - Dark theme by default with light mode support

- **Components:**
  - Glass-morphism card panels
  - Rounded-small borders (rounded-sm)
  - Ambient light decorative elements
  - Tailwind CSS 4 for styling

## API Integration

### Current Status
Both pages have **TODO** comments where API calls should be integrated:

**Register.tsx (Line ~73):**
```tsx
// TODO: Replace with actual API call to useCreateUser or similar
// const response = await createUser.mutate({ data: { name: data.name, email: data.email, password: data.password } });
```

**Login.tsx (Line ~41):**
```tsx
// TODO: Replace with actual API call to useLogin or similar
// const response = await login.mutate({ email: data.email, password: data.password });
// Store token in localStorage if rememberMe is checked
```

### Next Steps to Connect API

You'll need to:

1. **Generate API hooks** from your OpenAPI schema:
   - `useCreateUser` or `useRegister` for registration
   - `useLogin` for authentication

2. **Update Register.tsx:**
   ```tsx
   import { useCreateUser } from "@workspace/api-client-react";
   
   const createUser = useCreateUser();
   
   const onSubmit = async (data: RegisterFormData) => {
     createUser.mutate(
       { data: { name: data.name, email: data.email, password: data.password } },
       {
         onSuccess: (response) => {
           toast({ title: "Registration Successful", description: "Welcome to Folio!" });
           setLocation("/login");
         },
         onError: (error) => {
           toast({ 
             title: "Registration Failed", 
             description: error?.response?.data?.error || "Please try again",
             variant: "destructive" 
           });
         }
       }
     );
   };
   ```

3. **Update Login.tsx:**
   ```tsx
   import { useLogin } from "@workspace/api-client-react";
   
   const login = useLogin();
   
   const onSubmit = async (data: LoginFormData) => {
     login.mutate(
       { data: { email: data.email, password: data.password } },
       {
         onSuccess: (response) => {
           // Store auth token
           if (data.rememberMe) {
             localStorage.setItem('authToken', response.token);
           }
           sessionStorage.setItem('authToken', response.token);
           
           toast({ title: "Login Successful", description: "Welcome back!" });
           setLocation("/");
         },
         onError: () => {
           toast({ 
             title: "Login Failed", 
             description: "Invalid email or password",
             variant: "destructive" 
           });
         }
       }
     );
   };
   ```

## Routing

The authentication pages are integrated into the router with special handling:

**App.tsx:**
```tsx
<Switch>
  <Route path="/login" component={Login} />
  <Route path="/register" component={Register} />
  <Route>
    {() => (
      <AppLayout>
        {/* Other routes wrapped in AppLayout */}
      </AppLayout>
    )}
  </Route>
</Switch>
```

This ensures:
- Login/Register pages render **without** the sidebar
- Other pages render **with** the sidebar via AppLayout
- Seamless transition between authenticated and unauthenticated states

## Validation Rules

### Register Form
- **Name:** Minimum 2 characters
- **Email:** Valid email format
- **Password:** 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Confirm Password:** Must match password field

### Login Form
- **Email:** Valid email format
- **Password:** Required (minimum 1 character)

All validation is handled by Zod with real-time feedback.

## Password Strength Indicator

The register page includes a visual password strength system:

**Strength Criteria:**
1. At least 8 characters
2. One uppercase letter (A-Z)
3. One lowercase letter (a-z)
4. One number (0-9)

**Visual Feedback:**
- Progress bar with 4 segments (one per criteria)
- Each segment lights up in green when criteria is met
- Strength label: "Weak" (1-2 criteria), "Good" (3 criteria), "Strong" (4 criteria)
- Checklist below showing detailed requirements

## Theme Support

Both pages automatically support the system's dark/light theme via `next-themes`:
- Default theme: Dark
- Theme toggle available in sidebar (on authenticated pages)
- System prefers-color-scheme support disabled in favor of explicit theme selection

## Accessibility

- ✅ Semantic HTML structure
- ✅ Proper form labels associated with inputs
- ✅ Error messages with ARIA alerts
- ✅ High contrast text
- ✅ Keyboard navigable
- ✅ Show/hide password buttons with clear labels

## Responsive Design

Both pages are fully responsive:
- **Mobile:** Full-width card, single column layout
- **Tablet:** Centered container, optimized spacing
- **Desktop:** Max-width container (448px), centered with padding

## Future Enhancements

Consider adding:

1. **Social Login** - OAuth integration (Google, GitHub, etc.)
2. **Email Verification** - Send verification email on registration
3. **Password Reset** - Implement forgot password flow
4. **Two-Factor Authentication** - Add 2FA for security
5. **User Profile Picture** - Avatar upload
6. **Session Management** - Auto-logout on inactivity
7. **Audit Logging** - Track login attempts
8. **Rate Limiting** - Prevent brute force attacks

## Testing

To test the pages:

1. **Navigate to:** `http://localhost:3000/register`
2. **Fill in form** with valid data
3. **Check password strength** indicator as you type
4. **Submit to see** loading state and toast notification
5. **Try validation** by submitting invalid data
6. **Click "Sign in"** link to go to login page
7. **Test login page** similarly

## File Structure

```
src/pages/
├── Login.tsx           # Login page component
├── Register.tsx        # Registration page component
├── Dashboard.tsx       # (existing)
├── Books.tsx           # (existing)
└── ... (other pages)
```

## Dependencies Used

These pages use existing dependencies already in package.json:
- `react` - UI library
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers/zod` - Zod resolver for React Hook Form
- `lucide-react` - Icons (Eye, EyeOff, Check, X, Library, CheckCircle2)
- `next-themes` - Theme management
- shadcn/ui components - Pre-built UI components
- `tailwindcss` - Utility-first CSS

No new dependencies need to be installed.

## Common Issues & Solutions

**Issue:** "Cannot find module" errors
- **Solution:** These are type-checking warnings. They disappear when you run `npm run dev`

**Issue:** Page styling looks different than expected
- **Solution:** Make sure Tailwind CSS and theme are properly configured in `index.css`

**Issue:** Form not submitting
- **Solution:** Replace the TODO API calls with actual API integration (see API Integration section)

**Issue:** Toast notifications not showing
- **Solution:** Ensure `<Toaster />` is rendered in App.tsx (it is)

## Support

For questions or issues with these authentication pages, refer to:
- Existing `.github/copilot-instructions.md` for project conventions
- `FRONTEND.md` for technical stack details
- Individual component comments in Register.tsx and Login.tsx
