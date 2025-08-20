import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function UserRegistrationForm() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        setError('Email sudah terdaftar');
        setLoading(false);
        return;
      }

      // Create auth user
      const { error: signUpError } = await signUp(formData.email, formData.password);
      if (signUpError) throw signUpError;

      // Get the newly created user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Gagal mendapatkan data pengguna');

      // Create minimal user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: formData.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Redirect to profile completion page
      navigate('/profile', { 
        state: { 
          registrationSuccess: true,
          message: 'Pendaftaran akun berhasil! Silakan lengkapi profil Anda.'
        } 
      });

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali
        </button>
        <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-2">
          Buat Akun Baru
        </h1>
        <p className="text-gray-600">
          Buat akun Anda dengan email dan password
        </p>
      </div>

      {error && (
        <div className="bg-blue-50 border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@contoh.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Minimal 6 karakter"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
              Konfirmasi Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ulangi password"
                minLength={6}
                required
              />
            </div>
          </div>

        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded text-white font-medium tracking-wide transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Masuk di sini
        </Link>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Data pribadi lainnya dapat dilengkapi di halaman profil setelah login.
      </div>
    </div>
  );
}
