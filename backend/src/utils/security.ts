import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/config';

// ─── Password helpers ────────────────────────────────────────────────────────

export function verifyPassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed);
}

export function getPasswordHash(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// ─── JWT helpers ─────────────────────────────────────────────────────────────

export interface TokenPayload {
  sub: string;
  role?: string;
  type?: 'access' | 'refresh';
  exp?: number;
  [key: string]: unknown;
}

export function createAccessToken(data: Omit<TokenPayload, 'type' | 'exp'>): string {
  const payload: TokenPayload = { ...data, type: 'access' } as TokenPayload;
  const options: SignOptions = {
    expiresIn: config.accessTokenExpireMinutes * 60,
    algorithm: config.algorithm,
  };
  return jwt.sign(payload, config.secretKey, options);
}

export function createRefreshToken(data: Omit<TokenPayload, 'type' | 'exp'>): string {
  const payload: TokenPayload = { ...data, type: 'refresh' } as TokenPayload;
  const options: SignOptions = {
    expiresIn: config.refreshTokenExpireDays * 24 * 60 * 60,
    algorithm: config.algorithm,
  };
  return jwt.sign(payload, config.secretKey, options);
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, config.secretKey, {
      algorithms: [config.algorithm],
    }) as TokenPayload;
    return payload;
  } catch {
    return null;
  }
}

// ─── Google OAuth verification ────────────────────────────────────────────────

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  google_id: string;
}

export async function verifyGoogleToken(token: string): Promise<GoogleUserInfo | null> {
  try {
    if (!config.googleClientId) {
      console.error('❌ GOOGLE_CLIENT_ID is not set');
      return null;
    }

    const client = new OAuth2Client(config.googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) return null;

    const iss = payload.iss || '';
    if (!['accounts.google.com', 'https://accounts.google.com'].includes(iss)) {
      console.error(`❌ Invalid issuer: ${iss}`);
      return null;
    }

    console.log(`✅ Google token verified for: ${payload.email}`);
    return {
      email: payload.email ?? '',
      name: payload.name ?? '',
      picture: payload.picture,
      google_id: payload.sub,
    };
  } catch (err) {
    console.error(`❌ Google token verification error: ${err}`);
    return null;
  }
}
