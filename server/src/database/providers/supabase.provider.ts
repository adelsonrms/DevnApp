import { IRepository } from '../repository.interface';
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

  async findMany(filters?: any): Promise<T[]> {
    let query = this.supabase.from(this.entity).select('*');
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
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
