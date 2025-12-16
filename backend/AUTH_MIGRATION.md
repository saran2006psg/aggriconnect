# Authentication Migration Guide

## Overview

The AgriConnect backend has been migrated from custom JWT authentication to **Supabase Auth with OAuth 2.0**. This guide explains the changes and how to update your integration.

## What Changed

### Before (JWT Authentication)

```python
# Old: Custom JWT tokens with python-jose
from app.api.utils import create_access_token, verify_password, hash_password

# Login endpoint returned custom JWT
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}

# Dependencies used custom token verification
async def get_current_user(token: str = Depends(security)):
    payload = verify_token(token)
    return payload
```

### After (OAuth Authentication)

```python
# New: Supabase Auth with OAuth support
from supabase import Client

# Login endpoint returns Supabase session tokens
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "abc123...",
  "token_type": "bearer",
  "user": {...}
}

# Dependencies use Supabase token verification
async def get_current_user(token: str = Depends(security), db: Client = Depends(get_db)):
    user_response = db.auth.get_user(token)
    return user_response.user
```

## Changes Breakdown

### 1. Dependencies Removed

**requirements.txt** - Removed:
```
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

**requirements.txt** - Added:
```
gotrue==2.4.2  # Supabase Auth client
```

### 2. Authentication Routes Changed

#### Old Routes (JWT)

```python
# POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "consumer"
}

# POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# POST /api/v1/auth/logout
# (No body, client removes token)
```

#### New Routes (OAuth + Email/Password)

```python
# POST /api/v1/auth/signup (renamed from register)
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "consumer"
}

# POST /api/v1/auth/signin (renamed from login)
{
  "email": "user@example.com",
  "password": "password123"
}

# POST /api/v1/auth/oauth/{provider}
# Returns OAuth URL to redirect user

# POST /api/v1/auth/callback
# Handles OAuth callback and creates user profile

# POST /api/v1/auth/signout (renamed from logout)
# Signs out from Supabase

# POST /api/v1/auth/refresh
# Refreshes access token using refresh token
```

### 3. Files Modified

| File | Change |
|------|--------|
| `app/api/routes/auth.py` | Complete rewrite for OAuth + Supabase Auth |
| `app/dependencies.py` | Token verification now uses Supabase |
| `app/config.py` | Removed JWT settings, added OAuth config |
| `.env.example` | Removed JWT_SECRET, added OAuth instructions |
| `app/api/routes/users.py` | Updated to use CurrentUser instead of TokenPayload |
| `requirements.txt` | Removed python-jose & passlib, added gotrue |

### 4. Files Removed

```
app/api/utils/auth_utils.py  # JWT token functions no longer needed
```

The following functions are now handled by Supabase:
- `hash_password()` ❌ (Supabase handles password hashing)
- `verify_password()` ❌ (Supabase handles password verification)
- `create_access_token()` ❌ (Supabase generates tokens)
- `create_refresh_token()` ❌ (Supabase generates tokens)
- `verify_token()` ❌ (Use `db.auth.get_user(token)`)

### 5. User Model Changes

**CurrentUser** (in dependencies.py):
```python
class CurrentUser(BaseModel):
    id: str          # UUID from Supabase
    email: str
    role: str
    name: str
```

This replaces the old `TokenPayload` model.

### 6. Dependency Injection Changes

**Before:**
```python
from app.dependencies import get_current_user
from app.models.schemas import TokenPayload

@router.get("/me")
async def get_profile(current_user: TokenPayload = Depends(get_current_user)):
    user_id = str(current_user.sub)
    # ...
```

**After:**
```python
from app.dependencies import get_current_user, CurrentUser

@router.get("/me")
async def get_profile(current_user: CurrentUser = Depends(get_current_user)):
    user_id = current_user.id
    # ...
```

## Frontend Integration Changes

### Before (JWT)

```typescript
// Login
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { access_token } = await response.json();
localStorage.setItem('token', access_token);

