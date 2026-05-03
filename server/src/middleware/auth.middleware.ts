import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service';

/**
 * Extended Request interface to include authenticated user data
 */
export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to authenticate requests via JWT
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token não fornecido' 
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = authService.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token inválido ou expirado' 
    });
  }

  // Inject user data into request for downstream handlers
  req.user = decoded;
  next();
};

/**
 * Middleware to authorize requests based on user roles
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso negado' 
      });
    }
    next();
  };
};
