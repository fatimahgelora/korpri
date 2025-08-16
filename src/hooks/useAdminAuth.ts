import { useState, useEffect } from 'react';
import { supabase, AdminUser } from '../lib/supabase';

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in from localStorage
    const adminData = localStorage.getItem('admin_user');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc('verify_admin_login', {
        input_email: email,
        input_password: password
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const adminUser = data[0];
        setAdmin(adminUser);
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        return { data: adminUser, error: null };
      } else {
        return { data: null, error: { message: 'Invalid credentials' } };
      }
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const signOut = () => {
    setAdmin(null);
    localStorage.removeItem('admin_user');
  };

  return {
    admin,
    loading,
    signIn,
    signOut
  };
}