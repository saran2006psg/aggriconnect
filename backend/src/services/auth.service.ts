import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';
import {
  verifyPassword,
  getPasswordHash,
  createAccessToken,
  createRefreshToken,
  decodeToken,
  verifyGoogleToken,
} from '../utils/security';
import {
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  RefreshTokenRequest,
} from '../types/user.types';
import { ServiceResult } from '../utils/response';

export async function loginService(body: LoginRequest): Promise<ServiceResult> {
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', body.email);

  if (!users || users.length === 0) {
    return { success: false, message: 'Invalid email or password', errors: { email: 'User not found' } };
  }

  const user = users[0];

  if (!verifyPassword(body.password, user.password_hash)) {
    return { success: false, message: 'Invalid email or password', errors: { password: 'Incorrect password' } };
  }

  const accessToken = createAccessToken({ sub: user.id, role: user.role });
  const refreshToken = createRefreshToken({ sub: user.id });
  delete user.password_hash;

  return { success: true, message: 'Login successful', data: { user, accessToken, refreshToken } };
}

export async function registerService(body: RegisterRequest): Promise<ServiceResult> {
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', body.email);

  if (existing && existing.length > 0) {
    return { success: false, message: 'Registration failed', errors: { email: 'Email already registered' } };
  }

  const passwordHash = getPasswordHash(body.password);
  const now = new Date().toISOString();

  const newUser = {
    id: uuidv4(),
    email: body.email,
    password_hash: passwordHash,
    full_name: body.full_name,
    role: body.role,
    phone_number: body.phone_number ?? null,
    farm_name: body.role === 'farmer' ? (body.farm_name ?? null) : null,
    farm_location: body.role === 'farmer' ? (body.farm_location ?? null) : null,
    farm_description: body.role === 'farmer' ? (body.farm_description ?? null) : null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabaseAdmin.from('users').insert(newUser).select();

  if (error || !data || data.length === 0) {
    return { success: false, message: 'Registration failed', errors: { server: error?.message ?? 'Database error' } };
  }

  const user = data[0];
  const accessToken = createAccessToken({ sub: user.id, role: user.role });
  const refreshToken = createRefreshToken({ sub: user.id });
  delete user.password_hash;

  return { success: true, message: 'Registration successful', data: { user, accessToken, refreshToken } };
}

export async function googleAuthService(body: GoogleAuthRequest): Promise<ServiceResult> {
  console.log(`🔐 Google OAuth request received for role: ${body.role}`);
  const googleUser = await verifyGoogleToken(body.token);

  if (!googleUser) {
    return {
      success: false,
      message: 'Invalid Google token. Make sure GOOGLE_CLIENT_ID is set correctly in backend .env',
      errors: { token: 'Failed to verify Google token' },
    };
  }

  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', googleUser.email);

  let user: Record<string, unknown>;

  if (existing && existing.length > 0) {
    user = existing[0];
    console.log(`✅ Existing user found: ${user.email}`);
  } else {
    const now = new Date().toISOString();
    const newUser = {
      id: uuidv4(),
      email: googleUser.email,
      full_name: googleUser.name,
      role: body.role,
      profile_image_url: googleUser.picture ?? null,
      password_hash: '',
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabaseAdmin.from('users').insert(newUser).select();
    if (error || !data || data.length === 0) {
      return { success: false, message: 'Failed to create user', errors: { server: 'Database error' } };
    }
    user = data[0];
  }

  const accessToken = createAccessToken({ sub: user.id as string, role: user.role as string });
  const refreshToken = createRefreshToken({ sub: user.id as string });
  delete user.password_hash;

  return { success: true, message: 'Google authentication successful', data: { user, accessToken, refreshToken } };
}

export async function getMeService(userId: string) {
  const { data } = await supabaseAdmin.from('users').select('*').eq('id', userId).single();
  if (!data) return null;
  delete data.password_hash;
  return data;
}

export async function refreshTokenService(body: RefreshTokenRequest): Promise<ServiceResult> {
  const payload = decodeToken(body.refresh_token);

  if (!payload || payload.type !== 'refresh') {
    return { success: false, message: 'Invalid refresh token', errors: { token: 'Invalid or expired refresh token' } };
  }

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, role')
    .eq('id', payload.sub);

  if (!users || users.length === 0) {
    return { success: false, message: 'User not found', errors: { user: 'User no longer exists' } };
  }

  const user = users[0];
  const accessToken = createAccessToken({ sub: user.id, role: user.role });

  return { success: true, message: 'Token refreshed successfully', data: { accessToken } };
}
