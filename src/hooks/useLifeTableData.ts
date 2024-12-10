import { useState, useEffect } from 'react';
import { fetchLifeTableData, LifeTableData } from '../services/eurostatApi';

export const useLifeTableData = () => {
  const [data, setData] = useState<LifeTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchLifeTableData();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to load life table data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const countries = [...new Set(data.map(item => item.country))].sort();
  const ages = [...new Set(data.map(item => item.age))];

  return {
    data,
    loading,
    error,
    countries,
    ages
  };
};