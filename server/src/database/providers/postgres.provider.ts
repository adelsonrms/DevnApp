import { IRepository, FindManyOptions } from '../repository.interface';

/**
 * PostgreSQL Implementation of IRepository (Mocked for Template)
 * 
 * NOTE: In development/template mode, this acts as an in-memory store.
 * For production, integrate with Drizzle ORM or Knex.
 */
export class PostgresProvider<T> implements IRepository<T> {
  private static store: Map<string, any[]> = new Map();

  constructor(private entity: string) {
    if (!PostgresProvider.store.has(entity)) {
      PostgresProvider.store.set(entity, this.getInitialData(entity));
    }
  }

  private getInitialData(entity: string): any[] {
    if (entity === 'users') {
      return [
        {
          id: '1',
          name: 'Developer Admin',
          email: 'admin@devnfw.com',
          password: '$2b$10$vN.pT4yYw0yVlI.z7m1zY.uKjY/UqL4eN9Xo/uS7vYhR5eGZ9w.Zy', // admin123
          role: 'admin',
          organization_id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
    if (entity === 'organizations') {
      return [
        {
          id: '1',
          name: 'DevnFW Headquarters',
          slug: 'devnfw-hq',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Acme Corp Labs',
          slug: 'acme-labs',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
    return [];
  }

  async create(data: Partial<T>): Promise<T> {
    const items = PostgresProvider.store.get(this.entity) || [];
    const newItem = { 
      ...data, 
      id: Math.random().toString(36).substring(7),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as T;
    items.push(newItem);
    PostgresProvider.store.set(this.entity, items);
    return newItem;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const items = PostgresProvider.store.get(this.entity) || [];
    const index = items.findIndex(i => (i as any).id === id);
    if (index === -1) throw new Error(`${this.entity} not found`);
    
    items[index] = { ...items[index], ...data, updated_at: new Date().toISOString() };
    PostgresProvider.store.set(this.entity, items);
    return items[index] as T;
  }

  async delete(id: string): Promise<boolean> {
    const items = PostgresProvider.store.get(this.entity) || [];
    const newItems = items.filter(i => (i as any).id !== id);
    PostgresProvider.store.set(this.entity, newItems);
    return true;
  }

  async findById(id: string): Promise<T | null> {
    const items = PostgresProvider.store.get(this.entity) || [];
    return (items.find(i => (i as any).id === id) as T) || null;
  }

  async findMany(options?: FindManyOptions): Promise<T[]> {
    let items = PostgresProvider.store.get(this.entity) || [];
    const { filters, limit, offset, orderBy, order } = options || {};
    
    if (filters) {
      items = items.filter(item => {
        return Object.entries(filters).every(([key, value]) => (item as any)[key] === value);
      });
    }

    if (orderBy) {
      items.sort((a, b) => {
        const valA = (a as any)[orderBy];
        const valB = (b as any)[orderBy];
        if (valA < valB) return order === 'DESC' ? 1 : -1;
        if (valA > valB) return order === 'DESC' ? -1 : 1;
        return 0;
      });
    }

    if (offset !== undefined || limit !== undefined) {
      const start = offset || 0;
      const end = limit !== undefined ? start + limit : items.length;
      items = items.slice(start, end);
    }
    
    return items as T[];
  }

  async count(filters?: any): Promise<number> {
    const items = await this.findMany(filters);
    return items.length;
  }
}
