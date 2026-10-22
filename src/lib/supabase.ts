import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'abccompany_supabase_url';
const STORAGE_KEY_KEY = 'abccompany_supabase_anon_key';

const DEFAULT_SUPABASE_URL = 'https://numqkiodetwrvlsekaln.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_pj0Ahny9r4mIHjAUzPjhPA_aZ2nU7DD';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
  
  const storedUrl = localStorage.getItem(STORAGE_KEY_URL) || envUrl;
  const storedKey = localStorage.getItem(STORAGE_KEY_KEY) || envKey;
  
  return {
    url: storedUrl.trim(),
    anonKey: storedKey.trim(),
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (url.trim()) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }
  
  if (anonKey.trim()) {
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }
  
  const currentKey = `${url}:${anonKey}`;
  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }
  
  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url.startsWith('https://')) {
      return { success: false, message: 'Supabase URL must start with https://' };
    }
    const testClient = createClient(url, anonKey);
    // Ping public table or auth
    const { error } = await testClient.from('vouchers').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.vouchers" does not exist')) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase instance!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}
