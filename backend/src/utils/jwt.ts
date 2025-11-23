import jwt from 'jsonwebtoken';

export interface DecodedToken {
  sub: string;
  email: string;
  user_type: 'user' | 'admin';
  iat: number;
  exp: number;
}

export const generateToken = (userId: string, email: string, userType: 'user' | 'admin'): string => {
  return jwt.sign(
    { sub: userId, email, user_type: userType },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): DecodedToken => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
  // Normalize older tokens that used `role` instead of `user_type`
  if (decoded && !decoded.user_type && decoded.role) {
    decoded.user_type = decoded.role;
  }
  return decoded as DecodedToken;
};
