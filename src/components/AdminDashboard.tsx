import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  LogOut,
  Home,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Settings
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { supabase, Registration } from '../lib/supabase';

function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, signOut } = useAdminAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTicketType, setFilterTicketType] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, filterStatus, filterTicketType]);

  const fetchRegistrations = async () => {
    try {
      // Debug: Check if admin is authenticated
      console.log('Admin user:', admin);
      
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });
      
      if (error) throw error;
      setRegistrations(data || []);
    } catch (err: any) {
      console.error('Fetch registrations error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = registrations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.nik.includes(searchTerm) ||
        reg.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.nomer_hp.includes(searchTerm)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(reg => reg.payment_status === filterStatus);
    }

    // Ticket type filter
    if (filterTicketType !== 'all') {
      filtered = filtered.filter(reg => reg.jenis_tiket === filterTicketType);
    }

    setFilteredRegistrations(filtered);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/admin/login');
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Lunas' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Gagal' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Calculate statistics
  const stats = {
    total: registrations.length,
    completed: registrations.filter(r => r.payment_status === 'completed').length,
    pending: registrations.filter(r => r.payment_status === 'pending').length,
    revenue: registrations
      .filter(r => r.payment_status === 'completed')
      .reduce((sum, r) => sum + r.ticket_price, 0)
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
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-light tracking-wide text-black">
              ADMIN DASHBOARD
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm font-light text-gray-600">
                {admin?.user_name} ({admin?.user_email})
              </div>
              <button 
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                <span className="text-sm font-light tracking-wide">BERANDA</span>
              </button>
              <button 
                onClick={() => navigate('/admin/api-docs')}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                <span className="text-sm font-light tracking-wide">API DOCS</span>
              </button>
              <button 
                onClick={() => navigate('/admin/race-management')}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <Settings className="w-5 h-5 mr-2" />
                <span className="text-sm font-light tracking-wide">RACE MGMT</span>
              </button>
              <button 
                onClick={() => navigate('/admin/race-management')}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <Settings className="w-5 h-5 mr-2" />
                <span className="text-sm font-light tracking-wide">RACE MGMT</span>
              </button>
              <button 
                onClick={handleSignOut}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span className="text-sm font-light tracking-wide">KELUAR</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <div className="text-2xl font-light text-black">{stats.total}</div>
                <div className="text-sm font-light tracking-wide uppercase text-gray-600">Total Registrasi</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <div className="text-2xl font-light text-black">{stats.completed}</div>
                <div className="text-sm font-light tracking-wide uppercase text-gray-600">Pembayaran Lunas</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <div className="text-2xl font-light text-black">{stats.pending}</div>
                <div className="text-sm font-light tracking-wide uppercase text-gray-600">Pending</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <div className="text-2xl font-light text-black">{formatPrice(stats.revenue)}</div>
                <div className="text-sm font-light tracking-wide uppercase text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, NIK, atau nomor tiket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Semua Status</option>
              <option value="completed">Lunas</option>
              <option value="pending">Pending</option>
              <option value="failed">Gagal</option>
            </select>
            
            <select
              value={filterTicketType}
              onChange={(e) => setFilterTicketType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Semua Tiket</option>
              <option value="fun-run">Fun Run (5K)</option>
              <option value="half-marathon">Half Marathon (21K)</option>
              <option value="full-marathon">Full Marathon (42K)</option>
            </select>
            
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
              <Download className="w-5 h-5 mr-2" />
              Export CSV
            </button>
            <button 
              onClick={fetchRegistrations}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            <div className="text-sm font-medium mb-2">Error fetching data:</div>
            <div className="text-sm">{error}</div>
            <button 
              onClick={fetchRegistrations}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-light text-black">
              Data Registrasi ({filteredRegistrations.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peserta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{registration.nama}</div>
                        <div className="text-sm text-gray-500">{registration.nik}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{registration.ticket_number}</div>
                      <div className="text-sm text-gray-500">{getTicketTypeName(registration.jenis_tiket)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        registration.user_type === 'ASN' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {registration.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(registration.ticket_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(registration.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(registration.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-light text-gray-600">Tidak ada data registrasi</div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Detail Registrasi</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama Lengkap</label>
                  <div className="text-sm text-gray-900">{selectedRegistration.nama}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">NIK</label>
                  <div className="text-sm text-gray-900">{selectedRegistration.nik}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nomor HP</label>
                  <div className="text-sm text-gray-900">{selectedRegistration.nomer_hp}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipe Peserta</label>
                  <div className="text-sm text-gray-900">{selectedRegistration.user_type}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Jenis Tiket</label>
                  <div className="text-sm text-gray-900">{getTicketTypeName(selectedRegistration.jenis_tiket)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nomor Tiket</label>
                  <div className="text-sm text-gray-900">{selectedRegistration.ticket_number}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Kabupaten/Kota</label>
                  <div className="text-sm text-gray-900">{selectedRegistration.kab_kota}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Harga Tiket</label>
                  <div className="text-sm text-gray-900">{formatPrice(selectedRegistration.ticket_price)}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Alamat</label>
                <div className="text-sm text-gray-900">{selectedRegistration.alamat}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status Pembayaran</label>
                  <div className="mt-1">{getStatusBadge(selectedRegistration.payment_status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tanggal Registrasi</label>
                  <div className="text-sm text-gray-900">{formatDate(selectedRegistration.created_at)}</div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Tutup
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                Edit Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;