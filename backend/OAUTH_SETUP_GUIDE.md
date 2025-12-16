# OAuth Setup Guide for AgriConnect Backend

## Overview

AgriConnect now uses **Supabase Auth** with OAuth 2.0 for authentication instead of JWT tokens. This provides a more secure and user-friendly authentication experience with support for multiple social login providers.

## Supported OAuth Providers

- ✅ **Google** - Most popular, recommended for all users
- ✅ **GitHub** - Great for developer-focused users
- ✅ **Facebook** - Wide reach, good for general users
- ✅ **Twitter** - Social media integration
- ✅ **Discord** - Gaming and community-focused
- ✅ **Azure** - Enterprise users
- ✅ **Apple** - iOS users

## Setup Instructions

### 1. Configure Supabase OAuth Providers

1. Go to your Supabase project dashboard: https://app.supabase.com/
2. Navigate to **Authentication** → **Providers**
3. Enable the OAuth providers you want to use

### 2. Configure Google OAuth (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if not done
6. Application type: **Web application**
7. Add authorized redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
8. Copy **Client ID** and **Client Secret**
9. In Supabase dashboard, paste them into Google provider settings
10. Save configuration

### 3. Configure GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in details:
   - **Application name**: AgriConnect
   - **Homepage URL**: Your app URL
   - **Authorization callback URL**: 
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```
4. Copy **Client ID** and **Client Secret**
5. In Supabase dashboard, paste them into GitHub provider settings
6. Save configuration

### 4. Configure Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing
3. Add **Facebook Login** product
4. In Settings → Basic, copy **App ID** and **App Secret**
5. In Facebook Login Settings, add Valid OAuth Redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
6. In Supabase dashboard, paste App ID and Secret into Facebook provider
7. Save configuration

### 5. Configure Other Providers

Follow similar steps for:
- **Twitter**: https://developer.twitter.com/
- **Discord**: https://discord.com/developers/applications
- **Azure**: https://portal.azure.com/
- **Apple**: https://developer.apple.com/

Each provider requires:
1. Creating an OAuth application
2. Configuring redirect URI to Supabase callback
3. Copying Client ID and Secret to Supabase

## Frontend Integration

### Authentication Flow

```typescript
// 1. Initiate OAuth login
const response = await fetch('http://localhost:8000/api/v1/auth/oauth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

const { url } = await response.json();

// 2. Redirect user to OAuth provider
window.location.href = url;

// 3. Handle callback (on /auth/callback route)
// Get code from URL params and exchange for tokens
const urlParams = new URLSearchParams(window.location.hash.substring(1));
const access_token = urlParams.get('access_token');
const refresh_token = urlParams.get('refresh_token');

// 4. Send tokens to backend to create/get user profile
const authResponse = await fetch('http://localhost:8000/api/v1/auth/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ access_token, refresh_token })
});

const { user, access_token: finalToken } = await authResponse.json();

// 5. Store token and user info
localStorage.setItem('access_token', finalToken);
localStorage.setItem('user', JSON.stringify(user));

// 6. Use token for API requests
fetch('http://localhost:8000/api/v1/products', {
  headers: {
    'Authorization': `Bearer ${finalToken}`
  }
});
```

### Email/Password Authentication (Still Available)

```typescript
// Sign up
const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    name: 'John Doe',
    role: 'consumer'  // or 'farmer'
  })
});

const { access_token, user } = await response.json();

// Sign in
const response = await fetch('http://localhost:8000/api/v1/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
});

const { access_token, user } = await response.json();
```

### Token Refresh

```typescript
const response = await fetch('http://localhost:8000/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refresh_token: storedRefreshToken
  })
});

const { access_token } = await response.json();
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Sign up with email/password |
| POST | `/api/v1/auth/signin` | Sign in with email/password |
| POST | `/api/v1/auth/oauth/{provider}` | Get OAuth URL for provider |
| POST | `/api/v1/auth/callback` | Handle OAuth callback |
| POST | `/api/v1/auth/signout` | Sign out user |
| POST | `/api/v1/auth/refresh` | Refresh access token |

### Protected Endpoints

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Token Management

### Access Token
- **Duration**: Set by Supabase (typically 1 hour)
- **Usage**: Include in Authorization header for all API requests
- **Storage**: Store securely (localStorage for web, secure storage for mobile)

### Refresh Token
- **Duration**: Set by Supabase (typically 30 days)
- **Usage**: Obtain new access token when current expires
- **Storage**: Store securely (httpOnly cookie recommended)

## Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Secure Storage**: Store tokens securely (httpOnly cookies or secure storage)
3. **Token Rotation**: Refresh tokens before expiry
4. **CORS Configuration**: Configure allowed origins properly
5. **Rate Limiting**: Implement rate limiting on auth endpoints
6. **Provider Validation**: Validate OAuth provider credentials
7. **User Verification**: Verify email for email/password signups

## Testing OAuth Locally

1. Start backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. Start frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Configure redirect URLs for localhost:
   - In each OAuth provider's settings, add:
     ```
     http://localhost:8000/auth/callback
     http://localhost:5173/auth/callback
     ```

4. Test OAuth flow:
   - Click "Sign in with Google" (or other provider)
   - Authorize the application
   - Get redirected back with tokens
   - Profile created automatically

## Troubleshooting

### "Invalid OAuth Provider"
- Check provider name is correct (google, github, facebook, etc.)
- Verify provider is enabled in Supabase dashboard
- Ensure Client ID and Secret are configured

### "Redirect URI Mismatch"
- Verify redirect URI matches exactly in provider settings
- Check for http vs https mismatch
- Ensure Supabase callback URL is correct

### "Invalid Token"
- Token may be expired - use refresh token
- Token format incorrect - should be Bearer token
- User session may have been revoked

### "User Profile Not Found"
- Profile creation may have failed
- Check database logs
- Verify database connection

## Environment Variables

Update your `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret  # Optional
FRONTEND_CALLBACK_URL=http://localhost:5173/auth/callback
```

## Migration from JWT

If migrating from JWT authentication:

1. **Existing users**: Users need to re-authenticate using OAuth or email/password
2. **Tokens**: Old JWT tokens will be invalid - users must log in again
3. **Database**: User table structure remains the same
4. **Password hashes**: Email/password users created via Supabase Auth

## Next Steps

1. ✅ Configure OAuth providers in Supabase
2. ✅ Update frontend to use new auth endpoints
3. ✅ Test OAuth flow with each provider
4. ✅ Implement token refresh logic
5. ✅ Add error handling for auth failures
6. ✅ Deploy and configure production OAuth credentials

## Support

For issues or questions:
- Supabase Docs: https://supabase.com/docs/guides/auth
- OAuth 2.0 Spec: https://oauth.net/2/
- GitHub Issues: Create an issue in your repository
