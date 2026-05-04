import { IRepository, FindManyOptions } from '../repository.interface';
import { SupabaseService } from '../../services/supabase.service';

/**
 * Supabase Implementation of IRepository
 */
export class SupabaseProvider<T> implements IRepository<T> {
  private supabase = SupabaseService.getInstance().client;

  constructor(private entity: string) {}

  async create(data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.entity)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.entity)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.entity)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.entity)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as T | null;
  }

  async findMany(options?: FindManyOptions): Promise<T[]> {
    let query = this.supabase.from(this.entity).select('*');
    const { filters, limit, offset, orderBy, order } = options || {};
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
    }

    if (orderBy) {
      query = query.order(orderBy, { ascending: order !== 'DESC' });
    }

    if (limit !== undefined) {
      const from = offset || 0;
      const to = from + limit - 1;
      query = query.range(from, to);
    } else if (offset !== undefined) {
      query = query.range(offset, 1000000); // Large number if limit not specified
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }

  async count(filters?: any): Promise<number> {
    let query = this.supabase.from(this.entity).select('*', { count: 'exact', head: true });
    
    if (filters) {
        Object.keys(filters).forEach(key => {
          query = query.eq(key, filters[key]);
        });
      }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }
}
