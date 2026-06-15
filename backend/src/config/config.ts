import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  // Project info
  projectName: 'AgriConnect API',
  version: '1.0.0',
  apiV1Prefix: '/api/v1',

  // Server
  port: parseInt(process.env.PORT || '8001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // CORS
  get corsOrigins(): string[] {
    const raw =
      process.env.CORS_ORIGINS ||
      'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000';
    return raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  },

  // Supabase
  supabaseUrl: requireEnv('SUPABASE_URL', ''),
  supabaseKey: requireEnv('SUPABASE_KEY', ''),
  supabaseServiceKey: requireEnv('SUPABASE_SERVICE_KEY', ''),

  // JWT
  secretKey: process.env.SECRET_KEY || 'your-secret-key-change-in-production',
  algorithm: (process.env.ALGORITHM || 'HS256') as 'HS256',
  accessTokenExpireMinutes: parseInt(
    process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '1440',
    10
  ),
  refreshTokenExpireDays: parseInt(
    process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7',
    10
  ),

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

  // File upload
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],

  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,
};
