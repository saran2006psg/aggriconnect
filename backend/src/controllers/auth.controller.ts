import { Request, Response } from 'express';
import { createResponse } from '../utils/response';
import {
  loginService,
  registerService,
  googleAuthService,
  getMeService,
  refreshTokenService,
} from '../services/auth.service';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await loginService(req.body);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Login failed', null, { server: String(e) }));
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await registerService(req.body);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Registration failed', null, { server: String(e) }));
  }
}

export async function googleAuth(req: Request, res: Response): Promise<void> {
  try {
    const result = await googleAuthService(req.body);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Google authentication failed', null, { server: String(e) }));
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = await getMeService(req.user!.id);
    if (!user) {
      res.json(createResponse(false, 'User not found', null, { auth: 'User does not exist' }));
      return;
    }
    res.json(createResponse(true, 'User retrieved successfully', { user }));
  } catch (e) {
    res.json(createResponse(false, 'Failed to get user', null, { server: String(e) }));
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const result = await refreshTokenService(req.body);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Token refresh failed', null, { server: String(e) }));
  }
}

export function forgotPassword(_req: Request, res: Response): void {
  res.json(
    createResponse(
      false,
      'Password reset via email is not available. Please use Google OAuth to login.',
      null,
      { feature: 'Email password reset not implemented. Use OAuth login.' }
    )
  );
}

export function resetPassword(_req: Request, res: Response): void {
  res.json(
    createResponse(
      false,
      'Password reset via email is not available. Please use Google OAuth to login.',
      null,
      { feature: 'Email password reset not implemented. Use OAuth login.' }
    )
  );
}
