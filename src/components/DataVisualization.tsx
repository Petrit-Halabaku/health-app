import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { DashboardCard } from './DashboardCard';
import { Activity, BarChart3, LineChart } from 'lucide-react';
import type { CDCDataPoint } from '../types/cdc';
import { AVAILABLE_YEARS } from '../config/cdcConfig';
import { colorForKey, withAlpha } from '../design/tokens';
import { applyChartTheme } from '../design/chartTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);
applyChartTheme();

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
  onChartTypeChange,
}) => {
  const years = AVAILABLE_YEARS.slice(0, 6); // 2014 to 2019

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const yearMatch = years.includes(item.year);
      const causeMatch = selectedCauses.length === 0 || selectedCauses.includes(item.cause_name);
      return yearMatch && causeMatch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedCauses]);

  const chartData = React.useMemo(() => {
    const datasets = selectedCauses.length > 0 ? selectedCauses : ['All Causes'];

    return {
      labels: years,
      datasets: datasets.filter(Boolean).map((cause) => {
        const color = colorForKey(cause as string);
        const causeData = filteredData.filter((item) => item.cause_name === cause);

        return {
          label: cause,
          // Annual deaths = sum of the monthly counts for that year.
          data: years.map((year) =>
            causeData
              .filter((item) => item.year === year)
              .reduce((sum, item) => sum + (parseInt(item.deaths) || 0), 0),
          ),
          borderColor: color,
          backgroundColor: chartType === 'bar' ? withAlpha(color, 0.82) : withAlpha(color, 0.08),
          borderWidth: 2,
          tension: 0.34,
          pointRadius: chartType === 'line' ? 2.5 : 0,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: '#FCFCF9',
          pointBorderWidth: 1.5,
          borderRadius: chartType === 'bar' ? 4 : 0,
          fill: chartType === 'line',
          maxBarThickness: 26,
        };
      }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, selectedCauses, chartType]);

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
        title: { display: true, text: 'Deaths per year', color: '#8B939B', font: { size: 11 } },
        ticks: { callback: (value: string | number) => Number(value).toLocaleString() },
      },
      x: { grid: { display: false } },
    },
  };

  const toggle = (
    <div className="inline-flex items-center gap-0.5 rounded-pill border border-ink-line bg-paper p-1">
      {([
        { type: 'line' as const, Icon: LineChart, label: 'Line' },
        { type: 'bar' as const, Icon: BarChart3, label: 'Bar' },
      ]).map(({ type, Icon, label }) => (
        <button
          key={type}
          onClick={() => onChartTypeChange(type)}
          aria-pressed={chartType === type}
          className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
            chartType === type ? 'bg-ink text-paper' : 'text-ink-mute hover:text-ink'
          }`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <DashboardCard
      kicker={selectedCauses.length ? `${selectedCauses.length} selected` : 'All causes'}
      title="Annual deaths by cause · 2014–2019"
      action={toggle}
    >
      <div className="h-[460px]">
        {chartData.datasets.length > 0 ? (
          chartType === 'line' ? (
            <Line options={options} data={chartData} />
          ) : (
            <Bar options={options} data={chartData} />
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-ink-faint">
            <Activity className="h-7 w-7" strokeWidth={1.5} />
            <p className="text-sm">No data available for the selected filters</p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};
