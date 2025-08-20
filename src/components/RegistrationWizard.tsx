import { useState } from 'react';
import AddressSelector from './AddressSelector';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, User, CreditCard, QrCode, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { createMidtransTransaction, getTicketTypeName, MIDTRANS_CONFIG } from '../lib/midtrans';

interface FormData {
  userType: 'ASN' | 'Umum' | '';
  nik: string;
  nama: string;
  nomerHp: string;
  email: string;
  password: string;
  confirmPassword: string;
  alamat: string;
  jenisTicket: string;
  // Address fields
  province: string;
  regency: string;
  district: string;
  village: string;
  fullAddress: string;
}

function RegistrationWizard() {
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    userType: '',
    nik: '',
    nama: '',
    nomerHp: '',
    email: '',
    password: '',
    confirmPassword: '',
    alamat: '',
    jenisTicket: '',
    // Address fields
    province: '',
    regency: '',
    district: '',
    village: '',
    fullAddress: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAccount, setHasAccount] = useState(false);
  const [, setSnapToken] = useState<string>('');

  const steps = [
    { number: 1, title: 'Pilih Tipe', icon: User },
    { number: 2, title: 'Data Diri', icon: User },
    { number: 3, title: 'Pembayaran', icon: CreditCard }
  ];

  const ticketTypes = [
    { id: 'fun-run', name: 'Fun Run', distance: '5K', price: { ASN: 90000, Umum: 112500 } },
    { id: 'half-marathon', name: 'Half Marathon', distance: '21K', price: { ASN: 150000, Umum: 187500 } },
    { id: 'full-marathon', name: 'Full Marathon', distance: '42K', price: { ASN: 210000, Umum: 262500 } }
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleAddressChange = (addressData: {
    province: string;
    regency: string;
    district: string;
    village: string;
    fullAddress: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      province: addressData.province,
      regency: addressData.regency,
      district: addressData.district,
      village: addressData.village,
      alamat: addressData.fullAddress
    }));
  };

  const getTicketPrice = () => {
    const selectedTicket = ticketTypes.find(t => t.id === formData.jenisTicket);
    if (!selectedTicket || !formData.userType) return 0;
    return selectedTicket.price[formData.userType];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      // Handle authentication before moving to payment
      setLoading(true);
      setError('');

      try {
        if (hasAccount) {
          // Sign in existing user
          const { error: signInError } = await signIn(formData.email, formData.password);
          if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
          }
        } else {
          // Create new account
          if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok');
            setLoading(false);
            return;
          }
          
          const { error: signUpError } = await signUp(formData.email, formData.password);
          if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
          }
        }
        
        setLoading(false);
        setCurrentStep(currentStep + 1);
      } catch (err) {
        setError('Terjadi kesalahan. Silakan coba lagi.');
        setLoading(false);
      }
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const handlePayment = async () => {
    if (!user) {
      setError('User tidak ditemukan');
      return;
    }

    setLoading(true);
    setShowPayment(true);
    setError('');

    try {
      // Check if NIK already exists
      const { data: existingRegistration } = await supabase
        .from('registrations')
        .select('id')
        .eq('nik', formData.nik)
        .single();

      if (existingRegistration) {
        setError('NIK sudah terdaftar');
        setLoading(false);
        setShowPayment(false);
        return;
      }

      // Save registration to database
      const { data, error: insertError } = await supabase
        .from('registrations')
        .insert({
          user_id: user.id,
          user_type: formData.userType,
          nik: formData.nik,
          nama: formData.nama,
          nomer_hp: formData.nomerHp,
          alamat: formData.alamat,
          jenis_tiket: formData.jenisTicket,
          kab_kota: formData.regency,
          ticket_price: getTicketPrice(),
          payment_status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Create Midtrans transaction
      const transactionData = {
        transaction_details: {
          order_id: data.id,
          gross_amount: getTicketPrice()
        },
        customer_details: {
          first_name: formData.nama,
          email: formData.email,
          phone: formData.nomerHp
        },
        item_details: [{
          id: formData.jenisTicket,
          price: getTicketPrice(),
          quantity: 1,
          name: `KORPRI RUN 2025 - ${getTicketTypeName(formData.jenisTicket)}`
        }]
      };

      const midtransResponse = await createMidtransTransaction(transactionData);
      setSnapToken(midtransResponse.token);

      // Load Midtrans Snap script
      const script = document.createElement('script');
      script.src = MIDTRANS_CONFIG.isProduction 
        ? 'https://app.midtrans.com/snap/snap.js' 
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', MIDTRANS_CONFIG.clientKey);
      document.head.appendChild(script);

      script.onload = () => {
        // @ts-ignore
        window.snap.pay(midtransResponse.token, {
          onSuccess: function(result: any) {
            console.log('Payment success:', result);
            navigate('/dashboard', { 
              state: { 
                registrationSuccess: true,
                registrationData: data
              }
            });
          },
          onPending: function(result: any) {
            console.log('Payment pending:', result);
            navigate('/dashboard', { 
              state: { 
                registrationSuccess: true,
                registrationData: data,
                paymentPending: true
              }
            });
          },
          onError: function(result: any) {
            console.log('Payment error:', result);
            setError('Pembayaran gagal. Silakan coba lagi.');
            setShowPayment(false);
          },
          onClose: function() {
            console.log('Payment popup closed');
            setShowPayment(false);
          }
        });
      };

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Terjadi kesalahan saat mendaftar');
      setShowPayment(false);
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Save user data to Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert(
          {
            email: formData.email,
            nama: formData.nama,
            nik: formData.nik,
            nomer_hp: formData.nomerHp,
            alamat: formData.alamat,
            provinsi: formData.province,
            kabupaten: formData.regency,
            kecamatan: formData.district,
            kelurahan: formData.village,
            user_type: formData.userType,
            jenis_tiket: formData.jenisTicket,
          },
          { onConflict: 'email' }
        )
        .select()
        .single();

      if (userError) {
        throw userError;
      }

      // Save registration to database
      const { data, error: insertError } = await supabase
        .from('registrations')
        .insert({
          user_id: userData.id,
          user_type: formData.userType,
          nik: formData.nik,
          nama: formData.nama,
          nomer_hp: formData.nomerHp,
          alamat: formData.alamat,
          jenis_tiket: formData.jenisTicket,
          kab_kota: formData.regency,
          ticket_price: getTicketPrice(),
          payment_status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Create Midtrans transaction
      const transactionData = {
        transaction_details: {
          order_id: data.id,
          gross_amount: getTicketPrice()
        },
        customer_details: {
          first_name: formData.nama,
          email: formData.email,
          phone: formData.nomerHp
        },
        item_details: [{
          id: formData.jenisTicket,
          price: getTicketPrice(),
          quantity: 1,
          name: `KORPRI RUN 2025 - ${getTicketTypeName(formData.jenisTicket)}`
        }]
      };

      const midtransResponse = await createMidtransTransaction(transactionData);
      setSnapToken(midtransResponse.token);

      // Load Midtrans Snap script
      const script = document.createElement('script');
      script.src = MIDTRANS_CONFIG.isProduction 
        ? 'https://app.midtrans.com/snap/snap.js' 
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', MIDTRANS_CONFIG.clientKey);
      document.head.appendChild(script);

      script.onload = () => {
        // @ts-ignore
        window.snap.pay(midtransResponse.token, {
          onSuccess: function(result: any) {
            console.log('Payment success:', result);
            navigate('/dashboard', { 
              state: { 
                registrationSuccess: true,
                registrationData: data
              }
            });
          },
          onPending: function(result: any) {
            console.log('Payment pending:', result);
            navigate('/dashboard', { 
              state: { 
                registrationSuccess: true,
                registrationData: data,
                paymentPending: true
              }
            });
          },
          onError: function(result: any) {
            console.log('Payment error:', result);
            setError('Pembayaran gagal. Silakan coba lagi.');
            setShowPayment(false);
          },
          onClose: function() {
            console.log('Payment popup closed');
            setShowPayment(false);
          }
        });
      };

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Terjadi kesalahan saat mendaftar');
      setShowPayment(false);
    }
    
    setLoading(false);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.userType && formData.jenisTicket;
      case 2:
        const basicFields = formData.nik && formData.nama && formData.nomerHp && formData.email && formData.alamat && formData.regency;
        if (hasAccount) {
          return basicFields && formData.password;
        } else {
          return basicFields && formData.password && formData.confirmPassword && formData.password.length >= 6;
        }
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-light tracking-wide">KEMBALI</span>
            </button>
            <div className="text-xl font-light tracking-wide text-black">
              REGISTRASI KORPRI RUN
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                  currentStep >= step.number 
                    ? 'bg-red-600 border-red-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-light tracking-wide ${
                    currentStep >= step.number ? 'text-black' : 'text-gray-400'
                  }`}>
                    STEP {step.number}
                  </div>
                  <div className={`text-lg font-light ${
                    currentStep >= step.number ? 'text-black' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-8 ${
                    currentStep > step.number ? 'bg-red-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Ticket Selection */}
          {currentStep === 1 && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-light tracking-tight text-black mb-4">
                  Pilih Tipe Peserta & Tiket
                </h2>
                <div className="w-16 h-px bg-red-600 mx-auto"></div>
              </div>

              {/* User Type Selection */}
              <div className="space-y-6">
                <h3 className="text-xl font-light text-black">Tipe Peserta</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['ASN', 'Umum'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleInputChange('userType', type as 'ASN' | 'Umum')}
                      className={`p-6 border-2 rounded-lg text-left transition-colors ${
                        formData.userType === type
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg font-light text-black">{type}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {type === 'ASN' ? 'Aparatur Sipil Negara' : 'Masyarakat Umum'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket Type Selection */}
              {formData.userType && (
                <div className="space-y-6">
                  <h3 className="text-xl font-light text-black">Jenis Tiket</h3>
                  <div className="space-y-4">
                    {ticketTypes.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => handleInputChange('jenisTicket', ticket.id)}
                        className={`w-full p-6 border-2 rounded-lg text-left transition-colors ${
                          formData.jenisTicket === ticket.id
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-lg font-light text-black">{ticket.name}</div>
                            <div className="text-sm text-gray-600">{ticket.distance}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-light text-red-600">
                              {formatPrice(ticket.price[formData.userType])}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formData.userType === 'ASN' ? 'Harga ASN' : 'Harga Umum'}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Personal Data + Authentication */}
          {currentStep === 2 && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-light tracking-tight text-black mb-4">
                  Data Diri & Akun
                </h2>
                <div className="w-16 h-px bg-red-600 mx-auto"></div>
              </div>

              {/* Account Type Toggle */}
              <div className="text-center">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setHasAccount(false)}
                    className={`px-6 py-2 text-sm font-light tracking-wide transition-colors ${
                      !hasAccount
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    BUAT AKUN BARU
                  </button>
                  <button
                    onClick={() => setHasAccount(true)}
                    className={`px-6 py-2 text-sm font-light tracking-wide transition-colors ${
                      hasAccount
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    SUDAH PUNYA AKUN
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                      NIK
                    </label>
                    <input
                      type="text"
                      value={formData.nik}
                      onChange={(e) => handleInputChange('nik', e.target.value)}
                      className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:border-red-600 focus:ring-0 bg-transparent text-lg font-light"
                      placeholder="Nomor Induk Kependudukan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => handleInputChange('nama', e.target.value)}
                      className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:border-red-600 focus:ring-0 bg-transparent text-lg font-light"
                      placeholder="Nama sesuai KTP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                      Nomor HP
                    </label>
                    <input
                      type="tel"
                      value={formData.nomerHp}
                      onChange={(e) => handleInputChange('nomerHp', e.target.value)}
                      className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:border-red-600 focus:ring-0 bg-transparent text-lg font-light"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                      Kabupaten/Kota
                    </label>
                    <input
                      type="text"
                      value={formData.kabKota}
                      onChange={(e) => handleInputChange('kabKota', e.target.value)}
                      className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:border-red-600 focus:ring-0 bg-transparent text-lg font-light"
                      placeholder="Kabupaten/Kota"
                    />
                  </div>
                </div>
                <div className="space-y-6">
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
                        placeholder={hasAccount ? "Password akun Anda" : "Minimal 6 karakter"}
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
                  {!hasAccount && (
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
                          minLength={6}
                        />
                      </div>
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                    <AddressSelector onAddressChange={handleAddressChange} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-light tracking-tight text-black mb-4">
                  Pembayaran
                </h2>
                <div className="w-16 h-px bg-red-600 mx-auto"></div>
              </div>

              {!showPayment ? (
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-50 p-8 rounded-lg mb-8">
                    <h3 className="text-xl font-light text-black mb-6">Ringkasan Pesanan</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipe Peserta</span>
                        <span className="font-light">{formData.userType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jenis Tiket</span>
                        <span className="font-light">
                          {ticketTypes.find(t => t.id === formData.jenisTicket)?.name}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg">
                          <span className="font-light">Total</span>
                          <span className="font-light text-red-600">
                            {formatPrice(getTicketPrice())}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className={`w-full py-4 text-lg font-light tracking-wide transition-colors flex items-center justify-center ${
                      loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    {loading ? 'MEMPROSES...' : 'BAYAR SEKARANG'}
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto text-center">
                  <div className="bg-blue-50 border-2 border-blue-200 p-8 rounded-lg">
                    <CreditCard className="w-32 h-32 mx-auto text-blue-400 mb-4" />
                    <h3 className="text-xl font-light text-black mb-2">Memproses Pembayaran</h3>
                    <p className="text-gray-600 mb-4">
                      Silakan selesaikan pembayaran di jendela yang terbuka
                    </p>
                    <div className="text-2xl font-light text-red-600 mb-4">
                      {formatPrice(getTicketPrice())}
                    </div>
                    <div className="text-sm text-gray-500">
                      Jendela pembayaran akan terbuka secara otomatis
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {!showPayment && (
            <div className="flex justify-between pt-12 border-t border-gray-200">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="text-sm font-light tracking-wide">
                  {currentStep === 1 ? 'KEMBALI KE BERANDA' : 'SEBELUMNYA'}
                </span>
              </button>
              
              {currentStep < 3 && (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid() || loading}
                  className={`flex items-center px-8 py-3 text-sm font-light tracking-wide transition-colors ${
                    isStepValid() && !loading
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>{loading ? 'MEMPROSES...' : 'SELANJUTNYA'}</span>
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistrationWizard;