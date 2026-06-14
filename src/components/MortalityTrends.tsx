import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
import { fetchMortalityTrends } from '../services/mortalityTrendsApi';
import type { MortalityTrendData } from '../types/cdc';
import { Line } from 'react-chartjs-2';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { MultiSelect } from './MultiSelect';
import { colorForIndex } from '../design/tokens';
import { applyChartTheme } from '../design/chartTheme';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
applyChartTheme();

const DEMOGRAPHIC_GROUPS = [
  'White - Male',
  'White - Female',
  'Black - Male',
  'Black - Female',
  'All Races - Male',
  'All Races - Female',
];

const GROUP_COLOR: Record<string, string> = Object.fromEntries(
  DEMOGRAPHIC_GROUPS.map((g, i) => [g, colorForIndex(i)]),
);

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
        setData(await fetchMortalityTrends());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mortality trends');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const uniqueYears = React.useMemo(
    () => [...new Set(data.map((d) => d.year))].sort(),
    [data],
  );

  const chartData = React.useMemo(
    () => ({
      labels: uniqueYears,
      datasets: selectedGroups.map((category) => {
        const color = GROUP_COLOR[category] || '#586068';
        return {
          label: category,
          data: uniqueYears.map((year) => {
            const yearData = data.find((d) => d.year === year && `${d.race} - ${d.sex}` === category);
            return yearData ? parseFloat(yearData.life_expectancy) : null;
          }),
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 5,
          spanGaps: true,
        };
      }),
    }),
    [data, selectedGroups, uniqueYears],
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom' as const, align: 'start' as const },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number } }) =>
            `${context.dataset.label}: ${context.parsed.y.toFixed(1)} yrs`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: 'Life expectancy (years)', color: '#8B939B', font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          callback: (_value: string | number, index: number) => {
            const year = uniqueYears[index];
            return year && parseInt(year) % 10 === 0 ? year : '';
          },
        },
      },
    },
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-ink-line bg-paper-raised p-5 shadow-card sm:p-6">
        <div className="w-full lg:max-w-xl">
          <MultiSelect
            label="Demographic groups"
            options={DEMOGRAPHIC_GROUPS}
            value={selectedGroups}
            onChange={setSelectedGroups}
            placeholder="Select demographic groups…"
          />
        </div>
      </div>

      <DashboardCard kicker="1900 — present" title="Life expectancy at birth">
        <div className="h-[520px]">
          {selectedGroups.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">
              Select at least one demographic group to display data
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-ink-line pt-5">
          <p className="eyebrow mb-3">Key insights</p>
          <ul className="grid gap-2 text-sm text-ink-mute sm:grid-cols-2">
            {[
              'Life expectancy has risen dramatically since 1900 across every group.',
              'Gaps between racial and gender groups have narrowed but persist.',
              'Women consistently outlive men in every period.',
              'Major health and social events leave visible marks on the curve.',
            ].map((point) => (
              <li key={point} className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </DashboardCard>
    </div>
  );
};
