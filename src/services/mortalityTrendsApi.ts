import axios from 'axios';
import type { MortalityTrendData } from '../types/cdc';

const MORTALITY_TRENDS_API = 'https://data.cdc.gov/resource/w9j2-ggv5.json';

export const fetchMortalityTrends = async (): Promise<MortalityTrendData[]> => {
  try {
    const response = await axios.get(MORTALITY_TRENDS_API, {
      params: {
        $limit: 5000,
        $order: 'year ASC'
      }
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid data format received from CDC API');
    }

    return response.data.map(item => ({
      year: item.year,
      race: item.race,
      sex: item.sex,
      death_rate: item.age_adjusted_death_rate || '0',
      life_expectancy: item.average_life_expectancy || '0'
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('CDC API Error details:', error.response?.data);
      throw new Error(`CDC API Error: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('Failed to fetch mortality trends data');
  }
};