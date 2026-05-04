import { RepositoryFactory } from '../../database/repository.factory';
import { User } from '../../../../shared/src/index';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

interface PasswordResetData {
  token: string;
  newPassword: string;
}

export class UserService {
  private repository: any;
  private passwordRepository: any;

  constructor() {
    this.repository = RepositoryFactory.get<any>('users');
    this.passwordRepository = RepositoryFactory.get<any>('password_reset_tokens');
  }

  async create(data: any): Promise<User> {
    if (!data.organization_id) {
      throw new Error('organization_id é obrigatório');
    }
    return this.repository.create(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }

  async findByOrganization(orgId: string): Promise<User[]> {
    return this.repository.findMany({ organization_id: orgId });
  }

  async update(id: string, data: any): Promise<User> {
    if (data.organization_id === null || data.organization_id === '') {
      delete data.organization_id;
    }
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  async changePassword(userId: string, data: PasswordChangeData): Promise<{ success: boolean; error?: string }> {
    const user = await this.findById(userId);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const userWithPassword = user as any;
    if (!userWithPassword.password) {
      return { success: false, error: 'Usuário não possui senha configurada' };
    }

    const isMatch = await bcrypt.compare(data.currentPassword, userWithPassword.password);
    if (!isMatch) {
      return { success: false, error: 'Senha atual incorreta' };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.repository.update(userId, { password: hashedPassword });

    return { success: true };
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string; token?: string }> {
    const user = await this.findByEmail(email);
    if (!user) {
      return { success: false, error: 'Se existir um usuário com este email, um link de recuperação foi enviado' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.passwordRepository.createPasswordResetToken(user.id, resetToken, 60);

    return { success: true, token: resetToken };
  }

  async resetPassword(data: PasswordResetData): Promise<{ success: boolean; error?: string }> {
    const resetToken = await this.passwordRepository.findPasswordResetToken(data.token);
    if (!resetToken) {
      return { success: false, error: 'Token inválido ou expirado' };
    }

    const user = await this.findById(resetToken.user_id);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.repository.update(user.id, { password: hashedPassword });

    await this.passwordRepository.deletePasswordResetToken(data.token);

    return { success: true };
  }

  async getAllUsers(): Promise<User[]> {
    return this.repository.findMany();
  }
}

export const userService = new UserService();
