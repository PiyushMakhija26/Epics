import { Request, Response, NextFunction } from 'express';
import { verifyToken, DecodedToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: DecodedToken;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.user_type !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};
