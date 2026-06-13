import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../utils/response';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ Unhandled error:', err);
  res
    .status(500)
    .json(
      createResponse(false, 'Internal server error', null, {
        server: err.message,
      })
    );
}
