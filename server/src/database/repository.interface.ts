/**
 * Generic Repository Interface
 */
export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<T | null>;
  findMany(filters?: any): Promise<T[]>;
  count(filters?: any): Promise<number>;
}
