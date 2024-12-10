import { useState, useEffect } from 'react';
import { mockData } from '../data/mockData';
import type { WHODataPoint } from '../types/who';

export const useWHOData = () => {
  const [data, setData] = useState<WHODataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [indicators, setIndicators] = useState<string[]>([]);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      try {
        const uniqueCountries = [...new Set(mockData.map(item => item.country))];
        const uniqueIndicators = [...new Set(mockData.map(item => item.indicator))];
        
        setData(mockData);
        setCountries(uniqueCountries.sort());
        setIndicators(uniqueIndicators);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    data,
    loading,
    error,
    countries,
    indicators
  };
};