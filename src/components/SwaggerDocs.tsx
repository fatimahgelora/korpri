import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Code, Database, Key, Users, Shield, FileText, Search, Play, Copy, CheckCircle, Trophy } from 'lucide-react';

function SwaggerDocs() {
  const navigate = useNavigate();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [authToken, setAuthToken] = useState('');
  const [testParams, setTestParams] = useState<{ [key: string]: any }>({});

  // Ticket pricing data
  const ticketPricing = {
    'fun-run': { ASN: 90000, Umum: 112500 },
    'half-marathon': { ASN: 150000, Umum: 187500 },
    'full-marathon': { ASN: 210000, Umum: 262500 }
  };

  const ticketTypeOptions = [
    { value: 'fun-run', label: 'Fun Run (5K)' },
    { value: 'half-marathon', label: 'Half Marathon (21K)' },
    { value: 'full-marathon', label: 'Full Marathon (42K)' }
  ];

  const userTypeOptions = [
    { value: 'ASN', label: 'ASN (Aparatur Sipil Negara)' },
    { value: 'Umum', label: 'Umum (Masyarakat Umum)' }
  ];

  const apiEndpoints = [
    {
      id: 'auth',
      title: 'Authentication',
      icon: Shield,
      endpoints: [
        {
          id: 'auth-signup',
          method: 'POST',
          path: '/signup',
          description: 'Create new user account',
          testable: true,
          parameters: [
            { name: 'email', type: 'string', required: true, description: 'User email address', example: 'test@example.com' },
            { name: 'password', type: 'string', required: true, description: 'User password (min 6 chars)', example: 'password123' }
          ],
          response: {
            success: {
              msg: 'User created successfully',
              data: {
                user: { id: 'uuid', email: 'string' },
                session: { access_token: 'string', refresh_token: 'string' }
              }
            },
            error: {
              msg: 'Registration failed',
              data: null
            }
          }
        },
        {
          id: 'auth-signin',
          method: 'POST',
          path: '/auth/v1/token?grant_type=password',
          description: 'Sign in existing user',
          testable: true,
          parameters: [
            { name: 'email', type: 'string', required: true, description: 'User email address', example: 'admin@admin.com' },
            { name: 'password', type: 'string', required: true, description: 'User password', example: '1618@Password.' }
          ],
          response: {
            success: {
              msg: 'Login successful',
              data: {
                user: { id: 'uuid', email: 'string' },
                session: { access_token: 'string', refresh_token: 'string' }
              }
            },
            error: {
              msg: 'Invalid credentials',
              data: null
            }
          }
        },
        {
          id: 'auth-signout',
          method: 'POST',
          path: '/logout',
          description: 'Sign out current user',
          testable: true,
          parameters: [],
          response: {
            success: {
              msg: 'Successfully signed out',
              data: null
            },
            error: {
              msg: 'Logout failed',
              data: null
            }
          }
        }
      ]
    },
    {
      id: 'registrations',
      title: 'Registrations',
      icon: Users,
      endpoints: [
        {
          id: 'get-registrations',
          method: 'GET',
          path: '/rest/v1/registrations',
          description: 'Get all registrations (Admin only)',
          testable: true,
          requiresAuth: true,
          headers: [
            { name: 'Authorization', value: 'Bearer {access_token}', required: true },
            { name: 'apikey', value: '{supabase_anon_key}', required: true }
          ],
          parameters: [
            { name: 'select', type: 'string', required: false, description: 'Columns to select (default: *)', example: '*' },
            { name: 'order', type: 'string', required: false, description: 'Order by column', example: 'created_at.desc' },
            { name: 'limit', type: 'number', required: false, description: 'Limit number of results', example: '10' }
          ],
          response: {
            success: {
              msg: 'Registrations retrieved successfully',
              data: [
                {
                  id: 'uuid',
                  user_id: 'uuid',
                  user_type: 'ASN | Umum',
                  nik: 'string',
                  nama: 'string',
                  nomer_hp: 'string',
                  alamat: 'string',
                  jenis_tiket: 'fun-run | half-marathon | full-marathon',
                  kab_kota: 'string',
                  ticket_price: 'number',
                  payment_status: 'pending | completed | failed',
                  ticket_number: 'string',
                  created_at: 'timestamp',
                  updated_at: 'timestamp'
                }
              ]
            },
            error: {
              msg: 'Failed to retrieve registrations',
              data: null
            }
          }
        },
        {
          id: 'create-registration',
          method: 'POST',
          path: '/rest/v1/registrations',
          description: 'Create new registration',
          testable: true,
          requiresAuth: true,
          headers: [
            { name: 'Authorization', value: 'Bearer {access_token}', required: true },
            { name: 'apikey', value: '{supabase_anon_key}', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          parameters: [
            { name: 'user_id', type: 'string', required: true, description: 'User ID (dapatkan dari response signup/signin)', example: 'Akan terisi otomatis setelah login' },
            { name: 'user_type', type: 'string', required: true, description: 'ASN or Umum', example: 'ASN' },
            { name: 'nik', type: 'string', required: true, description: 'National ID number', example: '1234567890123456' },
            { name: 'nama', type: 'string', required: true, description: 'Full name', example: 'John Doe' },
            { name: 'nomer_hp', type: 'string', required: true, description: 'Phone number', example: '081234567890' },
            { name: 'alamat', type: 'string', required: true, description: 'Address', example: 'Jl. Sudirman No. 1' },
            { name: 'jenis_tiket', type: 'string', required: true, description: 'Ticket type', example: 'fun-run' },
            { name: 'kab_kota', type: 'string', required: true, description: 'City/Regency', example: 'Jakarta' },
            { name: 'ticket_price', type: 'number', required: true, description: 'Ticket price in IDR (auto-calculated)', example: '90000' }
          ],
          response: {
            success: {
              msg: 'Registration created successfully',
              data: {
                id: 'uuid',
                ticket_number: 'string',
                payment_status: 'pending',
                created_at: 'timestamp'
              }
            },
            error: {
              msg: 'Registration failed',
              data: { code: 'string', details: 'string' }
            }
          }
        }
      ]
    },
    {
      id: 'admin',
      title: 'Admin Operations',
      icon: Shield,
      endpoints: [
        {
          id: 'verify-admin',
          method: 'POST',
          path: '/rest/v1/rpc/verify_admin_login',
          description: 'Verify admin credentials',
          testable: true,
          headers: [
            { name: 'apikey', value: '{supabase_anon_key}', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          parameters: [
            { name: 'input_email', type: 'string', required: true, description: 'Admin email', example: 'admin@admin.com' },
            { name: 'input_password', type: 'string', required: true, description: 'Admin password', example: '1618@Password.' }
          ],
          response: {
            success: {
              msg: 'Admin login successful',
              data: [
                {
                  user_id: 'uuid',
                  user_email: 'string',
                  user_name: 'string',
                  user_role: 'admin'
                }
              ]
            },
            error: {
              msg: 'Invalid credentials',
              data: null
            }
          }
        }
      ]
    },
    {
      id: 'race-management',
      title: 'Race Management',
      icon: Trophy,
      endpoints: [
        {
          id: 'assign-bib',
          method: 'POST',
          path: '/rest/v1/rpc/assign_bib_number',
          description: 'Assign bib number to registration',
          testable: true,
          requiresAuth: true,
          headers: [
            { name: 'apikey', value: '{supabase_anon_key}', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          parameters: [
            { name: 'p_registration_id', type: 'string', required: true, description: 'Registration ID', example: 'uuid-here' },
            { name: 'p_staff_id', type: 'string', required: false, description: 'Staff ID (optional)', example: 'uuid-here' }
          ],
          response: {
            success: {
              msg: 'Bib assigned successfully',
              data: [
                {
                  bib_id: 'uuid',
                  bib_number: 'number',
                  success: true,
                  message: 'string'
                }
              ]
            },
            error: {
              msg: 'Failed to assign bib',
              data: null
            }
          }
        },
        {
          id: 'collect-bib',
          method: 'POST',
          path: '/rest/v1/rpc/collect_bib',
          description: 'Mark bib as collected using ticket number',
          testable: true,
          requiresAuth: true,
          headers: [
            { name: 'apikey', value: '{supabase_anon_key}', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          parameters: [
            { name: 'p_ticket_number', type: 'string', required: true, description: 'Ticket number from QR code', example: 'KR2025ABC123' },
            { name: 'p_staff_id', type: 'string', required: false, description: 'Staff ID', example: 'uuid-here' }
          ],
          response: {
            success: {
              msg: 'Bib collected successfully',
              data: [
                {
                  success: true,
                  message: 'string',
                  bib_number: 'number',
                  participant_name: 'string'
                }
              ]
            },
            error: {
              msg: 'Failed to collect bib',
              data: null
            }
          }
        },
        {
          id: 'record-start',
          method: 'POST',
          path: '/rest/v1/rpc/record_race_start',
          description: 'Record race start time',
          testable: true,
          requiresAuth: true,
          headers: [
            { name: 'apikey', value: '{supabase_anon_key}', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          parameters: [
            { name: 'p_bib_number', type: 'number', required: true, description: 'Bib number', example: '1001' },
            { name: 'p_staff_id', type: 'string', required: false, description: 'Staff ID', example: 'uuid-here' }
          ],
          response: {
            success: {
              msg: 'Race start recorded',
              data: [
                {
                  success: true,
                  message: 'string'
                }
              ]
            },
            error: {
              msg: 'Failed to record start',
              data: null
            }
          }
        },
        {
          id: 'record-finish',
          method: 'POST',
          path: '/rest/v1/rpc/record_race_finish',
          description: 'Record race finish time',
          testable: true,
          requiresAuth: true,
          headers: [
            { name: 'apikey', value: '{supabase_anon_key}', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          parameters: [
            { name: 'p_bib_number', type: 'number', required: true, description: 'Bib number', example: '1001' },
            { name: 'p_staff_id', type: 'string', required: false, description: 'Staff ID', example: 'uuid-here' }
          ],
          response: {
            success: {
              msg: 'Race finish recorded',
              data: [
                {
                  success: true,
                  message: 'string',
                  finish_time: 'timestamp',
                  duration: 'interval',
                  position: 'number'
                }
              ]
            },
            error: {
              msg: 'Failed to record finish',
              data: null
            }
          }
        },
        {
          id: 'get-race-stats',
          method: 'POST',
          path: '/rest/v1/rpc/get_race_statistics',
          description: 'Get race statistics',
          testable: true,
          requiresAuth: true,
          headers: [
            { name: 'apikey', value: '{supabase_anon_key}', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          parameters: [],
          response: {
            success: {
              msg: 'Statistics retrieved',
              data: [
                {
                  total_registered: 'number',
                  total_started: 'number',
                  total_finished: 'number',
                  fun_run_finished: 'number',
                  half_marathon_finished: 'number',
                  full_marathon_finished: 'number'
                }
              ]
            },
            error: {
              msg: 'Failed to get statistics',
              data: null
            }
          }
        },
        {
          id: 'get-race-results',
          method: 'GET',
          path: '/rest/v1/race_results',
          description: 'Get race results',
          testable: true,
          requiresAuth: true,
          headers: [
            { name: 'Authorization', value: 'Bearer {access_token}', required: true },
            { name: 'apikey', value: '{supabase_anon_key}', required: true }
          ],
          parameters: [
            { name: 'select', type: 'string', required: false, description: 'Columns to select', example: '*,registrations(nama,jenis_tiket)' },
            { name: 'order', type: 'string', required: false, description: 'Order by', example: 'position.asc' },
            { name: 'status', type: 'string', required: false, description: 'Filter by status', example: 'eq.finished' }
          ],
          response: {
            success: {
              msg: 'Results retrieved',
              data: [
                {
                  id: 'uuid',
                  registration_id: 'uuid',
                  bib_number: 'number',
                  start_time: 'timestamp',
                  finish_time: 'timestamp',
                  race_duration: 'interval',
                  position: 'number',
                  category_position: 'number',
                  status: 'string'
                }
              ]
            },
            error: {
              msg: 'Failed to get results',
              data: null
            }
          }
        }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PATCH: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-blue-100 text-blue-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleParamChange = (endpointId: string, paramName: string, value: string) => {
    setTestParams(prev => ({
      ...prev,
      [endpointId]: {
        ...prev[endpointId],
        [paramName]: value
      }
    }));

    // Auto-calculate ticket price when user_type or jenis_tiket changes
    if (endpointId === 'create-registration' && (paramName === 'user_type' || paramName === 'jenis_tiket')) {
      const currentParams = { ...testParams[endpointId], [paramName]: value };
      const userType = currentParams.user_type;
      const ticketType = currentParams.jenis_tiket;

      if (userType && ticketType && ticketPricing[ticketType as keyof typeof ticketPricing]) {
        const price = ticketPricing[ticketType as keyof typeof ticketPricing][userType as 'ASN' | 'Umum'];
        if (price) {
          setTestParams(prev => ({
            ...prev,
            [endpointId]: {
              ...prev[endpointId],
              [paramName]: value,
              ticket_price: price.toString()
            }
          }));
        }
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const testEndpoint = async (endpoint: any) => {
    const endpointId = endpoint.id;
    setLoading(prev => ({ ...prev, [endpointId]: true }));

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase environment variables not configured');
      }

      let url = '';
      let options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        }
      };

      // Add auth header if required
      if (endpoint.requiresAuth && authToken) {
        (options.headers as any)['Authorization'] = `Bearer ${authToken}`;
      }

      const params = testParams[endpointId] || {};

      // Build URL and request based on endpoint
      if (endpoint.path === '/signup' || endpoint.path === '/signin') {
        url = `${supabaseUrl}/auth/v1${endpoint.path}`;
        options.body = JSON.stringify({
          email: params.email || '',
          password: params.password || ''
        });
      } else if (endpoint.path === '/token') {
        url = `${supabaseUrl}/auth/v1/token`;
        options.body = JSON.stringify({
          email: params.email || '',
          password: params.password || ''
        });
      } else if (endpoint.path === '/auth/v1/token?grant_type=password') {
        // Use custom query params if provided, otherwise use default
        const queryParams = params.query_params || 'grant_type=password';
        url = `${supabaseUrl}/auth/v1/token?${queryParams}`;
        options.body = JSON.stringify({
          email: params.email || '',
          password: params.password || ''
        });
      } else if (endpoint.path === '/logout') {
        url = `${supabaseUrl}/auth/v1/logout`;
        if (authToken) {
          (options.headers as any)['Authorization'] = `Bearer ${authToken}`;
        }
      } else if (endpoint.path === '/rest/v1/registrations') {
        url = `${supabaseUrl}${endpoint.path}`;
        if (endpoint.method === 'GET') {
          // Use custom query params if provided, otherwise build from individual params
          if (params.query_params) {
            url += `?${params.query_params}`;
          } else {
            const queryParams = new URLSearchParams();
            if (params.select) queryParams.append('select', params.select);
            if (params.order) queryParams.append('order', params.order);
            if (params.limit) queryParams.append('limit', params.limit);
            if (queryParams.toString()) {
              url += `?${queryParams.toString()}`;
            }
          }
        } else if (endpoint.method === 'POST') {
          // Get user ID from auth token if available
          let userId = params.user_id;
          if (authToken && !userId) {
            // Try to decode JWT to get user ID (simplified)
            try {
              const base64Url = authToken.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(atob(base64));
              userId = payload.sub || payload.user_id;
            } catch (e) {
              console.error('Failed to decode JWT:', e);
            }
          }

          options.body = JSON.stringify({
            user_id: userId,
            user_type: params.user_type || 'ASN',
            nik: params.nik || '',
            nama: params.nama || '',
            nomer_hp: params.nomer_hp || '',
            alamat: params.alamat || '',
            jenis_tiket: params.jenis_tiket || 'fun-run',
            kab_kota: params.kab_kota || '',
            ticket_price: parseInt(params.ticket_price) || 90000
          });
        }
      } else if (endpoint.path === '/rest/v1/rpc/verify_admin_login') {
        url = `${supabaseUrl}${endpoint.path}`;
        options.body = JSON.stringify({
          input_email: params.input_email || '',
          input_password: params.input_password || ''
        });
      } else if (endpoint.path.startsWith('/rest/v1/rpc/')) {
        // Handle other RPC calls
        url = `${supabaseUrl}${endpoint.path}`;
        const rpcParams: any = {};

        // Map parameters based on endpoint
        if (endpoint.id === 'assign-bib') {
          rpcParams.p_registration_id = params.p_registration_id || '';
          rpcParams.p_staff_id = params.p_staff_id || null;
        } else if (endpoint.id === 'collect-bib') {
          rpcParams.p_ticket_number = params.p_ticket_number || '';
          rpcParams.p_staff_id = params.p_staff_id || null;
        } else if (endpoint.id === 'record-start') {
          rpcParams.p_bib_number = parseInt(params.p_bib_number) || 0;
          rpcParams.p_staff_id = params.p_staff_id || null;
        } else if (endpoint.id === 'record-finish') {
          rpcParams.p_bib_number = parseInt(params.p_bib_number) || 0;
          rpcParams.p_staff_id = params.p_staff_id || null;
        }

        if (Object.keys(rpcParams).length > 0) {
          options.body = JSON.stringify(rpcParams);
        }
      } else if (endpoint.path === '/rest/v1/race_results') {
        url = `${supabaseUrl}${endpoint.path}`;
        if (endpoint.method === 'GET') {
          const queryParams = new URLSearchParams();
          if (params.select) queryParams.append('select', params.select);
          if (params.order) queryParams.append('order', params.order);
          if (params.status) queryParams.append('status', params.status);
          if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
          }
        }
      }

      const response = await fetch(url, options);

      let data;
      const contentType = response.headers.get('content-type');

      try {
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
        } else {
          data = { message: await response.text() };
        }
      } catch (parseError) {
        // If JSON parsing fails, show the raw response
        data = {
          error: 'Failed to parse response',
          raw_response: await response.text(),
          content_type: contentType
        };
      }

      setTestResults(prev => ({
        ...prev,
        [endpointId]: {
          status: response.status,
          statusText: response.statusText,
          data: data,
          timestamp: new Date().toISOString()
        }
      }));

      // If it's a successful auth request, save the token
      if ((endpoint.path === '/signup' || endpoint.path === '/auth/v1/token?grant_type=password') && data.access_token) {
        setAuthToken(data.access_token);
      } else if (endpoint.path === '/signup' && data.session?.access_token) {
        setAuthToken(data.session.access_token);
      }

    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [endpointId]: {
          status: 'Error',
          statusText: 'Network Error',
          data: { error: error.message },
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpointId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-light tracking-wide">BACK TO ADMIN</span>
            </button>
            <div className="text-xl font-light tracking-wide text-black">
              INTERACTIVE API DOCUMENTATION
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <Code className="w-8 h-8 text-blue-600 mr-4" />
            <h1 className="text-3xl font-light tracking-tight text-black">
              KORPRI RUN API Documentation
            </h1>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-light text-black mb-4">API Base URL (Supabase)</h3>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm">
                {import.meta.env.VITE_SUPABASE_URL}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is the backend API URL where all data operations happen
              </p>
            </div>
            <div>
              <h3 className="text-lg font-light text-black mb-4">Authentication Token</h3>
              <div className="bg-gray-100 p-4 rounded space-y-2">
                <input
                  type="text"
                  placeholder="Paste access token here..."
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="w-full bg-transparent text-sm font-mono"
                />
                <div className="text-xs text-blue-600">
                  <strong>Important:</strong> Use signup/signin endpoints below to get a valid token for RLS-protected operations
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-light text-black mb-4">Frontend URL</h3>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm">
                {window.location.origin}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is the website URL where users access the application
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200">
            <div>
              <h3 className="text-lg font-light text-black mb-4">Admin Test Credentials</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Admin:</strong> admin@admin.com</div>
                <div><strong>Password:</strong> 1618@Password.</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-light text-black mb-4">Architecture</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div><strong>Frontend:</strong> React app hosted on Netlify</div>
                <div><strong>Backend:</strong> Supabase (Database + API)</div>
                <div><strong>Authentication:</strong> Supabase Auth</div>
              </div>
            </div>
          </div>
        </div>

        {/* API Sections */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-light text-black mb-6">API Sections</h3>
              <nav className="space-y-2">
                {apiEndpoints.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setSelectedEndpoint(section.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${selectedEndpoint === section.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-light">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {apiEndpoints.map((section) => (
              <div key={section.id} className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center">
                      <section.icon className="w-6 h-6 text-blue-600 mr-3" />
                      <h2 className="text-2xl font-light text-black">{section.title}</h2>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {section.endpoints.map((endpoint, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Endpoint Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className={`px-3 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                                {endpoint.method}
                              </span>
                              <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                            </div>
                            {endpoint.testable && (
                              <button
                                onClick={() => testEndpoint(endpoint)}
                                disabled={loading[endpoint.id]}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${loading[endpoint.id]
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                {loading[endpoint.id] ? 'Testing...' : 'Test'}
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{endpoint.description}</p>
                        </div>

                        {/* Endpoint Details */}
                        <div className="p-6 space-y-6">
                          {/* Test Parameters */}
                          {endpoint.testable && endpoint.parameters && endpoint.parameters.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-3">Test Parameters</h4>
                              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                {/* Query URL Editor for specific endpoints */}
                                {(endpoint.path.includes('?') || endpoint.method === 'GET') && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Query Parameters
                                      <span className="text-gray-500 ml-2">(URL query string)</span>
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="grant_type=password&other_param=value"
                                      value={testParams[endpoint.id]?.query_params || ''}
                                      onChange={(e) => handleParamChange(endpoint.id, 'query_params', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Edit query parameters that will be appended to the URL (e.g., ?grant_type=password)
                                    </p>
                                  </div>
                                )}

                                {endpoint.parameters.map((param, idx) => (
                                  <div key={idx}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      {param.name}
                                      {param.required && <span className="text-blue-500 ml-1">*</span>}
                                      <span className="text-gray-500 ml-2">({param.type})</span>
                                    </label>

                                    {/* Special handling for user_type dropdown */}
                                    {param.name === 'user_type' ? (
                                      <select
                                        value={testParams[endpoint.id]?.[param.name] || ''}
                                        onChange={(e) => handleParamChange(endpoint.id, param.name, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      >
                                        <option value="">Pilih tipe peserta...</option>
                                        {userTypeOptions.map(option => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    ) : param.name === 'jenis_tiket' ? (
                                      <select
                                        value={testParams[endpoint.id]?.[param.name] || ''}
                                        onChange={(e) => handleParamChange(endpoint.id, param.name, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      >
                                        <option value="">Pilih jenis tiket...</option>
                                        {ticketTypeOptions.map(option => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    ) : param.name === 'ticket_price' ? (
                                      <div className="space-y-2">
                                        <input
                                          type="number"
                                          value={testParams[endpoint.id]?.[param.name] || ''}
                                          onChange={(e) => handleParamChange(endpoint.id, param.name, e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          placeholder="Harga akan otomatis terisi"
                                          readOnly
                                        />
                                        {testParams[endpoint.id]?.[param.name] && (
                                          <div className="text-sm text-green-600 font-medium">
                                            {formatPrice(parseInt(testParams[endpoint.id][param.name]))}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <input
                                        type={param.type === 'number' ? 'number' : 'text'}
                                        placeholder={param.example || param.description}
                                        value={testParams[endpoint.id]?.[param.name] || ''}
                                        onChange={(e) => handleParamChange(endpoint.id, param.name, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    )}

                                    <p className="text-xs text-gray-500 mt-1">{param.description}</p>

                                    {/* Show pricing info for ticket selection */}
                                    {param.name === 'jenis_tiket' && testParams[endpoint.id]?.[param.name] && (
                                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                        <div className="font-medium text-blue-800 mb-1">Harga untuk tiket ini:</div>
                                        <div className="space-y-1">
                                          <div>ASN: {formatPrice(ticketPricing[testParams[endpoint.id][param.name] as keyof typeof ticketPricing]?.ASN || 0)}</div>
                                          <div>Umum: {formatPrice(ticketPricing[testParams[endpoint.id][param.name] as keyof typeof ticketPricing]?.Umum || 0)}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Test Results */}
                          {testResults[endpoint.id] && (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-900">Response</h4>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${testResults[endpoint.id].status === 200 || testResults[endpoint.id].status === 201
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {testResults[endpoint.id].status} {testResults[endpoint.id].statusText}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(JSON.stringify(testResults[endpoint.id].data, null, 2))}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                <pre className="text-sm text-green-400">
                                  <code>{JSON.stringify(testResults[endpoint.id].data, null, 2)}</code>
                                </pre>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Tested at: {new Date(testResults[endpoint.id].timestamp).toLocaleString()}
                              </p>
                            </div>
                          )}

                          {/* Expected Response */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Expected Response</h4>
                            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                              <pre className="text-sm text-green-400">
                                <code>{JSON.stringify(endpoint.response, null, 2)}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Usage Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-8">
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-light text-black">Testing Guide</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Getting Started</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Untuk user baru: Test signup endpoint dulu untuk buat akun</li>
                    <li>Untuk user existing: Test signin endpoint untuk login</li>
                    <li>Access token akan otomatis tersimpan setelah login berhasil</li>
                    <li>User ID akan otomatis terisi untuk endpoint registrasi</li>
                    <li>Test endpoint lain yang memerlukan authentication</li>
                  </ol>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Flow Registrasi</h4>
                  <p>1. User baru → Signup → Login → Registrasi Event<br />
                    2. User existing → Login → Registrasi Event<br />
                    3. Admin → Admin Login → Lihat semua registrasi</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Response Codes</h4>
                  <p>200/201 = Success, 400 = Bad Request, 401 = Unauthorized, 403 = Forbidden, 500 = Server Error</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SwaggerDocs;