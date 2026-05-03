import { Request, Response } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../middleware/auth.middleware';

/**
 * Authentication Controller
 * 
 * Handles HTTP requests and delegates logic to AuthService.
 * Decouples Express req/res from the core business logic.
 */
export class AuthController {
  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email e senha são obrigatórios' 
      });
    }

    const result = await authService.login(email, password);
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  }

  /**
   * POST /auth/register
   */
  async register(req: Request, res: Response) {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Campos obrigatórios: email, password, name' 
      });
    }

    const result = await authService.register(req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  }

  /**
   * GET /auth/me
   */
  async me(req: AuthRequest, res: Response) {
    // req.user was populated by the authenticate middleware
    return res.status(200).json({
      success: true,
      data: req.user
    });
  }
}

export const authController = new AuthController();
