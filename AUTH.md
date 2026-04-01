# Authentication System Implementation ✅

## Overview

A complete JWT-based authentication system has been implemented with:
- User registration and login
- Secure password hashing with bcryptjs
- JWT token generation and verification
- Protected API routes
- Frontend forms and state management

---

## Backend API Endpoints

### Authentication Endpoints

#### 1. **Register** `POST /api/auth/register`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123",
  "role": "guest"  // or "host"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "guest",
    "createdAt": "2026-04-01T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (400):**
```json
{
  "error": "User with this email already exists" | "Password must be at least 6 characters"
}
```

---

#### 2. **Login** `POST /api/auth/login`
Authenticate with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "guest",
    "createdAt": "2026-04-01T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401):**
```json
{
  "error": "Invalid email or password"
}
```

---

#### 3. **Get Current User** `GET /api/auth/me` (Protected)
Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "guest",
  "createdAt": "2026-04-01T10:00:00Z"
}
```

---

#### 4. **Logout** `POST /api/auth/logout` (Protected)
Invalidate the current session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### 5. **Verify Token** `POST /api/auth/verify`
Check if a JWT token is valid.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "valid": true,
  "payload": {
    "userId": "uuid-string",
    "email": "user@example.com",
    "role": "guest",
    "iat": 1234567890,
    "exp": 1234654290
  }
}
```

---

## Protected Routes

These routes now require authentication:

- `POST /api/workspaces` - Create workspace (auto-sets ownerId)
- `POST /api/bookings` - Create booking (auto-sets guestId)
- `PATCH /api/bookings/:id/status` - Update booking status

**How to use:**
Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Frontend Features

### Authentication Components

#### 1. **LoginForm Component**
Located in `frontend/src/components/LoginForm.tsx`
- Email and password input fields
- Error handling and display
- Loading state during request
- Switch to signup form option

**Usage:**
```tsx
import { LoginForm } from '../components/LoginForm';

<LoginForm 
  onSuccess={() => window.location.href = '/workspaces'}
  onSwitchToSignup={() => setMode('signup')} 
/>
```

#### 2. **SignupForm Component**
Located in `frontend/src/components/SignupForm.tsx`
- Full name, email, password input
- Password confirmation validation
- Role selection (Guest/Host)
- Error handling
- Switch to login option

**Usage:**
```tsx
import { SignupForm } from '../components/SignupForm';

<SignupForm 
  onSuccess={() => window.location.href = '/'}
  onSwitchToLogin={() => setMode('login')} 
/>
```

#### 3. **Auth Page**
Located in `frontend/src/pages/Auth.tsx`
- Combines LoginForm and SignupForm
- Toggling between login and signup modes
- Full-page authentication interface

---

### Frontend State Management

**useUserStore** (Zustand store):
```typescript
const {
  user,              // Current user object or null
  token,             // JWT token stored in localStorage
  isAuthenticated,   // Boolean flag
  setUser,           // Update user object
  setToken,          // Update token + localStorage
  logout,            // Clear auth state
} = useUserStore();
```

**Automatic token persistence:**
- Token saved to localStorage on login/signup
- Token restored from localStorage on page reload
- Token automatically sent with all API requests

---

### API Service Integration

Updated API service with authentication:

```typescript
import { authService } from '../services/api';

// Register
await authService.register({
  email, name, password, role
});

// Login
await authService.login({ email, password });

// Logout
await authService.logout();

// Get current user
await authService.getMe();

// Verify token
await authService.verify(token);
```

**Automatic token injection:**
All API requests automatically include the Authorization header:
```typescript
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### Navigation & Protected Routes

**Routes:**
- `/` - Home (public)
- `/auth` - Login/Signup (public, redirects home if logged in)
- `/workspaces` - Browse workspaces (public)
- `/my-bookings` - My bookings (protected)
- `/my-workspaces` - My workspaces (protected, hosts only)

**ProtectedRoute Component:**
```tsx
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useUserStore(s => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/auth" />;
};
```

---

### Header Component Updates

The header now shows:
- User name and role badge when logged in
- Logout button for authenticated users
- Login button for guests
- Role-based navigation (e.g., "My Workspaces" for hosts)

---

## Testing the Authentication System

### Test 1: Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "role": "guest"
  }'
```

