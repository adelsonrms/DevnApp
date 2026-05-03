import Database from 'better-sqlite3';
import path from 'path';
import { IRepository } from '../repository.interface';
import { User } from '@devnfw/shared';

interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export class SqliteProvider<T> implements IRepository<T> {
  private static db: Database.Database | null = null;
  private static initPromise: Promise<void> | null = null;
  private entity: string;
  private tableName: string;

  constructor(entity: string) {
    this.entity = entity;
    this.tableName = this.getTableName(entity);
    this.initDatabase();
  }

  private getTableName(entity: string): string {
    const tableMap: Record<string, string> = {
      users: 'users',
      organizations: 'organizations',
      password_reset_tokens: 'password_reset_tokens'
    };
    return tableMap[entity] || entity;
  }

  private initDatabase(): void {
    if (SqliteProvider.initPromise) return;

    SqliteProvider.initPromise = this.createTables();
  }

  private async createTables(): Promise<void> {
    const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'devnapp.db');
    SqliteProvider.db = new Database(dbPath);
    SqliteProvider.db.pragma('journal_mode = WAL');
    SqliteProvider.db.pragma('foreign_keys = ON');

    const db = SqliteProvider.db;

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        organization_id TEXT,
        avatar_url TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        logo_url TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
      CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
    `);

    const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@devnfw.com');
    if (!adminExists) {
      const hashedPassword = '$2b$10$vN.pT4yYw0yVlI.z7m1zY.uKjY/UqL4eN9Xo/uS7vYhR5eGZ9w.Zy';
      db.prepare(`
        INSERT INTO users (id, email, name, password, role, organization_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        '1',
        'admin@devnfw.com',
        'Developer Admin',
        hashedPassword,
        'admin',
        '1',
        new Date().toISOString(),
        new Date().toISOString()
      );
    }

    const orgExists = db.prepare('SELECT id FROM organizations WHERE slug = ?').get('devnfw-hq');
    if (!orgExists) {
      db.prepare(`
        INSERT INTO organizations (id, name, slug, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        '1',
        'DevnFW Headquarters',
        'devnfw-hq',
        new Date().toISOString(),
        new Date().toISOString()
      );
    }
  }

  private getDb(): Database.Database {
    if (!SqliteProvider.db) {
      throw new Error('Database not initialized');
    }
    return SqliteProvider.db;
  }

  async create(data: Partial<T>): Promise<T> {
    const db = this.getDb();
    const id = Math.random().toString(36).substring(7) + Date.now().toString(36);
    const now = new Date().toISOString();

    const record = {
      id,
      ...data,
      created_at: now,
      updated_at: now
    } as Record<string, any>;

    const columns = Object.keys(record);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(col => record[col]);

    const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    db.prepare(sql).run(...values);

    return record as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const db = this.getDb();
    const now = new Date().toISOString();

    const record = {
      ...data,
      updated_at: now
    } as Record<string, any>;

    const updates = Object.keys(record)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');

    if (!updates) {
      const existing = await this.findById(id);
      if (!existing) throw new Error(`${this.entity} not found`);
      return existing;
    }

    const values = Object.keys(record)
      .filter(key => key !== 'id')
      .map(key => record[key]);

    const sql = `UPDATE ${this.tableName} SET ${updates} WHERE id = ?`;
    const result = db.prepare(sql).run(...values, id);

    if (result.changes === 0) {
      throw new Error(`${this.entity} not found`);
    }

    return this.findById(id) as Promise<T>;
  }

  async delete(id: string): Promise<boolean> {
    const db = this.getDb();
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = db.prepare(sql).run(id);
    return result.changes > 0;
  }

  async findById(id: string): Promise<T | null> {
    const db = this.getDb();
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const record = db.prepare(sql).get(id) as Record<string, any> | undefined;
    return record ? (this.cleanRecord(record) as T) : null;
  }

  async findMany(filters?: Record<string, any>): Promise<T[]> {
    const db = this.getDb();
    let sql = `SELECT * FROM ${this.tableName}`;
    const values: any[] = [];

    if (filters && Object.keys(filters).length > 0) {
      const conditions = Object.keys(filters).map(key => {
        values.push(filters[key]);
        return `${key} = ?`;
      });
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const records = db.prepare(sql).all(...values) as Record<string, any>[];
    return records.map(record => this.cleanRecord(record) as T);
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const db = this.getDb();
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const values: any[] = [];

    if (filters && Object.keys(filters).length > 0) {
      const conditions = Object.keys(filters).map(key => {
        values.push(filters[key]);
        return `${key} = ?`;
      });
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = db.prepare(sql).get(...values) as { count: number };
    return result.count;
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = this.getDb();
    const sql = `SELECT * FROM ${this.tableName} WHERE email = ?`;
    const record = db.prepare(sql).get(email) as Record<string, any> | undefined;
    return record ? (record as User) : null;
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

  private cleanRecord(record: Record<string, any>): Record<string, any> {
    const cleaned = { ...record };
    return cleaned;
  }
}
