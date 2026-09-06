# Route Protection & Logout Setup

## Changes Made

### 1. Middleware for Route Protection (`middleware.ts`)
- Created middleware to protect all `/admin/*` routes
- Redirects unauthenticated users to `/admin/login`
- Redirects authenticated users away from login page to `/admin/overview`
- Preserves the original URL in `from` query parameter for redirect after login

### 2. Logout Functionality (`components/admin/AdminSidebar.tsx`)
- Added `signOut` import from `next-auth/react`
- Updated logout button to call `signOut()` with callback to `/admin/login`
- Properly closes mobile menu before logout

### 3. Session Provider (`components/providers/SessionProvider.tsx`)
- Created SessionProvider wrapper component
- Wraps NextAuth's SessionProvider for client-side session management

### 4. Updated Admin Layout (`app/admin/(dashboard)/layout.tsx`)
- Wrapped admin dashboard with SessionProvider
- Ensures auth context is available throughout the dashboard

### 5. Enhanced Login Page (`app/admin/login/page.tsx`)
- Added redirect handling after successful login
- Reads `from` query parameter to redirect back to original requested page
- Falls back to `/admin/overview` if no redirect URL provided

### 6. Auth Configuration (`lib/auth.ts`)
- Added `NEXTAUTH_SECRET` configuration
- Ensures proper JWT signing and session security

## How It Works

### Protected Routes
1. User tries to access `/admin/overview` (or any admin route)
2. Middleware checks if user is authenticated
3. If not authenticated → redirect to `/admin/login?from=/admin/overview`
4. If authenticated → allow access

### Login Flow
1. User enters credentials on `/admin/login`
2. On successful login, redirect to URL from `from` parameter
3. If no `from` parameter, redirect to `/admin/overview`

### Logout Flow
1. User clicks logout button in sidebar
2. `signOut()` is called with `callbackUrl: "/admin/login"`
3. Session is cleared and user is redirected to login page

### Preventing Logged-in Users from Accessing Login
1. Authenticated user tries to access `/admin/login`
2. Middleware detects they're already logged in
3. Redirects to `/admin/overview`

## Environment Variables Required

Ensure `.env` file contains:
```
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

## Testing

1. **Test Protected Routes:**
   - Visit `http://localhost:3000/admin/overview` without logging in
   - Should redirect to `/admin/login?from=/admin/overview`

2. **Test Login:**
   - Enter valid credentials
   - Should redirect back to the originally requested page

3. **Test Logout:**
   - Click logout button in sidebar
   - Should redirect to `/admin/login`
   - Trying to access admin pages should redirect back to login

4. **Test Login Page Access When Authenticated:**
   - Log in successfully
   - Try to visit `/admin/login` directly
   - Should redirect to `/admin/overview`
