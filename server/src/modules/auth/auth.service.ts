import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { RepositoryFactory } from '../../database/repository.factory';
import { User, ApiResponse } from '@devnfw/shared';
import { IUserRepository, UserEntity } from './auth.repository.interface';

interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: string;
  organization_id?: string;
}


export class AuthService {
  private userRepository: IUserRepository = RepositoryFactory.getUserRepository();
  private jwtSecret = process.env.JWT_SECRET || 'template-secret-devnfw';
  private jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';

  async register(data: CreateUserData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing) {
        return { success: false, error: 'Usuário já cadastrado' };
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await this.userRepository.create({
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role as 'admin' | 'user' | 'owner' || 'user',
        organization_id: data.organization_id
      }) as UserEntity;

      const token = this.generateToken(user);

      const { password: _pw, ...userWithoutPassword } = user;

      return {
        success: true,
        data: { user: userWithoutPassword as User, token }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const user = await this.userRepository.findByEmail(email) as UserEntity;

      if (!user) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      if (!user.password) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      const token = this.generateToken(user);

      const { password: _pw, ...userWithoutPassword } = user;

      return {
        success: true,
        data: { user: userWithoutPassword as User, token }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private generateToken(user: User | UserEntity): string {
    const options: SignOptions = {
      expiresIn: this.jwtExpiresIn as any
    };

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
      },
      this.jwtSecret,
      options
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (err) {
      return null;
    }
  }
}

export const authService = new AuthService();
