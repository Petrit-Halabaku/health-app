import { useState, useEffect, lazy, Suspense } from 'react';
import { Activity } from 'lucide-react';
import { Filters } from './components/Filters';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { NavBar } from './components/NavBar';
import { LandingPage } from './components/LandingPage';
import { fetchCDCData } from './services/cdcApi';
import type { CDCDataPoint } from './types/cdc';

// Chart-bearing views are code-split so Chart.js never loads on the landing page.
const DataVisualization = lazy(() =>
  import('./components/DataVisualization').then((m) => ({ default: m.DataVisualization })),
);
const DataSummary = lazy(() =>
  import('./components/DataSummary').then((m) => ({ default: m.DataSummary })),
);
const MonthlyTrends = lazy(() =>
  import('./components/MonthlyTrends').then((m) => ({ default: m.MonthlyTrends })),
);
const DemographicCharts = lazy(() =>
  import('./components/DemographicCharts').then((m) => ({ default: m.DemographicCharts })),
);
const MortalityTrends = lazy(() =>
  import('./components/MortalityTrends').then((m) => ({ default: m.MortalityTrends })),
);

const ChartFallback = () => (
  <div className="flex items-center justify-center py-24 text-ink-faint">
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink-line border-t-brand" />
  </div>
);

type TabId = 'dashboard' | 'specific' | 'trends';

const TAB_META: Record<TabId, { eyebrow: string; title: string; desc: string }> = {
  dashboard: {
    eyebrow: 'CDC · United States',
    title: 'Mortality, in focus',
    desc: 'Annual death counts compared across causes and years, with the seasonal rhythm month by month.',
  },
  specific: {
    eyebrow: 'CDC · demographics',
    title: 'Who it reaches',
    desc: 'How the burden of mortality distributes across age groups and sex.',
  },
  trends: {
    eyebrow: 'Long-run series',
    title: 'The long arc',
    desc: 'Death rates and life expectancy traced across decades and populations.',
  },
};

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [data, setData] = useState<CDCDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const cdcData = await fetchCDCData();

        if (!isMounted) return;

        if (cdcData.length === 0) {
          throw new Error('No data available from CDC API');
        }

        setData(cdcData);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (showDashboard) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [showDashboard]);

  if (!showDashboard) {
    return <LandingPage onEnter={() => setShowDashboard(true)} />;
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <Filters data={data} selectedCauses={selectedCauses} onCausesChange={setSelectedCauses} />
            <div className="mt-6 grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                <div className="space-y-6">
                  <DataVisualization
                    data={data}
                    selectedCauses={selectedCauses}
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                  />
                  <MonthlyTrends data={data} selectedCauses={selectedCauses} />
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                <DataSummary data={data} selectedCauses={selectedCauses} />
              </div>
            </div>
          </>
        );
      case 'specific':
        return <DemographicCharts />;
      case 'trends':
        return <MortalityTrends />;
      default:
        return null;
    }
  };

  const meta = TAB_META[activeTab];

  return (
    <div className="grain min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-ink-line bg-paper/80 backdrop-blur-md">
        <div className="mx-auto max-w-wide px-[var(--shell-x)]">
          <div className="flex h-16 items-center justify-between gap-4">
            <button
              onClick={() => setShowDashboard(false)}
              className="group flex items-center gap-2.5"
              aria-label="Back to landing page"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-paper transition-transform duration-300 ease-editorial group-hover:-translate-y-0.5">
                <Activity className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="font-mono text-sm font-medium tracking-[0.18em]">VITALIS</span>
            </button>

            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand opacity-60 animate-pulse-ring" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              <span className="nums font-mono text-xs text-ink-mute">
                {data.length.toLocaleString()} records · 2014–2023
              </span>
            </div>
          </div>
        </div>
        <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
      </header>

      <main className="mx-auto max-w-wide px-[var(--shell-x)] py-10 md:py-14">
        <div key={activeTab} className="animate-fade-rise">
          <div className="mb-9 max-w-prose">
            <p className="eyebrow mb-3">{meta.eyebrow}</p>
            <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-normal leading-[1.05]">
              {meta.title}
            </h1>
            <p className="mt-3 text-ink-mute">{meta.desc}</p>
          </div>
          <Suspense fallback={<ChartFallback />}>{renderContent()}</Suspense>
        </div>
      </main>

      <footer className="mt-12 border-t border-ink-line">
        <div className="mx-auto flex max-w-wide flex-col gap-2 px-[var(--shell-x)] py-8 text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs tracking-[0.16em]">VITALIS — PUBLIC-HEALTH OBSERVATORY</span>
          <span className="font-mono text-xs">Source: CDC, WHO &amp; Eurostat open data</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
