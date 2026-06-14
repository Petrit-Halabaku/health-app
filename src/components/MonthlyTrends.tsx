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
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { colorForKey, withAlpha } from '../design/tokens';
import { applyChartTheme } from '../design/chartTheme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);
applyChartTheme();

interface MonthlyTrendsProps {
  data: CDCDataPoint[];
  selectedCauses: string[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MonthlyTrends: React.FC<MonthlyTrendsProps> = ({ data, selectedCauses }) => {
  const monthlyData = React.useMemo(() => {
    const causes = selectedCauses.length > 0 ? selectedCauses : ['All Causes'];

    return causes.map((cause) => {
      const causeData = data.filter((d) => d.cause_name === cause);

      const monthlyAverages = MONTHS.map((_, monthIndex) => {
        const monthData = causeData.filter((d) => new Date(d.month).getMonth() === monthIndex);
        if (monthData.length === 0) return 0;
        const sum = monthData.reduce((acc, curr) => acc + (parseInt(curr.deaths) || 0), 0);
        return Math.round(sum / monthData.length);
      });

      const color = colorForKey(cause);
      return {
        label: cause,
        data: monthlyAverages,
        borderColor: color,
        backgroundColor: withAlpha(color, 0.1),
      };
    });
  }, [data, selectedCauses]);

  const chartData = {
    labels: MONTHS,
    datasets: monthlyData.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.borderColor,
      backgroundColor: dataset.backgroundColor,
      fill: true,
      tension: 0.42,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointBackgroundColor: dataset.borderColor,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom' as const, align: 'start' as const },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number } }) =>
            `${context.dataset.label}: ${context.parsed.y.toLocaleString()} deaths`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Avg. deaths per month', color: '#8B939B', font: { size: 11 } },
        ticks: { callback: (value: string | number) => Number(value).toLocaleString() },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <DashboardCard kicker="Averaged across years" title="Seasonal patterns">
      <div className="h-[360px]">
        {data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            No monthly data available
          </div>
        )}
      </div>
      <p className="mt-4 max-w-prose text-sm text-ink-mute">
        Mortality rates by month reveal seasonal rhythm — respiratory and cardiac causes typically
        crest in winter, while injury-related deaths rise through summer.
      </p>
    </DashboardCard>
  );
};