Save the returned `token` for testing protected routes.

### Test 2: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test 3: Get Current User (Protected)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 4: Create Workspace (Protected)
```bash
curl -X POST http://localhost:3000/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Modern Office",
    "description": "Great workspace",
    "location": "NYC",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "capacity": 20,
    "hourlyRate": 50,
    "amenities": ["WiFi", "Parking"],
    "images": []
  }'
```

---

## Security Features

### Password Security
- Passwords hashed with bcryptjs (10 salt rounds)
- Plain passwords never stored in database
- Original password discarded after hashing

### JWT Security
- Tokens expire in 7 days
- Token payload includes user ID, email, and role
- Tokens verified on every protected request
- Secret key stored in environment variable

### Protected Routes
- All write operations (POST, PATCH, DELETE) on critical resources require authentication
- User ID automatically injected from token
- Cannot manipulate other users' data

### Data Protection
- Password hashes never returned to client
- Sensitive information filtered in responses
- Only necessary user data exposed in API

---

## Files Modified/Created

### Backend
- ✅ `/backend/src/services/auth.ts` - Authentication logic
- ✅ `/backend/src/routes/auth.ts` - Auth endpoints
- ✅ `/backend/src/routes/index.ts` - Updated with auth middleware
- ✅ `/backend/src/database/schema.ts` - Users table

### Frontend
- ✅ `/frontend/src/components/LoginForm.tsx` - Login UI
- ✅ `/frontend/src/components/SignupForm.tsx` - Signup UI
- ✅ `/frontend/src/pages/Auth.tsx` - Auth page
- ✅ `/frontend/src/services/api.ts` - API with auth
- ✅ `/frontend/src/stores/index.ts` - Auth state
- ✅ `/frontend/src/components/Header.tsx` - User nav
- ✅ `/frontend/src/App.tsx` - Routing & protection

---

## Next Steps

1. **Test the system** - Visit http://localhost:3001/auth
2. **Try signing up** - Create an account
3. **Try logging in** - Test login
4. **Create a workspace** - Authenticated workspace creation
5. **Make a booking** - Place a booking with owned workspace

---

## Environment Variables Required

```env
JWT_SECRET=dev_secret_key_change_in_production
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marketplace_db
```

Change `JWT_SECRET` to a strong random key in production!

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
├─────────────────────────────────────────────────────────┤
│  LoginForm / SignupForm                                 │
│         ↓                                               │
│  Zustand Store (useUserStore)                          │
│    - user, token, isAuthenticated                      │
│         ↓                                               │
│  API Service (with Interceptor)                        │
│    - Auto-attach Authorization header                  │
│         ↓                                               │
│  Protected Routes (ProtectedRoute wrapper)             │
│                                                         │
└─────────────────────────────────────────────────────────┘
                      ↓ HTTP
┌─────────────────────────────────────────────────────────┐
│                      Backend                             │
├─────────────────────────────────────────────────────────┤
│  Auth Routes                                            │
│    - /register, /login, /me, /logout, /verify         │
│         ↓                                               │
│  Auth Middleware (authMiddleware)                      │
│    - Extract & verify JWT from header                  │
│    - Attach userId to request                          │
│         ↓                                               │
│  Protected Endpoints                                   │
│    - Auto-populate userId/ownerId/guestId             │
│         ↓                                               │
│  Auth Service                                          │
│    - Hash passwords (bcryptjs)                         │
│    - Generate/verify tokens (JWT)                      │
│    - Query users (PostgreSQL)                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Success Checklist

- ✅ Backend authentication routes
- ✅ Frontend login/signup forms
- ✅ JWT token generation and verification
- ✅ Protected API routes
- ✅ State management
- ✅ Protected React routes
- ✅ Automatic token persistence
- ✅ Error handling

**Ready for next feature!** 🚀
