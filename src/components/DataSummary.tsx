import React from 'react';
import type { CDCDataPoint } from '../types/cdc';
import { DashboardCard } from './DashboardCard';
import { AVAILABLE_YEARS } from '../config/cdcConfig';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend, type TooltipItem } from 'chart.js';
import { DATA_PALETTE, INK_FAINT, PAPER_RAISED } from '../design/tokens';
import { applyChartTheme } from '../design/chartTheme';

ChartJS.register(ArcElement, Title, Tooltip, Legend);
applyChartTheme();

interface DataSummaryProps {
  data: CDCDataPoint[];
  selectedCauses: string[];
}

export const DataSummary: React.FC<DataSummaryProps> = ({ data, selectedCauses }) => {
  const years = AVAILABLE_YEARS.slice(0, 6); // 2014 to 2019

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const yearMatch = years.includes(item.year);
      // Unfiltered, summarise the "All Causes" total (avoids double-counting overlapping causes).
      const causeMatch =
        selectedCauses.length === 0
          ? item.cause_name === 'All Causes'
          : selectedCauses.includes(item.cause_name);
      return yearMatch && causeMatch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedCauses]);

  const stats = React.useMemo(() => {
    if (!filteredData.length) return null;
    const deaths = filteredData.map((item) => parseInt(item.deaths) || 0);
    const totalDeaths = deaths.reduce((a, b) => a + b, 0);
    const avgMonthly = Math.round(totalDeaths / deaths.length);
    const peakMonth = Math.max(...deaths);
    return { totalDeaths, avgMonthly, peakMonth };
  }, [filteredData]);

  const donut = React.useMemo(() => {
    const relevant = data.filter(
      (item) =>
        years.includes(item.year) &&
        item.cause_name !== 'All Causes' &&
        item.cause_name !== 'Natural Causes',
    );
    const causeDeaths = relevant.reduce((acc, item) => {
      acc[item.cause_name] = (acc[item.cause_name] || 0) + (parseInt(item.deaths) || 0);
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(causeDeaths).sort(([, a], [, b]) => b - a);
    const top = sorted.slice(0, 7);
    const otherDeaths = sorted.slice(7).reduce((sum, [, d]) => sum + d, 0);
    const colors = [...DATA_PALETTE.slice(0, 7), '#B6B7AC'];
    const total = top.reduce((s, [, d]) => s + d, 0) + otherDeaths;

    return {
      total,
      chart: {
        labels: [...top.map(([cause]) => cause), 'Other'],
        datasets: [
          {
            data: [...top.map(([, deaths]) => deaths), otherDeaths],
            backgroundColor: colors,
            borderColor: PAPER_RAISED,
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '66%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 7, boxHeight: 7, padding: 11, color: INK_FAINT, font: { size: 10.5 } },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            const value = context.raw as number;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const pct = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
  };

  const metrics = stats
    ? [
        {
          accent: DATA_PALETTE[3],
          value: stats.totalDeaths.toLocaleString(),
          label: 'Total deaths',
          sub: 'recorded, 2014–2019',
        },
        {
          accent: DATA_PALETTE[0],
          value: stats.avgMonthly.toLocaleString(),
          label: 'Monthly average',
          sub: 'deaths per month',
        },
        {
          accent: DATA_PALETTE[1],
          value: stats.peakMonth.toLocaleString(),
          label: 'Peak month',
          sub: 'highest monthly total',
        },
      ]
    : [];

  if (!stats) {
    return (
      <DashboardCard title="Summary">
        <p className="py-8 text-center text-sm text-ink-faint">No data available</p>
      </DashboardCard>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardCard kicker="At a glance" title="Summary">
        <div className="space-y-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="relative overflow-hidden rounded-lg border border-ink-line bg-paper py-3.5 pl-5 pr-4"
            >
              <span
                className="absolute inset-y-0 left-0 w-1"
                style={{ backgroundColor: m.accent }}
                aria-hidden="true"
              />
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
                {m.label}
              </p>
              <p className="nums mt-0.5 font-display text-2xl font-medium leading-tight text-ink">
                {m.value}
              </p>
              <p className="text-xs text-ink-mute">{m.sub}</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard kicker="2014–2019" title="Leading causes">
        <div className="relative h-[320px]">
          <Doughnut data={donut.chart} options={donutOptions} />
          <div className="pointer-events-none absolute inset-x-0 top-[38%] flex -translate-y-1/2 flex-col items-center">
            <span className="nums font-display text-2xl font-medium leading-none text-ink">
              {(donut.total / 1_000_000).toFixed(1)}M
            </span>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-faint">
              total deaths
            </span>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};
