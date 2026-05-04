import { User } from '@devnfw/shared';
import { IRepository } from '../../database/repository.interface';

export interface UserEntity extends User {
  password?: string;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

/**
 * Specialized Repository for User entity, extending generic CRUD with business-specific methods
 */
export interface IUserRepository extends IRepository<UserEntity> {
  findByEmail(email: string): Promise<UserEntity | null>;
  createPasswordResetToken(userId: string, token: string, expiresInMinutes?: number): Promise<PasswordResetToken>;
  findPasswordResetToken(token: string): Promise<PasswordResetToken | null>;
  deletePasswordResetToken(token: string): Promise<boolean>;
  deletePasswordResetTokensByUserId(userId: string): Promise<boolean>;
}
