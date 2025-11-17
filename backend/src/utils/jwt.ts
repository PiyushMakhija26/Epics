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
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): DecodedToken => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret') as DecodedToken;
};
