import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user.types';
import { createResponse } from '../utils/response';

/**
 * Factory that returns a middleware checking req.user.role.
 * Must be used AFTER authMiddleware.
 *
 * Usage: router.post('/...', authMiddleware, requireRole('farmer'), controller)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res
        .status(401)
        .json(
          createResponse(false, 'Not authenticated', null, {
            auth: 'No user on request',
          })
        );
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res
        .status(403)
        .json(
          createResponse(false, 'Insufficient permissions', null, {
            auth: `Required role: ${roles.join(' or ')}`,
          })
        );
      return;
    }

    next();
  };
}
