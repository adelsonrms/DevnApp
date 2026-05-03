import { Request, Response } from 'express';
import { userService } from './user.service';

export class UserController {
  async getAll(req: Request, res: Response) {
    try {
      const orgId = req.query.orgId as string;
      let result;

      if (orgId) {
        result = await userService.findByOrganization(orgId);
      } else {
        result = await userService.getAllUsers();
      }

      const safeUsers = result.map(user => {
        const { password: _, ...safeUser } = user as any;
        return safeUser;
      });

      return res.status(200).json({ success: true, data: safeUsers });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await userService.findById(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      }
      const { password: _, ...safeUser } = result as any;
      return res.status(200).json({ success: true, data: safeUser });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { email, password, name, role, organization_id } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: email, password, name'
        });
      }

      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email já cadastrado'
        });
      }

      const result = await userService.create(req.body);
      const { password: _, ...safeUser } = result as any;
      return res.status(201).json({ success: true, data: safeUser });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const result = await userService.update(req.params.id, req.body);
      const { password: _, ...safeUser } = result as any;
      return res.status(200).json({ success: true, data: safeUser });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await userService.delete(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: currentPassword, newPassword'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'A nova senha deve ter pelo menos 6 caracteres'
        });
      }

      const result = await userService.changePassword(req.params.id, {
        currentPassword,
        newPassword
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email é obrigatório'
        });
      }

      const result = await userService.requestPasswordReset(email);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: token, newPassword'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'A nova senha deve ter pelo menos 6 caracteres'
        });
      }

      const result = await userService.resetPassword({ token, newPassword });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({ success: true, message: 'Senha redefinida com sucesso' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const userController = new UserController();
