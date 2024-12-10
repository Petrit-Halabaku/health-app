import { useState, useEffect } from 'react';
import { fetchEurostatData, HealthData } from '../services/eurostatApi';

export const useEurostatData = () => {
  const [data, setData] = useState<HealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchEurostatData();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to load Eurostat health data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const countries = [...new Set(data.map(item => item.country))].sort();
  const years = [...new Set(data.map(item => item.year))].sort();

  return {
    data,
    loading,
    error,
    countries,
    years
  };
}