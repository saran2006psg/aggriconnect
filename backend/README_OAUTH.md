# OAuth Authentication in AgriConnect Backend

## Quick Start

The AgriConnect backend now uses **Supabase Auth with OAuth 2.0** for authentication instead of custom JWT tokens.

### Key Changes

✅ **Email/Password** authentication via Supabase Auth  
✅ **OAuth providers**: Google, GitHub, Facebook, Twitter, Discord, Azure, Apple  
✅ **Automatic token management** by Supabase  
✅ **Built-in security features** (rate limiting, email verification, etc.)  

### API Endpoints

#### Authentication

```bash
# Sign up with email/password
POST /api/v1/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "consumer"  # or "farmer"
}

# Sign in with email/password
POST /api/v1/auth/signin
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Get OAuth URL for social login
POST /api/v1/auth/oauth/{provider}
# Providers: google, github, facebook, twitter, discord, azure, apple
# Returns: { "url": "https://...", "provider": "google" }

# Handle OAuth callback
POST /api/v1/auth/callback
{
  "access_token": "...",
  "refresh_token": "..."
}

# Sign out
POST /api/v1/auth/signout

# Refresh token
POST /api/v1/auth/refresh
{
  "refresh_token": "..."
}
```

#### Protected Endpoints

All protected endpoints require Bearer token:

```bash
GET /api/v1/users/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Frontend Integration Example

```typescript
// 1. Email/Password Signup
const signup = async (email: string, password: string, name: string) => {
  const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role: 'consumer' })
  });
  
  const { access_token, refresh_token, user } = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return user;
};

// 2. Email/Password Signin
const signin = async (email: string, password: string) => {
  const response = await fetch('http://localhost:8000/api/v1/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const { access_token, refresh_token, user } = await response.json();
  
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return user;
};

// 3. OAuth Signin (e.g., Google)
const signinWithGoogle = async () => {
  const response = await fetch('http://localhost:8000/api/v1/auth/oauth/google', {
    method: 'POST'
  });
  
  const { url } = await response.json();
  
  // Redirect to Google OAuth
  window.location.href = url;
};

// 4. Handle OAuth Callback (in your /auth/callback route)
const handleOAuthCallback = async () => {
  // Get tokens from URL hash
  const params = new URLSearchParams(window.location.hash.substring(1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  
  if (!access_token) {
    console.error('No access token in callback');
    return;
  }
  
  // Exchange tokens with backend to create/get user profile
  const response = await fetch('http://localhost:8000/api/v1/auth/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token, refresh_token })
  });
  
  const { user, access_token: finalToken } = await response.json();
  
  // Store tokens and user
  localStorage.setItem('access_token', finalToken);
  localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Redirect to dashboard
  window.location.href = '/dashboard';
};

// 5. Make authenticated API calls
const getProducts = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/api/v1/products', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// 6. Refresh token when expired
const refreshToken = async () => {
  const refresh_token = localStorage.getItem('refresh_token');
  
  const response = await fetch('http://localhost:8000/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token })
  });
  
  const { access_token } = await response.json();
  
  localStorage.setItem('access_token', access_token);
  
  return access_token;
};

// 7. Signout
const signout = async () => {
  await fetch('http://localhost:8000/api/v1/auth/signout', {
    method: 'POST'
  });
  
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  
  window.location.href = '/login';
};
```

### React Example with Context

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profile_image_url?: string;
}

interface AuthContextType {
  user: User | null;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  signinWithProvider: (provider: string) => Promise<void>;
  signout: () => Promise<void>;
  refreshToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  const signin = async (email: string, password: string) => {
    const response = await fetch('http://localhost:8000/api/v1/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    
    const { access_token, refresh_token, user } = await response.json();
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
  };
  
  const signup = async (email: string, password: string, name: string) => {
    const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role: 'consumer' })
    });
    
    if (!response.ok) {
      throw new Error('Signup failed');
    }
    
    const { access_token, refresh_token, user } = await response.json();
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
  };
  
  const signinWithProvider = async (provider: string) => {
    const response = await fetch(`http://localhost:8000/api/v1/auth/oauth/${provider}`, {
      method: 'POST'
    });
    
    const { url } = await response.json();
    window.location.href = url;
  };
  
  const signout = async () => {
    await fetch('http://localhost:8000/api/v1/auth/signout', {
      method: 'POST'
    });
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    setUser(null);
  };
  
  const refreshToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    
    const response = await fetch('http://localhost:8000/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token })
    });
    
    const { access_token } = await response.json();
    localStorage.setItem('access_token', access_token);
    
    return access_token;
  };
  
  return (
    <AuthContext.Provider value={{ user, signin, signup, signinWithProvider, signout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Usage in components:
function LoginPage() {
  const { signin, signinWithProvider } = useAuth();
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signin(email, password);
  };
  
  return (
    <div>
      <form onSubmit={handleEmailLogin}>
        {/* Email/password form */}
      </form>
      
      <button onClick={() => signinWithProvider('google')}>
        Sign in with Google
      </button>
      
      <button onClick={() => signinWithProvider('github')}>
        Sign in with GitHub
      </button>
    </div>
  );
}
```

### Setup OAuth Providers

See [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) for detailed instructions on:
- Configuring Google OAuth
- Configuring GitHub OAuth
- Configuring Facebook OAuth
- Other providers (Twitter, Discord, Azure, Apple)

### Migration from JWT

See [AUTH_MIGRATION.md](AUTH_MIGRATION.md) for:
- Complete list of changes
- Migration steps
- Backward compatibility notes
- Testing instructions

### Environment Variables

Update your `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_CALLBACK_URL=http://localhost:5173/auth/callback
```

### Running the Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload

# Run with Docker
docker-compose up
```

### Testing

```bash
# Test signup
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User","role":"consumer"}'

# Test signin
curl -X POST http://localhost:8000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test protected endpoint
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Documentation

- [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) - OAuth provider configuration
- [AUTH_MIGRATION.md](AUTH_MIGRATION.md) - Migration from JWT to OAuth
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - General setup instructions
- [API_INTEGRATION.md](API_INTEGRATION.md) - API integration guide

### Support

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- OAuth 2.0 Spec: https://oauth.net/2/
- FastAPI Docs: https://fastapi.tiangolo.com/

---

**Ready to use OAuth authentication! 🚀**
