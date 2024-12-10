import React, { useMemo } from 'react';
import type { WHODataPoint } from '../types/who';
import { DashboardCard } from './DashboardCard';

interface StatsSummaryProps {
  data: WHODataPoint[];
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ data }) => {
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const byCountry = data.reduce((acc, curr) => {
      if (!acc[curr.country]) {
        acc[curr.country] = [];
      }
      acc[curr.country].push(curr.value);
      return acc;
    }, {} as Record<string, number[]>);

    const countryStats = Object.entries(byCountry).map(([country, values]) => ({
      country,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values)
    })).sort((a, b) => b.average - a.average);

    return countryStats;
  }, [data]);

  if (!stats || stats.length === 0) {
    return (
      <DashboardCard title="Statistics Summary">
        <p className="text-gray-500 text-center">No data available for the selected filters</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Statistics Summary">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.map(({ country, average, max, min }) => (
              <tr key={country} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {average.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {max.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {min.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
};