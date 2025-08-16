import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AdminUser = {
  user_id: string;
  user_email: string;
  user_name: string;
  user_role: string;
};

export type Registration = {
  id: string;
  user_id: string;
  user_type: 'ASN' | 'Umum';
  nik: string;
  nama: string;
  nomer_hp: string;
  alamat: string;
  jenis_tiket: 'fun-run' | 'half-marathon' | 'full-marathon';
  kab_kota: string;
  ticket_price: number;
  payment_status: 'pending' | 'completed' | 'failed';
  ticket_number: string;
  created_at: string;
  updated_at: string;
};