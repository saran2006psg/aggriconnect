import { Request, Response, NextFunction } from 'express';
import { decodeToken } from '../utils/security';
import { supabaseAdmin } from '../lib/supabase';
import { createResponse } from '../utils/response';

/**
 * Extracts the Bearer token from Authorization header,
 * decodes it, fetches the user from Supabase, and attaches
 * it to req.user. Returns 401 if missing/invalid.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(401)
      .json(
        createResponse(false, 'Missing or invalid authorization header', null, {
          auth: 'Bearer token required',
        })
      );
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = decodeToken(token);

  if (!payload) {
    res
      .status(401)
      .json(
        createResponse(false, 'Invalid or expired token', null, {
          auth: 'Token verification failed',
        })
      );
    return;
  }

  const userId = payload.sub;
  if (!userId) {
    res
      .status(401)
      .json(
        createResponse(false, 'Invalid token payload', null, {
          auth: 'No subject in token',
        })
      );
    return;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      res
        .status(404)
        .json(
          createResponse(false, 'User not found', null, {
            auth: 'User does not exist',
          })
        );
      return;
    }

    req.user = data;
    next();
  } catch (err) {
    res
      .status(500)
      .json(
        createResponse(false, 'Auth error', null, { server: String(err) })
      );
  }
}
