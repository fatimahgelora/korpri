import React, { useState, useEffect } from 'react';
import { getProvinces, getRegencies, getDistricts, getVillages } from '../lib/address';

export interface AddressData {
  province: string;
  regency: string;
  district: string;
  village: string;
  fullAddress: string;
}

interface AddressSelectorProps {
  onAddressChange: (address: AddressData) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ onAddressChange }) => {
  const [provinces, setProvinces] = useState<Array<{id: number; name: string}>>([]);
  const [regencies, setRegencies] = useState<Array<{id: number; name: string}>>([]);
  const [districts, setDistricts] = useState<Array<{id: number; name: string}>>([]);
  const [villages, setVillages] = useState<Array<{id: number; name: string}>>([]);
  
  const [selectedProvince, setSelectedProvince] = useState<number | ''>('');
  const [selectedRegency, setSelectedRegency] = useState<number | ''>('');
  const [selectedDistrict, setSelectedDistrict] = useState<number | ''>('');
  const [selectedVillage, setSelectedVillage] = useState<number | ''>('');
  const [detailAddress, setDetailAddress] = useState('');
  const [loading, setLoading] = useState({
    provinces: true,
    regencies: false,
    districts: false,
    villages: false,
  });
  const [error, setError] = useState('');

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(data);
        setLoading(prev => ({ ...prev, provinces: false }));
      } catch (err) {
        setError('Gagal memuat data provinsi');
        setLoading(prev => ({ ...prev, provinces: false }));
      }
    };

    loadProvinces();
  }, []);

  // Load regencies when province is selected
  useEffect(() => {
    if (!selectedProvince) return;

    const loadRegencies = async () => {
      try {
        setLoading(prev => ({ ...prev, regencies: true }));
        const data = await getRegencies(selectedProvince);
        setRegencies(data);
        setSelectedRegency('');
        setSelectedDistrict('');
        setSelectedVillage('');
        setDistricts([]);
        setVillages([]);
        setLoading(prev => ({ ...prev, regencies: false }));
      } catch (err) {
        setError('Gagal memuat data kabupaten/kota');
        setLoading(prev => ({ ...prev, regencies: false }));
      }
    };

    loadRegencies();
  }, [selectedProvince]);

  // Load districts when regency is selected
  useEffect(() => {
    if (!selectedRegency) return;

    const loadDistricts = async () => {
      try {
        setLoading(prev => ({ ...prev, districts: true }));
        const data = await getDistricts(selectedRegency);
        setDistricts(data);
        setSelectedDistrict('');
        setSelectedVillage('');
        setVillages([]);
        setLoading(prev => ({ ...prev, districts: false }));
      } catch (err) {
        setError('Gagal memuat data kecamatan');
        setLoading(prev => ({ ...prev, districts: false }));
      }
    };

    loadDistricts();
  }, [selectedRegency]);

  // Load villages when district is selected
  useEffect(() => {
    if (!selectedDistrict) return;

    const loadVillages = async () => {
      try {
        setLoading(prev => ({ ...prev, villages: true }));
        const data = await getVillages(selectedDistrict);
        setVillages(data);
        setSelectedVillage('');
        setLoading(prev => ({ ...prev, villages: false }));
      } catch (err) {
        setError('Gagal memuat data kelurahan/desa');
        setLoading(prev => ({ ...prev, villages: false }));
      }
    };

    loadVillages();
  }, [selectedDistrict]);

  // Update parent component when address changes
  useEffect(() => {
    if (selectedProvince && selectedRegency && selectedDistrict && selectedVillage) {
      const province = provinces.find(p => p.id === selectedProvince)?.name || '';
      const regency = regencies.find(r => r.id === selectedRegency)?.name || '';
      const district = districts.find(d => d.id === selectedDistrict)?.name || '';
      const village = villages.find(v => v.id === selectedVillage)?.name || '';
      
      const fullAddress = `${detailAddress}, ${village}, ${district}, ${regency}, ${province}`.replace(/^\s*,\s*/, '');
      
      onAddressChange({
        province,
        regency,
        district,
        village,
        fullAddress
      });
    }
  }, [selectedProvince, selectedRegency, selectedDistrict, selectedVillage, detailAddress]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-blue-500 text-sm mb-4">{error}</div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
        <select
          className="w-full p-2 border rounded-md"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value ? Number(e.target.value) : '')}
          disabled={loading.provinces}
        >
          <option value="">Pilih Provinsi</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
        {loading.provinces && <div className="text-xs text-gray-500 mt-1">Memuat provinsi...</div>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten/Kota</label>
        <select
          className="w-full p-2 border rounded-md"
          value={selectedRegency}
          onChange={(e) => setSelectedRegency(e.target.value ? Number(e.target.value) : '')}
          disabled={!selectedProvince || loading.regencies}
        >
          <option value="">Pilih Kabupaten/Kota</option>
          {regencies.map((regency) => (
            <option key={regency.id} value={regency.id}>
              {regency.name}
            </option>
          ))}
        </select>
        {loading.regencies && <div className="text-xs text-gray-500 mt-1">Memuat kabupaten/kota...</div>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
        <select
          className="w-full p-2 border rounded-md"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value ? Number(e.target.value) : '')}
          disabled={!selectedRegency || loading.districts}
        >
          <option value="">Pilih Kecamatan</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
        {loading.districts && <div className="text-xs text-gray-500 mt-1">Memuat kecamatan...</div>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kelurahan/Desa</label>
        <select
          className="w-full p-2 border rounded-md"
          value={selectedVillage}
          onChange={(e) => setSelectedVillage(e.target.value ? Number(e.target.value) : '')}
          disabled={!selectedDistrict || loading.villages}
        >
          <option value="">Pilih Kelurahan/Desa</option>
          {villages.map((village) => (
            <option key={village.id} value={village.id}>
              {village.name}
            </option>
          ))}
        </select>
        {loading.villages && <div className="text-xs text-gray-500 mt-1">Memuat kelurahan/desa...</div>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap (Jalan, RT/RW, No. Rumah)</label>
        <textarea
          className="w-full p-2 border rounded-md"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
          rows={3}
          placeholder="Contoh: Jl. Contoh No. 123, RT 001/RW 002"
        />
      </div>
    </div>
  );
};

export default AddressSelector;
