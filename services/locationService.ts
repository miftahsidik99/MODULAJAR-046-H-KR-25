// Base API URL for Indonesian Administrative Divisions
const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export interface Region {
  id: string;
  name: string;
}

export const getProvinces = async (): Promise<Region[]> => {
  try {
    const response = await fetch(`${BASE_URL}/provinces.json`);
    if (!response.ok) throw new Error('Failed to fetch provinces');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getRegencies = async (provinceId: string): Promise<Region[]> => {
  try {
    const response = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
    if (!response.ok) throw new Error('Failed to fetch regencies');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getDistricts = async (regencyId: string): Promise<Region[]> => {
  try {
    const response = await fetch(`${BASE_URL}/districts/${regencyId}.json`);
    if (!response.ok) throw new Error('Failed to fetch districts');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};