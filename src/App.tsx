import React, { useState, useEffect } from 'react';
import { Filters } from './components/Filters';
import { DataVisualization } from './components/DataVisualization';
import { DataSummary } from './components/DataSummary';
import { MonthlyTrends } from './components/MonthlyTrends';
import { DemographicCharts } from './components/DemographicCharts';
import { MortalityTrends } from './components/MortalityTrends';
import { Activity, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { NavBar } from './components/NavBar';
import { LandingPage } from './components/LandingPage';
import { fetchCDCData, type CDCDataPoint } from './services/cdcApi';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'specific' | 'trends'>('dashboard');
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
            <Filters
              data={data}
              selectedCauses={selectedCauses}
              onCausesChange={setSelectedCauses}
            />
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                <div className="space-y-6">
                  <DataVisualization 
                    data={data}
                    selectedCauses={selectedCauses}
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                  />
                  <MonthlyTrends 
                    data={data}
                    selectedCauses={selectedCauses}
                  />
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                <DataSummary 
                  data={data}
                  selectedCauses={selectedCauses}
                />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Health Data Analytics</h1>
          </div>
        </div>
      </header>

      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;