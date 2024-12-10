import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
import { fetchDemographicData } from '../services/cdcDemographicApi';
import type { CDCDemographicData } from '../types/cdc';
import { Bar, Line } from 'react-chartjs-2';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export const DemographicCharts: React.FC = () => {
  const [data, setData] = useState<CDCDemographicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const demographicData = await fetchDemographicData();
        setData(demographicData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load demographic data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const ageGroupData = React.useMemo(() => {
    const years = ['2015', '2016', '2017', '2018', '2019', '2020'];
    
    return {
      labels: [...new Set(data.map(d => d.age_group))].sort(),
      datasets: years.map((year, index) => ({
        label: year,
        data: [...new Set(data.map(d => d.age_group))].sort().map(age => {
          const yearData = data.filter(d => d.year === year && d.age_group === age);
          return yearData.reduce((sum, d) => sum + parseInt(d.deaths), 0);
        }),
        backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.7)`,
        borderColor: `hsla(${index * 60}, 70%, 50%, 1)`,
        borderWidth: 1,
      }))
    };
  }, [data]);

  const genderTrendData = React.useMemo(() => {
    const years = ['2015', '2016', '2017', '2018', '2019', '2020'];
    const genderLabels = { 'F': 'Female', 'M': 'Male' };
    
    return {
      labels: years,
      datasets: Object.entries(genderLabels).map(([gender, label]) => ({
        label,
        data: years.map(year => {
          const yearGenderData = data.filter(d => d.year === year && d.sex === gender);
          return yearGenderData.reduce((sum, d) => sum + parseInt(d.deaths), 0);
        }),
        backgroundColor: gender === 'F' ? 'rgba(236, 72, 153, 0.7)' : 'rgba(59, 130, 246, 0.7)',
        borderColor: gender === 'F' ? 'rgb(236, 72, 153)' : 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }))
    };
  }, [data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${parseInt(context.parsed.y).toLocaleString()} deaths`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Deaths'
        },
        ticks: {
          callback: (value: number) => value.toLocaleString()
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Demographic Mortality Analysis (2015-2020)
        </h2>
        <p className="text-gray-600 mb-4">
          Analysis of mortality patterns across age groups and gender, showing trends
          over the period from 2015 to 2020.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <DashboardCard title="Deaths by Age Group">
          <div className="h-[500px]">
            <Bar 
              data={ageGroupData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: 'Mortality Distribution by Age Group (2015-2020)',
                    font: { size: 16, weight: 'bold' }
                  }
                }
              }} 
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Distribution of deaths across different age groups, showing how mortality
            patterns vary with age and their changes over time.</p>
          </div>
        </DashboardCard>

        <DashboardCard title="Gender-based Mortality Trends">
          <div className="h-[400px]">
            <Line 
              data={genderTrendData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: 'Deaths by Gender Over Time (2015-2020)',
                    font: { size: 16, weight: 'bold' }
                  }
                }
              }} 
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Comparison of mortality trends between males and females, highlighting
            gender-based differences in death rates over the years.</p>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};