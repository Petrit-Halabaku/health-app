import axios from 'axios';
import { CDC_API_URL } from '../config/constants';
import { API_CAUSE_MAPPING } from '../config/cdcConfig';
import { processCDCData } from '../utils/cdcDataProcessor';
import type { CDCDataPoint, CDCRawData } from '../types/cdc';

export const fetchCDCData = async (): Promise<CDCDataPoint[]> => {
  try {
    const response = await axios.get<CDCRawData[]>(CDC_API_URL, {
      params: {
        $limit: 5000,
        $order: 'year DESC'
      }
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid data format received from CDC API');
    }

    return processCDCData(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`CDC API Error: ${error.message}`);
    }
    throw new Error('Failed to fetch CDC mortality data');
  }
};

export const filterData = (
  data: CDCDataPoint[],
  selectedYear: string,
  selectedCause: string,
): CDCDataPoint[] => {
  return data.filter(item => {
    const yearMatch = !selectedYear || item.year === selectedYear;
    const causeMatch = !selectedCause || item.cause_name === selectedCause;
    return yearMatch && causeMatch;
  });
};

export const getAllYears = (data: CDCDataPoint[]): string[] => {
  const years = [...new Set(data.map(item => item.year))];
  return years.sort((a, b) => b.localeCompare(a));
};

export const getAllCauses = (): string[] => {
  return Object.values(API_CAUSE_MAPPING);
};