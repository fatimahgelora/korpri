import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Download, Calendar, MapPin, Clock, User, Mail, Phone, Home, LogOut, Plus, QrCode, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, Registration } from '../lib/supabase';
import QRCodeGenerator from './QRCodeGenerator';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string>('');

  const { registrationSuccess } = location.state || {};
  const { paymentPending } = location.state || {};

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTicketTypeName = (ticketId: string) => {
    const ticketTypes: { [key: string]: string } = {
      'fun-run': 'Fun Run (5K)',
      'half-marathon': 'Half Marathon (21K)',
      'full-marathon': 'Full Marathon (42K)'
    };
    return ticketTypes[ticketId] || ticketId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-light text-gray-600">Memuat data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-light tracking-wide text-black">
              DASHBOARD
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
                title="Profil Saya"
              >
                <UserIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-light">Profil</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                <span className="text-sm font-light tracking-wide"></span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span className="text-sm font-light tracking-wide"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Success Message */}
        {registrationSuccess && (
          <div className={`${paymentPending ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'} border rounded-lg p-8 mb-12 text-center`}>
            <div className={`w-16 h-16 ${paymentPending ? 'bg-yellow-600' : 'bg-green-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {paymentPending ? <Clock className="w-8 h-8 text-white" /> : <Check className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-3xl font-light tracking-tight text-black mb-4">
              {paymentPending ? 'Registrasi Berhasil - Menunggu Pembayaran' : 'Registrasi Berhasil!'}
            </h1>
            <p className="text-lg font-light text-gray-700">
              {paymentPending
                ? 'Registrasi Anda berhasil dibuat. Silakan selesaikan pembayaran untuk mengaktifkan tiket.'
                : 'Selamat! Anda telah berhasil mendaftar untuk KORPRI RUN 2025'
              }
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8 text-sm">
            {error}
          </div>
        )}

        {/* No Registrations */}
        {registrations.length === 0 && !loading && (
          <div className="text-center py-16">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-light text-gray-600 mb-4">
              Belum Ada Registrasi
            </h2>
            <p className="text-gray-500 mb-8">
              Anda belum mendaftar untuk event KORPRI RUN 2025
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-light tracking-wide text-gray-900">
                    Dashboard
                  </h2>
                  <p className="text-gray-600">
                    Lihat status pendaftaran dan tiket Anda
                  </p>
                </div>
                <button
                  onClick={() => navigate('/event/register')}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Daftar Event Baru
                </button>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 text-white px-8 py-3 text-sm font-light tracking-wide hover:bg-red-700 transition-colors flex items-center mx-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Daftar Sekarang
              </button>
            </div>
          </div>
        )}

        {/* Registrations List */}
        {registrations.length > 0 && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-light tracking-tight text-black">
                Registrasi Anda
              </h1>
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 text-white px-6 py-2 text-sm font-light tracking-wide hover:bg-red-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                DAFTAR LAGI
              </button>
            </div>

            {registrations.map((registration) => (
              <div key={registration.id} className="grid lg:grid-cols-3 gap-12">
                {/* Registration Details */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Ticket Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-light tracking-tight text-black mb-8">
                      Informasi Tiket
                    </h2>

                    <div className="bg-red-600 text-white p-8 rounded-lg mb-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="text-2xl font-light tracking-wide">KORPRI RUN 2025</div>
                          <div className="text-sm opacity-90">15 Maret 2025 • Jakarta</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm opacity-90">No. Tiket</div>
                          <div className="text-lg font-light">{registration.ticket_number}</div>
                        </div>
                      </div>

                      <div className="border-t border-white/20 pt-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <div className="text-sm opacity-90">Peserta</div>
                            <div className="text-lg font-light">{registration.nama}</div>
                          </div>
                          <div>
                            <div className="text-sm opacity-90">Kategori</div>
                            <div className="text-lg font-light">{getTicketTypeName(registration.jenis_tiket)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="w-full bg-gray-100 text-gray-700 py-3 text-sm font-light tracking-wide hover:bg-gray-200 transition-colors flex items-center justify-center">
                      <Download className="w-5 h-5 mr-2" />
                      DOWNLOAD TIKET PDF
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTicket(registration.ticket_number);
                        setShowQRModal(true);
                      }}
                      className="w-full bg-red-600 text-white py-3 text-sm font-light tracking-wide hover:bg-red-700 transition-colors flex items-center justify-center mt-2"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      TAMPILKAN QR CODE
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTicket(registration.ticket_number);
                        setShowQRModal(true);
                      }}
                      className="w-full bg-red-600 text-white py-3 text-sm font-light tracking-wide hover:bg-red-700 transition-colors flex items-center justify-center mt-2"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      TAMPILKAN QR CODE
                    </button>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-light tracking-tight text-black mb-8">
                      Data Peserta
                    </h2>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <div className="text-sm font-light tracking-wide uppercase text-gray-600 mb-1">
                            Tipe Peserta
                          </div>
                          <div className="text-lg font-light text-black">{registration.user_type}</div>
                        </div>
                        <div>
                          <div className="text-sm font-light tracking-wide uppercase text-gray-600 mb-1">
                            NIK
                          </div>
                          <div className="text-lg font-light text-black">{registration.nik}</div>
                        </div>
                        <div>
                          <div className="text-sm font-light tracking-wide uppercase text-gray-600 mb-1">
                            Nama Lengkap
                          </div>
                          <div className="text-lg font-light text-black">{registration.nama}</div>
                        </div>
                        <div>
                          <div className="text-sm font-light tracking-wide uppercase text-gray-600 mb-1">
                            Nomor HP
                          </div>
                          <div className="text-lg font-light text-black">{registration.nomer_hp}</div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <div className="text-sm font-light tracking-wide uppercase text-gray-600 mb-1">
                            Email
                          </div>
                          <div className="text-lg font-light text-black">{user?.email}</div>
                        </div>
                        <div>
                          <div className="text-sm font-light tracking-wide uppercase text-gray-600 mb-1">
                            Alamat
                          </div>
                          <div className="text-lg font-light text-black">{registration.alamat}</div>
                        </div>
                        <div>
                          <div className="text-sm font-light tracking-wide uppercase text-gray-600 mb-1">
                            Kabupaten/Kota
                          </div>
                          <div className="text-lg font-light text-black">{registration.kab_kota}</div>
                        </div>
                        <div>
                          <div className="text-sm font-light tracking-wide uppercase text-gray-600 mb-1">
                            Jenis Tiket
                          </div>
                          <div className="text-lg font-light text-black">{getTicketTypeName(registration.jenis_tiket)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                  {/* Payment Status */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-light text-black mb-4">Status Pembayaran</h3>
                    <div className="flex items-center text-green-600 mb-4">
                      <Check className="w-5 h-5 mr-2" />
                      <span className="font-light">Pembayaran Berhasil</span>
                    </div>
                    <div className="text-2xl font-light text-black mb-2">
                      {formatPrice(registration.ticket_price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Dibayar via QRIS
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDate(registration.created_at)}
                    </div>
                  </div>

                  {/* Event Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-light text-black mb-6">Informasi Event</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <div className="font-light text-black">15 Maret 2025</div>
                          <div className="text-sm text-gray-600">Sabtu</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <div className="font-light text-black">05:00 WIB</div>
                          <div className="text-sm text-gray-600">Registrasi dimulai</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <div className="font-light text-black">Jakarta</div>
                          <div className="text-sm text-gray-600">Lokasi akan diumumkan</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-light text-black mb-6">Butuh Bantuan?</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <div className="font-light text-black">+62 21 1234 5678</div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <div className="font-light text-black">info@korprirun.id</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">QR Code Tiket</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-8 text-center">
              <QRCodeGenerator value={selectedTicket} size={250} className="mx-auto mb-4" />
              <div className="text-sm text-gray-600 mb-2">Nomor Tiket:</div>
              <div className="text-lg font-medium text-black mb-4">{selectedTicket}</div>
              <div className="text-xs text-gray-500">
                Tunjukkan QR code ini kepada petugas untuk penukaran nomor punggung
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">QR Code Tiket</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-8 text-center">
              <QRCodeGenerator value={selectedTicket} size={250} className="mx-auto mb-4" />
              <div className="text-sm text-gray-600 mb-2">Nomor Tiket:</div>
              <div className="text-lg font-medium text-black mb-4">{selectedTicket}</div>
              <div className="text-xs text-gray-500">
                Tunjukkan QR code ini kepada petugas untuk penukaran nomor punggung
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;