// Use token
fetch('/api/v1/products', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

### After (OAuth + Supabase)

```typescript
// Option 1: Email/Password
const response = await fetch('/api/v1/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { access_token, refresh_token, user } = await response.json();
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);

// Option 2: OAuth (Google, GitHub, etc.)
const oauthResponse = await fetch('/api/v1/auth/oauth/google', {
  method: 'POST'
});

const { url } = await oauthResponse.json();
window.location.href = url;  // Redirect to Google login

// On callback (/auth/callback):
const params = new URLSearchParams(window.location.hash.substring(1));
const access_token = params.get('access_token');

await fetch('/api/v1/auth/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ access_token, refresh_token })
});

// Use token (same as before)
fetch('/api/v1/products', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

// Refresh token when expired
const refreshResponse = await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({ refresh_token })
});

const { access_token: newToken } = await refreshResponse.json();
```

## Database Changes

**No database schema changes required!**

The `users` table structure remains the same:
- `id` (UUID)
- `email` (string)
- `name` (string)
- `role` (string)
- `profile_image_url` (string, nullable)
- `is_verified` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Note:** The `password_hash` column is no longer used. Passwords are now managed by Supabase Auth.

## Migration Steps

### For Existing Users

**Option 1: Keep email/password login**
- Users can continue logging in with email/password
- Passwords now managed by Supabase Auth
- Users must re-register or reset password

**Option 2: Switch to OAuth**
- Users can link their existing account to OAuth providers
- Better UX with "Sign in with Google" etc.
- No password to remember

### For Developers

1. **Update dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Update .env file:**
   ```env
   # Remove these:
   # JWT_SECRET=...
   # JWT_ALGORITHM=...
   # JWT_EXPIRATION_MINUTES=...
   # REFRESH_TOKEN_EXPIRATION_DAYS=...
   
   # Add these (if using OAuth):
   FRONTEND_CALLBACK_URL=http://localhost:5173/auth/callback
   ```

3. **Configure OAuth providers in Supabase:**
   - Go to Supabase Dashboard
   - Navigate to Authentication → Providers
   - Enable and configure desired providers
   - See `OAUTH_SETUP_GUIDE.md` for details

4. **Update frontend code:**
   - Change `/auth/login` to `/auth/signin`
   - Change `/auth/register` to `/auth/signup`
   - Add OAuth buttons and flow
   - Implement token refresh logic
   - Store both access_token and refresh_token

5. **Test authentication:**
   - Test email/password signup
   - Test email/password signin
   - Test OAuth providers (Google, GitHub, etc.)
   - Test token refresh
   - Test protected endpoints

## Benefits of New System

### Security
✅ Industry-standard OAuth 2.0  
✅ Tokens managed by Supabase (more secure)  
✅ Built-in rate limiting and security features  
✅ No custom JWT implementation to maintain  

### User Experience
✅ Social login (Google, GitHub, Facebook, etc.)  
✅ Faster signup with OAuth  
✅ Better mobile app support  
✅ Email verification built-in  

### Developer Experience
✅ Less code to maintain  
✅ No password hashing logic  
✅ Automatic token refresh  
✅ Built-in session management  

## Backward Compatibility

**Breaking Changes:**
- ❌ Old JWT tokens will NOT work
- ❌ `/auth/register` renamed to `/auth/signup`
- ❌ `/auth/login` renamed to `/auth/signin`
- ❌ `/auth/logout` renamed to `/auth/signout`
- ❌ Token payload structure changed

**Migration Required:**
- Frontend must update API endpoints
- Users must re-authenticate
- Tokens must be refreshed using new flow

## Testing

```bash
# Test email/password signup
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "role": "consumer"
  }'

# Test email/password signin
curl -X POST http://localhost:8000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Test protected endpoint
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Test token refresh
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

## Support

For questions or issues:
- Check `OAUTH_SETUP_GUIDE.md` for OAuth configuration
- Check `SETUP_GUIDE.md` for general setup
- Review Supabase Auth docs: https://supabase.com/docs/guides/auth
- Create an issue in the repository

## Summary

The migration to Supabase Auth with OAuth provides a more secure, user-friendly, and maintainable authentication system. While it requires frontend updates, the benefits far outweigh the migration effort.

**Key takeaways:**
- 🔐 More secure with industry-standard OAuth
- 🚀 Better UX with social login
- 🛠️ Less code to maintain
- ✅ All existing features still work
- 📱 Better mobile app support
