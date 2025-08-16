import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  QrCode, 
  Scan, 
  Trophy, 
  Clock, 
  Users, 
  CheckCircle,
  Play,
  Flag,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BibAssignment {
  id: string;
  registration_id: string;
  bib_number: number;
  status: 'available' | 'assigned' | 'collected';
  assigned_at: string;
  collected_at: string;
  participant_name: string;
  ticket_number: string;
  jenis_tiket: string;
}

interface RaceResult {
  id: string;
  registration_id: string;
  bib_number: number;
  start_time: string;
  finish_time: string;
  race_duration: string;
  position: number;
  category_position: number;
  status: 'registered' | 'started' | 'finished' | 'dnf' | 'dsq';
  participant_name: string;
  jenis_tiket: string;
}

interface RaceStats {
  total_registered: number;
  total_started: number;
  total_finished: number;
  fun_run_finished: number;
  half_marathon_finished: number;
  full_marathon_finished: number;
}

function RaceManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bib-exchange' | 'race-timing' | 'results'>('bib-exchange');
  const [bibAssignments, setBibAssignments] = useState<BibAssignment[]>([]);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [raceStats, setRaceStats] = useState<RaceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [ticketNumber, setTicketNumber] = useState('');
  const [bibNumber, setBibNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bib-exchange') {
        await fetchBibAssignments();
      } else if (activeTab === 'race-timing' || activeTab === 'results') {
        await fetchRaceResults();
        await fetchRaceStats();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBibAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('race_bibs')
        .select(`
          *,
          registrations (
            nama,
            ticket_number,
            jenis_tiket
          )
        `)
        .order('bib_number', { ascending: true });

      if (error) {
        if (error.code === 'PGRST205') {
          // Table doesn't exist, create it
          await createRaceTables();
          return;
        }
        throw error;
      }
      
      setBibAssignments(data?.map(item => ({
        ...item,
        participant_name: item.registrations?.nama || '',
        ticket_number: item.registrations?.ticket_number || '',
        jenis_tiket: item.registrations?.jenis_tiket || ''
      })) || []);
    } catch (err: any) {
      if (err.message.includes('race_bibs')) {
        setError('Race management tables not found. Please create the database schema first.');
      } else {
        throw err;
      }
    }
  };

  const fetchRaceResults = async () => {
    try {
      const { data, error } = await supabase
        .from('race_results')
        .select(`
          *,
          registrations (
            nama,
            jenis_tiket
          )
        `)
        .order('position', { ascending: true, nullsLast: true });

      if (error) {
        if (error.code === 'PGRST205') {
          // Table doesn't exist
          setError('Race management tables not found. Please create the database schema first.');
          return;
        }
        throw error;
      }
      
      setRaceResults(data?.map(item => ({
        ...item,
        participant_name: item.registrations?.nama || '',
        jenis_tiket: item.registrations?.jenis_tiket || ''
      })) || []);
    } catch (err: any) {
      if (err.message.includes('race_results')) {
        setError('Race management tables not found. Please create the database schema first.');
      } else {
        throw err;
      }
    }
  };

  const fetchRaceStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_race_statistics');
      if (error) {
        if (error.code === 'PGRST205' || error.message.includes('function')) {
          // Function doesn't exist
          return;
        }
        throw error;
      }
      if (data && data.length > 0) {
        setRaceStats(data[0]);
      }
    } catch (err: any) {
      // Ignore stats errors for now
      console.warn('Could not fetch race statistics:', err.message);
    }
  };

  const createRaceTables = async () => {
    setLoading(true);
    try {
      // Create race_bibs table
      const { error: bibsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS race_bibs (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
            bib_number integer UNIQUE NOT NULL,
            status text DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'collected')),
            assigned_at timestamptz,
            collected_at timestamptz,
            staff_id uuid REFERENCES admin_users(id),
            created_at timestamptz DEFAULT now()
          );
          
          ALTER TABLE race_bibs ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Admin can manage all bibs" ON race_bibs FOR ALL TO authenticated 
          USING (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text));
        `
      });

      if (bibsError) {
        setError('Failed to create race tables. Please contact administrator.');
        return;
      }

      // Refresh data after creating tables
      await fetchData();
      setError('');
    } catch (err: any) {
      setError('Database setup required. Please contact administrator to run migrations.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBib = async (registrationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('assign_bib_number', {
        p_registration_id: registrationId
      });

      if (error) throw error;
      
      if (data && data.length > 0 && data[0].success) {
        await fetchBibAssignments();
        setError('');
      } else {
        setError(data?.[0]?.message || 'Failed to assign bib number');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectBib = async () => {
    if (!ticketNumber.trim()) {
      setError('Please enter ticket number');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('collect_bib', {
        p_ticket_number: ticketNumber,
        p_staff_id: null // Will be set by admin auth
      });

      if (error) throw error;
      
      if (data && data.length > 0 && data[0].success) {
        await fetchBibAssignments();
        setTicketNumber('');
        setError('');
        alert(`Bib #${data[0].bib_number} collected by ${data[0].participant_name}`);
      } else {
        setError(data?.[0]?.message || 'Failed to collect bib');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRaceStart = async () => {
    if (!bibNumber.trim()) {
      setError('Please enter bib number');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('record_race_start', {
        p_bib_number: parseInt(bibNumber),
        p_staff_id: null
      });

      if (error) throw error;
      
      if (data && data.length > 0 && data[0].success) {
        await fetchRaceResults();
        setBibNumber('');
        setError('');
        alert('Race start recorded successfully');
      } else {
        setError(data?.[0]?.message || 'Failed to record race start');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRaceFinish = async () => {
    if (!bibNumber.trim()) {
      setError('Please enter bib number');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('record_race_finish', {
        p_bib_number: parseInt(bibNumber),
        p_staff_id: null
      });

      if (error) throw error;
      
      if (data && data.length > 0 && data[0].success) {
        await fetchRaceResults();
        await fetchRaceStats();
        setBibNumber('');
        setError('');
        alert(`Finish recorded! Position: #${data[0].position}, Time: ${formatDuration(data[0].duration)}`);
      } else {
        setError(data?.[0]?.message || 'Failed to record race finish');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '-';
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const [, hours, minutes, seconds] = match;
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return duration;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('id-ID');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { color: 'bg-gray-100 text-gray-800', text: 'Available' },
      assigned: { color: 'bg-yellow-100 text-yellow-800', text: 'Assigned' },
      collected: { color: 'bg-green-100 text-green-800', text: 'Collected' },
      registered: { color: 'bg-blue-100 text-blue-800', text: 'Registered' },
      started: { color: 'bg-orange-100 text-orange-800', text: 'Started' },
      finished: { color: 'bg-green-100 text-green-800', text: 'Finished' },
      dnf: { color: 'bg-red-100 text-red-800', text: 'DNF' },
      dsq: { color: 'bg-red-100 text-red-800', text: 'DSQ' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.registered;
    
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredBibAssignments = bibAssignments.filter(bib =>
    bib.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bib.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bib.bib_number.toString().includes(searchTerm)
  );

  const filteredRaceResults = raceResults.filter(result =>
    result.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.bib_number.toString().includes(searchTerm)
  );

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
              RACE MANAGEMENT
            </div>
            <button
              onClick={fetchData}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              <span className="text-sm font-light tracking-wide">REFRESH</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex space-x-8">
            {[
              { id: 'bib-exchange', label: 'Bib Exchange', icon: QrCode },
              { id: 'race-timing', label: 'Race Timing', icon: Clock },
              { id: 'results', label: 'Results', icon: Trophy }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-black'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span className="font-light">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              {error.includes('database schema') && (
                <button
                  onClick={createRaceTables}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  {loading ? 'Creating...' : 'Setup Database'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Race Statistics */}
        {raceStats && (activeTab === 'race-timing' || activeTab === 'results') && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-light text-blue-600">{raceStats.total_registered}</div>
              <div className="text-xs font-light tracking-wide uppercase text-gray-600">Registered</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-light text-orange-600">{raceStats.total_started}</div>
              <div className="text-xs font-light tracking-wide uppercase text-gray-600">Started</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-light text-green-600">{raceStats.total_finished}</div>
              <div className="text-xs font-light tracking-wide uppercase text-gray-600">Finished</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-light text-red-600">{raceStats.fun_run_finished}</div>
              <div className="text-xs font-light tracking-wide uppercase text-gray-600">5K Done</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-light text-red-600">{raceStats.half_marathon_finished}</div>
              <div className="text-xs font-light tracking-wide uppercase text-gray-600">21K Done</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-light text-red-600">{raceStats.full_marathon_finished}</div>
              <div className="text-xs font-light tracking-wide uppercase text-gray-600">42K Done</div>
            </div>
          </div>
        )}

        {/* Bib Exchange Tab */}
        {activeTab === 'bib-exchange' && (
          <div className="space-y-8">
            {/* QR Scanner Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-light text-black mb-6">Scan Ticket QR Code</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-light tracking-wide uppercase text-gray-600 mb-2">
                    Ticket Number
                  </label>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter or scan ticket number"
                    />
                    <button
                      onClick={handleCollectBib}
                      disabled={loading}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    >
                      <Scan className="w-5 h-5 mr-2" />
                      {loading ? 'Processing...' : 'Collect Bib'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bib Assignments Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-light text-black">Bib Assignments</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bib #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Collected At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBibAssignments.map((bib) => (
                      <tr key={bib.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-medium text-black">#{bib.bib_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{bib.participant_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{bib.ticket_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{bib.jenis_tiket}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(bib.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bib.collected_at ? formatTime(bib.collected_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Race Timing Tab */}
        {activeTab === 'race-timing' && (
          <div className="space-y-8">
            {/* Timing Controls */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-light text-black mb-6">Record Start</h2>
                <div className="space-y-4">
                  <input
                    type="number"
                    value={bibNumber}
                    onChange={(e) => setBibNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter bib number"
                  />
                  <button
                    onClick={handleRaceStart}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {loading ? 'Recording...' : 'Record Start'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-light text-black mb-6">Record Finish</h2>
                <div className="space-y-4">
                  <input
                    type="number"
                    value={bibNumber}
                    onChange={(e) => setBibNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter bib number"
                  />
                  <button
                    onClick={handleRaceFinish}
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Flag className="w-5 h-5 mr-2" />
                    {loading ? 'Recording...' : 'Record Finish'}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-light text-black">Live Race Status</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bib #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Finish Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRaceResults.slice(0, 20).map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-medium text-black">#{result.bib_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.participant_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{result.jenis_tiket}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(result.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(result.start_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(result.finish_time)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-8">
            {/* Results Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-light text-black">Race Results</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bib #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cat. Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRaceResults.filter(r => r.status === 'finished').map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-medium text-black">#{result.position}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.bib_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.participant_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{result.jenis_tiket}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-black">{formatDuration(result.race_duration)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">#{result.category_position}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(result.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RaceManagement;