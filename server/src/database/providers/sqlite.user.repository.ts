import { SqliteProvider } from './sqlite.provider';
import { IUserRepository, PasswordResetToken, UserEntity } from '../../modules/auth/auth.repository.interface';
import { User } from '@devnfw/shared';

export class SqliteUserRepository extends SqliteProvider<UserEntity> implements IUserRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const db = this.getDb();
    const sql = `SELECT * FROM users WHERE email = ?`;
    const record = db.prepare(sql).get(email) as Record<string, any> | undefined;
    return record ? (record as UserEntity) : null;
  }

  async createPasswordResetToken(userId: string, token: string, expiresInMinutes: number = 60): Promise<PasswordResetToken> {
    const db = this.getDb();
    const id = Math.random().toString(36).substring(7) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(userId);

    const sql = `INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`;
    db.prepare(sql).run(id, userId, token, expiresAt, new Date().toISOString());

    return {
      id,
      user_id: userId,
      token,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };
  }

  async findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    const db = this.getDb();
    const sql = `SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > datetime('now')`;
    const record = db.prepare(sql).get(token) as PasswordResetToken | undefined;
    return record || null;
  }

  async deletePasswordResetToken(token: string): Promise<boolean> {
    const db = this.getDb();
    const result = db.prepare('DELETE FROM password_reset_tokens WHERE token = ?').run(token);
    return result.changes > 0;
  }

  async deletePasswordResetTokensByUserId(userId: string): Promise<boolean> {
    const db = this.getDb();
    const result = db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(userId);
    return result.changes > 0;
  }
}
