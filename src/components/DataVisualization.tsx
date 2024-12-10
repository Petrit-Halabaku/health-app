import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { DashboardCard } from './DashboardCard';
import { BarChart, LineChart } from 'lucide-react';
import type { CDCDataPoint } from '../types/cdc';
import { AVAILABLE_YEARS } from '../config/cdcConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataVisualizationProps {
  data: CDCDataPoint[];
  selectedCauses: string[];
  chartType: 'line' | 'bar';
  onChartTypeChange: (type: 'line' | 'bar') => void;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  selectedCauses,
  chartType,
  onChartTypeChange
}) => {
  const years = AVAILABLE_YEARS.slice(0, 6); // 2014 to 2019

  const filteredData = React.useMemo(() => {
    return data.filter(item => {
      const yearMatch = years.includes(item.year);
      const causeMatch = selectedCauses.length === 0 || selectedCauses.includes(item.cause_name);
      return yearMatch && causeMatch;
    });
  }, [data, selectedCauses]);

  const chartData = React.useMemo(() => {
    const datasets = selectedCauses.length > 0 ? selectedCauses : [filteredData[0]?.cause_name];
    
    return {
      labels: years,
      datasets: datasets.map((cause, index) => {
        const color = `hsl(${(index * 360) / datasets.length}, 70%, 50%)`;
        const causeData = filteredData.filter(item => item.cause_name === cause);
        
        return {
          label: cause,
          data: years.map(year => {
            const dataPoint = causeData.find(item => item.year === year);
            return dataPoint ? parseFloat(dataPoint.crude_rate) : 0;
          }),
          borderColor: color,
          backgroundColor: `${color}80`,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        };
      })
    };
  }, [filteredData, selectedCauses]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Mortality Rate Trends (2014-2019)',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataPoint = filteredData.find(
              item => item.year === years[context.dataIndex] && 
                     item.cause_name === context.dataset.label
            );
            return [
              `${context.dataset.label}: ${context.parsed.y.toFixed(1)} per 100,000`,
              dataPoint && [
                `Deaths: ${parseInt(dataPoint.deaths).toLocaleString()}`,
                `Population: ${parseInt(dataPoint.population).toLocaleString()}`
              ]
            ].flat().filter(Boolean);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Death Rate per 100,000'
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

  return (
    <DashboardCard title="Mortality Rate Visualization">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onChartTypeChange('line')}
            className={`p-2 rounded ${
              chartType === 'line' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LineChart className="h-5 w-5" />
          </button>
          <button
            onClick={() => onChartTypeChange('bar')}
            className={`p-2 rounded ${
              chartType === 'bar' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart className="h-5 w-5" />
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {selectedCauses.length > 0
            ? `Showing trends for selected causes`
            : 'Showing all causes'}
        </div>
      </div>
      <div className="h-[500px]">
        {filteredData.length > 0 ? (
          chartType === 'line' ? (
            <Line options={options} data={chartData} />
          ) : (
            <Bar options={options} data={chartData} />
          )
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available for the selected filters
          </div>
        )}
      </div>
    </DashboardCard>
  );
};