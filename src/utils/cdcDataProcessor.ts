import type { CDCDataPoint, CDCRawData } from '../types/cdc';
import { API_CAUSE_MAPPING, AVAILABLE_YEARS } from '../config/cdcConfig';

export const processCDCData = (rawData: CDCRawData[]): CDCDataPoint[] => {
  const processedData: CDCDataPoint[] = [];

  rawData.forEach((item) => {
    Object.entries(API_CAUSE_MAPPING).forEach(([apiKey, displayName]) => {
      if (item[apiKey] && item.year) {
        const deaths = item[apiKey];
        const population = item.population || '1';
        
        // Create a proper date string for the month
        const monthStr = item.month?.padStart(2, '0') || '01';
        const dateStr = `${item.year}-${monthStr}-01`;
        
        processedData.push({
          year: item.year,
          month: dateStr,
          cause_name: displayName,
          deaths: deaths,
          population: population,
          crude_rate: calculateCrudeRate(deaths, population)
        });
      }
    });
  });

  return processedData.filter(item => 
    item.year && 
    item.deaths !== '0' && 
    item.population !== '0' &&
    AVAILABLE_YEARS.includes(item.year)
  );
};

const calculateCrudeRate = (deaths: string, population: string): string => {
  const deathCount = parseInt(deaths);
  const populationCount = parseInt(population);
  return ((deathCount / populationCount) * 100000).toFixed(2);
};