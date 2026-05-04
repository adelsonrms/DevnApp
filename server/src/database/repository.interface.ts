export interface FindManyOptions {
  filters?: any;
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

/**
 * Generic Repository Interface
 */
export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<T | null>;
  findMany(options?: FindManyOptions): Promise<T[]>;
  count(filters?: any): Promise<number>;
}
