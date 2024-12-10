import axios from 'axios';
import type { WHOResponse } from '../types/who';

const api = axios.create({
  baseURL: 'https://ghoapi.azureedge.net/api',
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export const fetchWHOData = async (
  indicator: string,
  countries: string[],
  signal?: AbortSignal
): Promise<WHOResponse['value']> => {
  const chunkSize = 3;
  const countryChunks = [];
  
  for (let i = 0; i < countries.length; i += chunkSize) {
    countryChunks.push(countries.slice(i, i + chunkSize));
  }

  const allData: WHOResponse['value'] = [];

  for (const chunk of countryChunks) {
    const countryFilter = chunk
      .map(c => `SpatialDim eq '${c}'`)
      .join(' or ');

    try {
      const response = await api.get<WHOResponse>(`/${indicator}`, {
        params: {
          $filter: `(${countryFilter})`,
          $top: 1000,
          $orderby: 'TimeDim desc'
        },
        signal
      });

      if (response.data?.value) {
        allData.push(...response.data.value);
      }

      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      if (axios.isCancel(error)) throw error;
      console.error(`Failed to fetch data for countries: ${chunk.join(', ')}`, error);
    }
  }

  return allData;
};