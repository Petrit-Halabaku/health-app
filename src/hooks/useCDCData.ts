import { useState, useEffect } from 'react';
import { fetchCDCData, CDCMortalityData, getAllJurisdictions } from '../services/cdcApi';

export const useCDCData = () => {
  const [data, setData] = useState<CDCMortalityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchCDCData();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to load mortality data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get all available jurisdictions (US states + European countries)
  const states = getAllJurisdictions();
  const years = [...new Set(data.map(item => item.year))].sort();
  const causes = [...new Set(data.map(item => item.cause_name))].sort();

  return {
    data,
    loading,
    error,
    states,
    years,
    causes
  };
};