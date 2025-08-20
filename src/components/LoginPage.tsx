import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const checkProfileComplete = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return false;
    
    // Check if required profile fields are filled
    return !!(data.nik && data.nama && data.nomer_hp && data.alamat);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data: signInData, error: signInError } = await signIn(formData.email, formData.password);
        if (signInError) {
          setError(signInError.message);
        } else if (signInData?.user?.id) {
          // After successful login, check if profile is complete
          const isProfileComplete = await checkProfileComplete(signInData.user.id);
          if (isProfileComplete) {
            navigate('/dashboard');
          } else {
            navigate('/profile', { state: { fromLogin: true } });
          }
        } else {
          setError('Gagal masuk. Silakan coba lagi.');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Password tidak cocok');
          setLoading(false);
          return;
        }
        
        const { error: signUpError } = await signUp(formData.email, formData.password);
        if (signUpError) {
          setError(signUpError.message);
        } else {
          // After signup, redirect to profile to complete registration
          navigate('/profile', { state: { fromSignup: true } });
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-light tracking-wide">KEMBALI</span>
            </button>
            <div className="text-xl font-light tracking-wide text-black">
              {isLogin ? 'MASUK' : 'DAFTAR'} AKUN
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light tracking-tight text-black mb-4">
              {isLogin ? 'Masuk ke Akun' : 'Buat Akun Baru'}
            </h1>
            <div className="w-16 h-px bg-red-600 mx-auto"></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-0 top-4 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-8 pr-0 py-4 border-0 border-b border-gray-200 focus:border-red-600 focus:ring-0 bg-transparent text-lg font-light"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-0 top-4 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-8 pr-12 py-4 border-0 border-b border-gray-200 focus:border-red-600 focus:ring-0 bg-transparent text-lg font-light"
                  placeholder="Masukkan password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-0 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full pl-8 pr-0 py-4 border-0 border-b border-gray-200 focus:border-red-600 focus:ring-0 bg-transparent text-lg font-light"
                    placeholder="Ulangi password"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg font-light tracking-wide transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {loading ? 'MEMPROSES...' : (isLogin ? 'MASUK' : 'DAFTAR')}
            </button>
          </form>

          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 font-light">
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: formData.email, password: '', confirmPassword: '' });
              }}
              className="text-red-600 hover:text-red-700 font-light tracking-wide mt-2"
            >
              {isLogin ? 'DAFTAR SEKARANG' : 'MASUK DI SINI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;