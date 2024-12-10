import axios from 'axios';

export const COUNTRY_CODES: Record<string, string> = {
  BE: "Belgium",
  BG: "Bulgaria",
  CZ: "Czechia",
  DK: "Denmark",
  DE: "Germany",
  EE: "Estonia",
  IE: "Ireland",
  EL: "Greece",
  ES: "Spain",
  FR: "France",
  HR: "Croatia",
  IT: "Italy",
  CY: "Cyprus",
  LV: "Latvia",
  LT: "Lithuania",
  LU: "Luxembourg",
  HU: "Hungary",
  MT: "Malta",
  NL: "Netherlands",
  AT: "Austria",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  SI: "Slovenia",
  SK: "Slovakia",
  FI: "Finland",
  SE: "Sweden",
  IS: "Iceland",
  NO: "Norway",
  CH: "Switzerland",
  UK: "United Kingdom"
};

export interface EurostatResponse {
  value: Record<string, number>;
  dimension: {
    geo: {
      category: {
        index: Record<string, number>;
        label: Record<string, string>;
      };
    };
    time: {
      category: {
        index: Record<string, number>;
        label: Record<string, string>;
      };
    };
    age: {
      category: {
        index: Record<string, number>;
        label: Record<string, string>;
      };
    };
  };
}

export interface LifeTableData {
  id: string;
  countryCode: string;
  country: string;
  age: string;
  year: string;
  value: number;
}

const filterValidCountries = (countryCode: string): boolean => {
  return countryCode in COUNTRY_CODES && 
    !countryCode.startsWith('EU') && 
    !countryCode.startsWith('EA') && 
    !countryCode.startsWith('EEA');
};

export const fetchLifeTableData = async (): Promise<LifeTableData[]> => {
  try {
    const response = await axios.get<EurostatResponse>(
      'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_mlifetable?time=2021&format=JSON&lang=EN'
    );

    const data = response.data;
    const lifeTableData: LifeTableData[] = [];

    Object.entries(data.value).forEach(([key, value]) => {
      const [geoIndex, ageIndex, timeIndex] = key.split(':').map(Number);
      
      const countryCode = Object.entries(data.dimension.geo.category.index)
        .find(([_, index]) => index === geoIndex)?.[0] || '';
      
      if (!filterValidCountries(countryCode)) return;

      const age = Object.entries(data.dimension.age.category.index)
        .find(([_, index]) => index === ageIndex)?.[0] || '';

      const year = Object.entries(data.dimension.time.category.index)
        .find(([_, index]) => index === timeIndex)?.[0] || '';

      const ageLabel = data.dimension.age.category.label[age];

      if (countryCode && age && year && !isNaN(value)) {
        lifeTableData.push({
          id: `${countryCode}-${age}-${year}`,
          countryCode,
          country: COUNTRY_CODES[countryCode],
          age: ageLabel,
          year,
          value
        });
      }
    });

    return lifeTableData.sort((a, b) => Number(a.age.split(' ')[0]) - Number(b.age.split(' ')[0]));
  } catch (error) {
    console.error('Error fetching life table data:', error);
    throw error;
  }
};