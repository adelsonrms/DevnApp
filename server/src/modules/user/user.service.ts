import { RepositoryFactory } from '../../database/repository.factory';
import { User } from '@devnfw/shared';
import bcrypt from 'bcrypt';
import { IUserRepository, UserEntity } from '../auth/auth.repository.interface';
import { FindManyOptions } from '../../database/repository.interface';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

interface PasswordResetData {
  token: string;
  newPassword: string;
}

export class UserService {
  private repository: IUserRepository;

  constructor() {
    this.repository = RepositoryFactory.getUserRepository();
  }

  async create(data: any): Promise<UserEntity> {
    return this.repository.create(data);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findByEmail(email);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findById(id);
  }

  async findByOrganization(orgId: string): Promise<UserEntity[]> {
    return this.repository.findMany({ filters: { organization_id: orgId } });
  }

  async update(id: string, data: any): Promise<UserEntity> {
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

    if (!user.password) {
      return { success: false, error: 'Usuário não possui senha configurada' };
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
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

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    await this.repository.createPasswordResetToken(user.id, resetToken, 60);

    return { success: true, token: resetToken };
  }

  async resetPassword(data: PasswordResetData): Promise<{ success: boolean; error?: string }> {
    const resetToken = await this.repository.findPasswordResetToken(data.token);
    if (!resetToken) {
      return { success: false, error: 'Token inválido ou expirado' };
    }

    const user = await this.findById(resetToken.user_id);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.repository.update(user.id, { password: hashedPassword });

    await this.repository.deletePasswordResetToken(data.token);

    return { success: true };
  }

  async getAllUsers(options?: FindManyOptions): Promise<UserEntity[]> {
    return this.repository.findMany(options);
  }
}

export const userService = new UserService();
