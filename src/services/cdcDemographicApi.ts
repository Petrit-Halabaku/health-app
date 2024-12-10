import axios from 'axios';
import type { CDCDemographicData } from '../types/cdc';

const DEMOGRAPHIC_API_URL = 'https://data.cdc.gov/resource/chcz-j2du.json';

export const fetchDemographicData = async (): Promise<CDCDemographicData[]> => {
  try {
    const response = await axios.get(DEMOGRAPHIC_API_URL, {
      params: {
        $limit: 5000,
        $select: 'year,sex,age_group,total_deaths',
        $where: "year between '2015' and '2020'",
        $order: 'year ASC'
      }
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid data format received from CDC API');
    }

    // Process and clean the data
    return response.data
      .filter(item => 
        item.year && 
        item.sex && 
        item.age_group && 
        item.total_deaths &&
        ['F', 'M'].includes(item.sex) &&
        parseInt(item.total_deaths) > 0
      )
      .map(item => ({
        year: item.year,
        age_group: item.age_group,
        sex: item.sex,
        deaths: item.total_deaths
      }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('CDC API Error details:', error.response?.data);
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`CDC API Error: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('Failed to fetch CDC demographic data');
  }
};