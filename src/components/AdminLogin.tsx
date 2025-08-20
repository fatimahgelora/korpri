import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

function AdminLogin() {
  const navigate = useNavigate();
  const { signIn } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      if (error) {
        setError('Email atau password salah');
      } else if (data) {
        navigate('/admin/dashboard');
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
              ADMIN LOGIN
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-light tracking-tight text-black mb-4">
              Admin Panel
            </h1>
            <div className="w-16 h-px bg-blue-600 mx-auto"></div>
          </div>

          {error && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 text-sm">
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
                  className="w-full pl-8 pr-0 py-4 border-0 border-b border-gray-200 focus:border-blue-600 focus:ring-0 bg-transparent text-lg font-light"
                  placeholder="admin@admin.com"
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
                  className="w-full pl-8 pr-12 py-4 border-0 border-b border-gray-200 focus:border-blue-600 focus:ring-0 bg-transparent text-lg font-light"
                  placeholder="Masukkan password"
                  required
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg font-light tracking-wide transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'MEMPROSES...' : 'MASUK'}
            </button>
          </form>

          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Hanya untuk administrator KORPRI RUN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;