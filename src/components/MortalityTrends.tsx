import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
import { fetchMortalityTrends } from '../services/mortalityTrendsApi';
import type { MortalityTrendData } from '../types/cdc';
import { Line } from 'react-chartjs-2';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { MultiSelect } from './MultiSelect';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DEMOGRAPHIC_GROUPS = [
  'White - Male',
  'White - Female',
  'Black - Male',
  'Black - Female',
  'All Races - Male',
  'All Races - Female'
];

export const MortalityTrends: React.FC = () => {
  const [data, setData] = useState<MortalityTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(DEMOGRAPHIC_GROUPS);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const trendsData = await fetchMortalityTrends();
        setData(trendsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mortality trends');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const chartData = React.useMemo(() => {
    const uniqueYears = [...new Set(data.map(d => d.year))].sort();

    const colors = {
      'White - Male': 'rgb(59, 130, 246)',
      'White - Female': 'rgb(236, 72, 153)',
      'Black - Male': 'rgb(245, 158, 11)',
      'Black - Female': 'rgb(16, 185, 129)',
      'All Races - Male': 'rgb(99, 102, 241)',
      'All Races - Female': 'rgb(217, 70, 239)'
    };

    return {
      labels: uniqueYears,
      datasets: selectedGroups.map(category => ({
        label: category,
        data: uniqueYears.map(year => {
          const yearData = data.find(d => 
            d.year === year && 
            `${d.race} - ${d.sex}` === category
          );
          return yearData ? parseFloat(yearData.life_expectancy) : null;
        }),
        borderColor: colors[category as keyof typeof colors] || '#666',
        backgroundColor: `${colors[category as keyof typeof colors]}22` || '#66666622',
        tension: 0.4,
        fill: true,
      }))
    };
  }, [data, selectedGroups]);

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
            const value = context.parsed.y.toFixed(1);
            return `${context.dataset.label}: ${value} years`;
          }
        }
      },
      title: {
        display: true,
        text: 'Life Expectancy at Birth by Race and Sex (1900-Present)',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Life Expectancy (Years)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Year'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          callback: (value: any, index: number, values: any[]) => {
            const year = chartData.labels[index];
            return parseInt(year as string) % 5 === 0 ? year : '';
          },
          autoSkip: false
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
          U.S. Life Expectancy Trends (1900-Present)
        </h2>
        <p className="text-gray-600 mb-4">
          Historical trends in life expectancy at birth, showing the evolution of public health 
          outcomes across different demographic groups over more than a century.
        </p>
        
        <div className="mt-4">
          <MultiSelect
            label="Demographic Groups"
            options={DEMOGRAPHIC_GROUPS}
            value={selectedGroups}
            onChange={setSelectedGroups}
            placeholder="Select demographic groups..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-[600px]">
          {selectedGroups.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Please select at least one demographic group to display data
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-semibold mb-2">Key Insights:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Life expectancy has increased dramatically since 1900 across all demographics</li>
            <li>The gap between racial and gender groups has narrowed but persists</li>
            <li>Women consistently show higher life expectancy than men</li>
            <li>Major health events and social changes are reflected in life expectancy trends</li>
          </ul>
        </div>
      </div>
    </div>
  );
};