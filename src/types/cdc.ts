export interface CDCDataPoint {
  year: string;
  month: string;
  cause_name: string;
  deaths: string;
  population: string;
  crude_rate: string;
}

export interface CDCDemographicData {
  year: string;
  age_group: string;
  sex: string;
  deaths: string;
}

export interface MortalityTrendData {
  year: string;
  race: string;
  sex: string;
  death_rate: string;
  life_expectancy: string;
}