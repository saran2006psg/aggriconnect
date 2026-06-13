import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
}
