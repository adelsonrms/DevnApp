import { IRepository } from './repository.interface';
import { PostgresProvider } from './providers/postgres.provider';
import { SupabaseProvider } from './providers/supabase.provider';
import { SqliteProvider } from './providers/sqlite.provider';

/**
 * Repository Factory
 */
export class RepositoryFactory {
  private static instances: Map<string, IRepository<any>> = new Map();

  /**
   * Returns a repository instance for the given entity
   */
  static get<T>(entity: string): IRepository<T> {
    const provider = process.env.DB_PROVIDER || 'sqlite';
    const cacheKey = `${provider}:${entity}`;

    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey) as IRepository<T>;
    }

    let instance: IRepository<T>;

    switch (provider) {
      case 'sqlite':
        instance = new SqliteProvider<T>(entity);
        break;
      case 'supabase':
        instance = new SupabaseProvider<T>(entity);
        break;
      case 'postgres':
      default:
        instance = new PostgresProvider<T>(entity);
        break;
    }

    this.instances.set(cacheKey, instance);
    return instance;
  }
}
