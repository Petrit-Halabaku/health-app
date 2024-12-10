import React from 'react';
import type { CDCDataPoint } from '../types/cdc';
import { DashboardCard } from './DashboardCard';
import { Activity, Users, Calendar } from 'lucide-react';
import { AVAILABLE_YEARS } from '../config/cdcConfig';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DataSummaryProps {
  data: CDCDataPoint[];
  selectedCauses: string[];
}

export const DataSummary: React.FC<DataSummaryProps> = ({
  data,
  selectedCauses,
}) => {
  const years = AVAILABLE_YEARS.slice(0, 6); // 2014 to 2019

  const filteredData = React.useMemo(() => {
    return data.filter(item => {
      const yearMatch = years.includes(item.year);
      const causeMatch = selectedCauses.length === 0 || selectedCauses.includes(item.cause_name);
      return yearMatch && causeMatch;
    });
  }, [data, selectedCauses]);

  const stats = React.useMemo(() => {
    if (!filteredData.length) return null;

    const rates = filteredData.map(item => parseFloat(item.crude_rate) || 0);
    const totalDeaths = filteredData.reduce((sum, item) => sum + (parseInt(item.deaths) || 0), 0);
    const totalPopulation = filteredData.reduce((sum, item) => sum + (parseInt(item.population) || 0), 0);
    const averageRate = rates.reduce((a, b) => a + b, 0) / rates.length;

    return {
      averageRate,
      totalDeaths,
      totalPopulation
    };
  }, [filteredData]);

  const donutData = React.useMemo(() => {
    // Filter data for all years and exclude all/natural causes
    const relevantData = data.filter(item => 
      years.includes(item.year) && 
      item.cause_name !== 'All Causes' && 
      item.cause_name !== 'Natural Causes'
    );

    // Group by cause and sum deaths
    const causeDeaths = relevantData.reduce((acc, item) => {
      const cause = item.cause_name;
      if (!acc[cause]) {
        acc[cause] = 0;
      }
      acc[cause] += parseInt(item.deaths) || 0;
      return acc;
    }, {} as Record<string, number>);

    // Sort causes by total deaths and get top 8
    const sortedCauses = Object.entries(causeDeaths)
      .sort(([, a], [, b]) => b - a);
    
    const topCauses = sortedCauses.slice(0, 8);
    const otherCauses = sortedCauses.slice(8);

    const otherDeaths = otherCauses.reduce((sum, [, deaths]) => sum + deaths, 0);

    const colors = [
      '#2563eb', '#7c3aed', '#db2777', '#dc2626',
      '#ea580c', '#65a30d', '#0d9488', '#6366f1',
      '#94a3b8' // for "Other"
    ];

    return {
      labels: [...topCauses.map(([cause]) => cause), 'Other'],
      datasets: [{
        data: [...topCauses.map(([, deaths]) => deaths), otherDeaths],
        backgroundColor: colors,
        borderColor: colors.map(color => `${color}22`),
        borderWidth: 1,
        hoverOffset: 4
      }]
    };
  }, [data, years]);

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        display: true,
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  if (!stats) {
    return (
      <DashboardCard title="Statistics Summary">
        <p className="text-gray-500 text-center">No data available</p>
      </DashboardCard>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardCard title="Statistics Summary">
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Death Rate</p>
                <p className="text-2xl font-bold text-blue-900">{stats.averageRate.toFixed(1)}</p>
                <p className="text-sm text-blue-700">per 100,000 population</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Total Deaths</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalDeaths.toLocaleString()}</p>
                <p className="text-sm text-green-700">recorded cases</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Total Population</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalPopulation.toLocaleString()}</p>
                <p className="text-sm text-purple-700">covered population</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="Leading Causes of Death (2014-2019)">
        <div className="h-[300px] relative">
          <Doughnut data={donutData} options={donutOptions} />
        </div>
      </DashboardCard>
    </div>
  );
};