import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
import { fetchDemographicData } from '../services/cdcDemographicApi';
import type { CDCDemographicData } from '../types/cdc';
import { Bar, Line } from 'react-chartjs-2';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { colorForIndex, DATA_PALETTE, withAlpha } from '../design/tokens';
import { applyChartTheme } from '../design/chartTheme';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Title, Tooltip, Legend);
applyChartTheme();

const YEARS = ['2015', '2016', '2017', '2018', '2019', '2020'];

export const DemographicCharts: React.FC = () => {
  const [data, setData] = useState<CDCDemographicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setData(await fetchDemographicData());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load demographic data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const ageGroups = React.useMemo(
    () => [...new Set(data.map((d) => d.age_group))].sort(),
    [data],
  );

  const ageGroupData = React.useMemo(
    () => ({
      labels: ageGroups,
      datasets: YEARS.map((year, index) => {
        const color = colorForIndex(index);
        return {
          label: year,
          data: ageGroups.map((age) =>
            data
              .filter((d) => d.year === year && d.age_group === age)
              .reduce((sum, d) => sum + parseInt(d.deaths), 0),
          ),
          backgroundColor: withAlpha(color, 0.85),
          borderColor: color,
          borderWidth: 0,
          borderRadius: 3,
          maxBarThickness: 22,
        };
      }),
    }),
    [data, ageGroups],
  );

  const genderTrendData = React.useMemo(() => {
    const map: Record<string, { label: string; color: string }> = {
      F: { label: 'Female', color: DATA_PALETTE[3] },
      M: { label: 'Male', color: DATA_PALETTE[1] },
    };
    return {
      labels: YEARS,
      datasets: Object.entries(map).map(([gender, { label, color }]) => ({
        label,
        data: YEARS.map((year) =>
          data
            .filter((d) => d.year === year && d.sex === gender)
            .reduce((sum, d) => sum + parseInt(d.deaths), 0),
        ),
        backgroundColor: withAlpha(color, 0.12),
        borderColor: color,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
      })),
    };
  }, [data]);

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom' as const, align: 'start' as const },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number } }) =>
            `${context.dataset.label}: ${Math.round(context.parsed.y).toLocaleString()} deaths`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value: string | number) => Number(value).toLocaleString() },
      },
      x: { grid: { display: false } },
    },
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="grid grid-cols-1 gap-6">
      <DashboardCard kicker="2015–2020" title="Deaths by age group">
        <div className="h-[460px]">
          <Bar data={ageGroupData} options={baseOptions} />
        </div>
        <p className="mt-4 max-w-prose text-sm text-ink-mute">
          Mortality concentrates sharply in the oldest age bands — and the height of those bars has
          climbed year over year, most visibly in 2020.
        </p>
      </DashboardCard>

      <DashboardCard kicker="2015–2020" title="Mortality by sex">
        <div className="h-[380px]">
          <Line data={genderTrendData} options={baseOptions} />
        </div>
        <p className="mt-4 max-w-prose text-sm text-ink-mute">
          Recorded deaths among men and women tracked closely until 2020, when both rose together.
        </p>
      </DashboardCard>
    </div>
  );
};
