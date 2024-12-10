import React from 'react';
import { DashboardCard } from './DashboardCard';
import type { CDCDataPoint } from '../types/cdc';
import { Line } from 'react-chartjs-2';
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

interface MonthlyTrendsProps {
  data: CDCDataPoint[];
  selectedCauses: string[];
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Predefined colors for common causes
const CAUSE_COLORS: Record<string, { border: string; background: string }> = {
  'Heart Diseases': { 
    border: 'rgb(239, 68, 68)', 
    background: 'rgba(239, 68, 68, 0.1)' 
  },
  'Cancer': { 
    border: 'rgb(168, 85, 247)', 
    background: 'rgba(168, 85, 247, 0.1)' 
  },
  'Accidents (Unintentional)': { 
    border: 'rgb(59, 130, 246)', 
    background: 'rgba(59, 130, 246, 0.1)' 
  },
  'Stroke': { 
    border: 'rgb(16, 185, 129)', 
    background: 'rgba(16, 185, 129, 0.1)' 
  },
  "Alzheimer's Disease": { 
    border: 'rgb(245, 158, 11)', 
    background: 'rgba(245, 158, 11, 0.1)' 
  },
  'Diabetes': { 
    border: 'rgb(236, 72, 153)', 
    background: 'rgba(236, 72, 153, 0.1)' 
  },
  'Influenza and Pneumonia': { 
    border: 'rgb(14, 165, 233)', 
    background: 'rgba(14, 165, 233, 0.1)' 
  },
  'Chronic Lower Respiratory': { 
    border: 'rgb(139, 92, 246)', 
    background: 'rgba(139, 92, 246, 0.1)' 
  }
};

export const MonthlyTrends: React.FC<MonthlyTrendsProps> = ({
  data,
  selectedCauses,
}) => {
  const monthlyData = React.useMemo(() => {
    const causes = selectedCauses.length > 0 ? selectedCauses : ['All Causes'];
    
    return causes.map((cause, index) => {
      const causeData = data.filter(d => d.cause_name === cause);
      
      // Calculate average for each month across years
      const monthlyAverages = MONTHS.map((_, monthIndex) => {
        const monthData = causeData.filter(d => {
          const month = new Date(d.month).getMonth();
          return month === monthIndex;
        });
        
        if (monthData.length === 0) return 0;
        
        const sum = monthData.reduce((acc, curr) => 
          acc + parseFloat(curr.crude_rate), 0);
        return sum / monthData.length;
      });

      // Get predefined colors or generate new ones
      const colorIndex = index % 12;
      const defaultColor = {
        border: `hsl(${colorIndex * 30}, 70%, 50%)`,
        background: `hsla(${colorIndex * 30}, 70%, 50%, 0.1)`
      };
      const colors = CAUSE_COLORS[cause] || defaultColor;

      return {
        label: cause,
        data: monthlyAverages,
        borderColor: colors.border,
        backgroundColor: colors.background,
      };
    });
  }, [data, selectedCauses]);

  const chartData = {
    labels: MONTHS,
    datasets: monthlyData.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.borderColor,
      backgroundColor: dataset.backgroundColor,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Mortality Trends (Average Across Years)',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} per 100,000`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Average Death Rate per 100,000'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  };

  return (
    <DashboardCard title="Seasonal Patterns">
      <div className="h-[400px]">
        {data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No monthly data available
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Visualization of mortality rates by month, showing seasonal patterns and trends for different causes of death.</p>
      </div>
    </DashboardCard>
  );
};