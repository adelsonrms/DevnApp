import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseService {
  private static instance: SupabaseService;
  private _client?: SupabaseClient;

  private constructor() {}

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public get client(): SupabaseClient {
    if (!this._client) {
      const supabaseUrl = process.env.SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase config missing: SUPABASE_URL and SUPABASE_SERVICE_KEY');
      }

      this._client = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    return this._client;
  }
}
