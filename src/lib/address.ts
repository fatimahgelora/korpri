const API_KEY = 'YOUR_KIRIMIN_API_KEY'; // Replace with your Kirimin API key

export interface Province {
  id: number;
  name: string;
}

export interface Regency {
  id: number;
  province_id: number;
  name: string;
}

export interface District {
  id: number;
  regency_id: number;
  name: string;
}

export interface Village {
  id: number;
  district_id: number;
  name: string;
}

export const getProvinces = async (): Promise<Province[]> => {
  const response = await fetch('https://api.kirimin.id/api/province', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch provinces');
  }
  
  const result = await response.json();
  if (!result.data || !Array.isArray(result.data)) {
    throw new Error('Invalid response format from provinces API');
  }
  
  // Transform the API response to match our interface
  return result.data.map((item: { id: number; value: string }) => ({
    id: item.id,
    name: item.value
  }));
};

export const getRegencies = async (provinceId: number): Promise<Regency[]> => {
  const response = await fetch(`https://api.kirimin.id/api/city/${provinceId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch regencies');
  }
  
  const result = await response.json();
  if (!result.data || !Array.isArray(result.data)) {
    throw new Error('Invalid response format from regencies API');
  }
  
  // Transform the API response to match our interface
  return result.data.map((item: { id: number; value: string }) => ({
    id: item.id,
    name: item.value,
    province_id: provinceId
  }));
};

export const getDistricts = async (regencyId: number): Promise<District[]> => {
  const response = await fetch(`https://api.kirimin.id/api/sub_district/${regencyId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch districts');
  }
  
  const result = await response.json();
  if (!result.data || !Array.isArray(result.data)) {
    throw new Error('Invalid response format from districts API');
  }
  
  // Transform the API response to match our interface
  return result.data.map((item: { id: number; value: string }) => ({
    id: item.id,
    name: item.value,
    regency_id: regencyId
  }));
};

export const getVillages = async (districtId: number): Promise<Village[]> => {
  const response = await fetch(`https://api.kirimin.id/api/village/${districtId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch villages');
  }
  
  const result = await response.json();
  if (!result.data || !Array.isArray(result.data)) {
    throw new Error('Invalid response format from villages API');
  }
  
  // Transform the API response to match our interface
  return result.data.map((item: { id: number; value: string }) => ({
    id: item.id,
    name: item.value,
    district_id: districtId
  }));
};
