# OAuth Quick Reference

## 🔐 Authentication Endpoints

### Email/Password

```bash
# Signup
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "consumer"  # or "farmer"
}

Response: 201
{
  "access_token": "eyJhbGc...",
  "refresh_token": "abc123...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "consumer"
  }
}

# Signin
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200
{
  "access_token": "eyJhbGc...",
  "refresh_token": "abc123...",
  "token_type": "bearer",
  "user": {...}
}
```

### OAuth Providers

```bash
# Get OAuth URL
POST /api/v1/auth/oauth/{provider}
# provider: google | github | facebook | twitter | discord | azure | apple

Response: 200
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "provider": "google"
}

# Handle OAuth Callback
POST /api/v1/auth/callback
Content-Type: application/json

{
  "access_token": "token_from_url_hash",
  "refresh_token": "refresh_from_url_hash"
}

Response: 200
{
  "access_token": "eyJhbGc...",
  "refresh_token": "abc123...",
  "token_type": "bearer",
  "user": {...}
}
```

### Token Management

```bash
# Refresh Token
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "current_refresh_token"
}

Response: 200
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "token_type": "bearer"
}

# Signout
POST /api/v1/auth/signout

Response: 200
{
  "message": "Signed out successfully"
}
```

## 🔑 Using Access Tokens

### All Protected Endpoints

```bash
GET /api/v1/{endpoint}
Authorization: Bearer {access_token}
```

### Example: Get Current User

```bash
GET /api/v1/users/me
Authorization: Bearer eyJhbGc...

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "consumer",
  "profile_image_url": "https://...",
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

## 🌐 Frontend Integration

### JavaScript/TypeScript

```typescript
// 1. Signin with email/password
const signin = async (email: string, password: string) => {
  const res = await fetch('http://localhost:8000/api/v1/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const { access_token, refresh_token, user } = await res.json();
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  return user;
};

// 2. Signin with OAuth (Google)
const signinWithGoogle = async () => {
  const res = await fetch('http://localhost:8000/api/v1/auth/oauth/google', {
    method: 'POST'
  });
  const { url } = await res.json();
  window.location.href = url;  // Redirect to Google
};

// 3. Handle OAuth callback (in /auth/callback route)
const handleCallback = async () => {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  
  const res = await fetch('http://localhost:8000/api/v1/auth/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token, refresh_token })
  });
  const { user } = await res.json();
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  return user;
};

// 4. Make authenticated request
const getProducts = async () => {
  const token = localStorage.getItem('access_token');
  const res = await fetch('http://localhost:8000/api/v1/products', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

// 5. Refresh token
const refreshToken = async () => {
  const refresh_token = localStorage.getItem('refresh_token');
  const res = await fetch('http://localhost:8000/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token })
  });
  const { access_token } = await res.json();
  localStorage.setItem('access_token', access_token);
  return access_token;
};

// 6. Signout
const signout = async () => {
  await fetch('http://localhost:8000/api/v1/auth/signout', { method: 'POST' });
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};
```

### React Hook

```typescript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCurrentUser(token).then(setUser).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signin = async (email: string, password: string) => {
    const res = await fetch('http://localhost:8000/api/v1/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const { access_token, refresh_token, user } = await res.json();
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    setUser(user);
    return user;
  };

  const signout = async () => {
    await fetch('http://localhost:8000/api/v1/auth/signout', { method: 'POST' });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return { user, loading, signin, signout };
};
```

## ⚙️ Environment Variables

```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional (default shown)
FRONTEND_CALLBACK_URL=http://localhost:5173/auth/callback
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
API_V1_PREFIX=/api/v1
PLATFORM_COMMISSION_RATE=12.5
```

## 🎨 OAuth Provider Setup

### Google
1. Go to: https://console.cloud.google.com/
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID & Secret to Supabase Dashboard

### GitHub
1. Go to: https://github.com/settings/developers
2. Create new OAuth App
3. Add callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID & Secret to Supabase Dashboard

### Facebook
1. Go to: https://developers.facebook.com/
2. Create new app → Add Facebook Login
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy App ID & Secret to Supabase Dashboard

## 🚨 Error Handling

```typescript
try {
  const user = await signin(email, password);
  // Success
} catch (error) {
  if (error.status === 401) {
    // Invalid credentials
  } else if (error.status === 400) {
    // Validation error
  } else {
    // Server error
  }
}
```

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Invalid request | Check request body format |
| 401 | Invalid credentials | Check email/password |
| 401 | Invalid token | Refresh token or re-login |
| 403 | Forbidden | Check user role/permissions |
| 404 | User not found | User may have been deleted |
| 500 | Server error | Check backend logs |

## 📚 Documentation

- [README_OAUTH.md](README_OAUTH.md) - Complete guide
- [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) - Provider setup
- [AUTH_MIGRATION.md](AUTH_MIGRATION.md) - Migration from JWT

## 🧪 Testing

```bash
# Test email signup
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test","role":"consumer"}'

# Test email signin
curl -X POST http://localhost:8000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test protected endpoint
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Quick links:**
- API Docs: http://localhost:8000/docs
- Supabase: https://app.supabase.com
- OAuth 2.0: https://oauth.net/2/
