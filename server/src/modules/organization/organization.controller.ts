import { Request, Response } from 'express';
import { organizationService } from './organization.service';
import { UserEntity } from '../auth/auth.repository.interface';

export class OrganizationController {
  async getAll(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = page && limit ? (page - 1) * limit : undefined;
      const orderBy = req.query.orderBy as string;
      const order = req.query.order as 'ASC' | 'DESC';

      const options = {
        limit,
        offset,
        orderBy,
        order
      };

      const result = await organizationService.getAll(options);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await organizationService.getById(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Organização não encontrada' });
      }
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Nome é obrigatório'
        });
      }

      const existingOrg = await organizationService.getAll();
      const nameExists = existingOrg.some(org => org.name.toLowerCase() === name.toLowerCase());
      if (nameExists) {
        return res.status(400).json({
          success: false,
          error: 'Já existe uma organização com este nome'
        });
      }

      const result = await organizationService.create(req.body);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const existing = await organizationService.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Organização não encontrada' });
      }

      const result = await organizationService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const existing = await organizationService.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Organização não encontrada' });
      }

      await organizationService.delete(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('membros')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMembers(req: Request, res: Response) {
    try {
      const org = await organizationService.getById(req.params.id);
      if (!org) {
        return res.status(404).json({ success: false, error: 'Organização não encontrada' });
      }

      const members = await organizationService.getMembers(req.params.id);
      // Remove password field from each member
      const safeMembers = members.map((user: UserEntity) => {
        const { password: _, ...safeUser } = user;
        return safeUser;
      });

      return res.status(200).json({ success: true, data: safeMembers });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, error: 'Email é obrigatório' });
      }

      const org = await organizationService.getById(req.params.id);
      if (!org) {
        return res.status(404).json({ success: false, error: 'Organização não encontrada' });
      }

      const result = await organizationService.addMember(req.params.id, email);
      const { password: _, ...safeUser } = result;
      return res.status(200).json({ success: true, data: safeUser });
    } catch (error: any) {
      if (error.message.includes('não localizado') ||
          error.message.includes('já é membro') ||
          error.message.includes('já pertence')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const org = await organizationService.getById(req.params.id);
      if (!org) {
        return res.status(404).json({ success: false, error: 'Organização não encontrada' });
      }

      const result = await organizationService.removeMember(req.params.id, req.params.userId);
      const { password: _, ...safeUser } = result;
      return res.status(200).json({ success: true, data: safeUser });
    } catch (error: any) {
      if (error.message.includes('não pertence')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const organizationController = new OrganizationController();
