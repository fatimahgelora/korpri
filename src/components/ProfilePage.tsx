import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Home, MapPin, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface ProfileData {
  nik: string;
  nama: string;
  email: string;
  nomer_hp: string;
  alamat: string;
  province: string;
  regency: string;
  district: string;
  village: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    nik: '',
    nama: '',
    email: '',
    nomer_hp: '',
    alamat: '',
    province: '',
    regency: '',
    district: '',
    village: ''
  });

  // Handle redirect states and fetch profile data
  useEffect(() => {
    // Check if coming from login or signup
    if (location.state?.fromSignup) {
      setShowWelcome(true);
      setShowCompleteProfile(true);
      setSuccess('Akun berhasil dibuat! Silakan lengkapi profil Anda.');
    } else if (location.state?.fromLogin) {
      setShowCompleteProfile(true);
      setSuccess('Silakan lengkapi profil Anda untuk melanjutkan.');
    }

    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            nik: data.nik || '',
            nama: data.nama || '',
            email: data.email || '',
            nomer_hp: data.nomer_hp || '',
            alamat: data.alamat || '',
            province: data.province || '',
            regency: data.regency || '',
            district: data.district || '',
            village: data.village || '',
          });
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Gagal memuat profil. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, location.state]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Basic validation
    if (!formData.nik || !formData.nama || !formData.nomer_hp || !formData.alamat) {
      setError('Harap isi semua kolom yang wajib diisi');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setSuccess('Profil berhasil disimpan!');
      setShowCompleteProfile(false);

      // If this was the first time completing the profile, refresh the page to update the UI
      if (showCompleteProfile) {
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center">
            <button
              onClick={() => showCompleteProfile ? navigate('/dashboard') : navigate(-1)}
              className="flex items-center text-gray-600 hover:text-black transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-light tracking-wide">KEMBALI</span>
            </button>
            <h1 className="text-xl font-light tracking-wide text-black">
              {showWelcome ? 'SELAMAT DATANG' : 'PROFIL SAYA'}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          {showWelcome && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Selamat datang di KORPRI RUN 2025!</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Lengkapi profil Anda untuk melanjutkan pendaftaran event.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-8 text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && !showWelcome && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-8 text-sm flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-2">
              {showWelcome ? 'Lengkapi Profil Anda' : 'Profil Saya'}
            </h2>
            <p className="text-gray-600">
              {showWelcome
                ? 'Mohon lengkapi data diri Anda untuk melanjutkan'
                : 'Kelola informasi profil Anda untuk mengontrol, melindungi, dan mengamankan akun'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NIK */}
              <div>
                <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                  NIK <span className="text-blue-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => handleInputChange('nik', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nomor Induk Kependudukan"
                    required
                  />
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                  Nama Lengkap <span className="text-blue-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => handleInputChange('nama', e.target.value)}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nama lengkap sesuai KTP"
                    required
                  />
                </div>
              </div>

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
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                </div>
              </div>

              {/* Nomor HP */}
              <div>
                <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                  Nomor HP <span className="text-blue-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.nomer_hp}
                    onChange={(e) => handleInputChange('nomer_hp', e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="081234567890"
                    required
                  />
                </div>
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                  Provinsi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provinsi"
                  />
                </div>
              </div>

              {/* City/Regency */}
              <div>
                <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                  Kabupaten/Kota
                </label>
                <input
                  type="text"
                  value={formData.regency}
                  onChange={(e) => handleInputChange('regency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kabupaten/Kota"
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kecamatan"
                />
              </div>

              {/* Village */}
              <div>
                <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                  Kelurahan/Desa
                </label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kelurahan/Desa"
                />
              </div>

              {/* Alamat Lengkap */}
              <div className="md:col-span-2">
                <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                  Alamat Lengkap <span className="text-blue-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3">
                    <Home className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    value={formData.alamat}
                    onChange={(e) => handleInputChange('alamat', e.target.value)}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Alamat lengkap sesuai KTP"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center justify-center w-full py-3 px-4 rounded text-white font-medium tracking-wide transition-colors ${saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    MENYIMPAN...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    SIMPAN PERUBAHAN
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
