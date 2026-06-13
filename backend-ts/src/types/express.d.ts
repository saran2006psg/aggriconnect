import { UserRecord } from './user.types';

declare global {
  namespace Express {
    interface Request {
      /** Populated by authMiddleware after JWT verification */
      user?: UserRecord;
    }
  }
}
