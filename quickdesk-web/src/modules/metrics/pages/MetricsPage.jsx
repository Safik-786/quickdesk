
import MetricsPanel from '../components/MetricsPanel';
import { useMetricsSummary } from '../metrics.hooks';
import PageHeader from '../../../components/ui/PageHeader';

export default function MetricsPage() {
  const { data: metricsData, isLoading, isError, error } = useMetricsSummary();

  return (
    <div className="min-h-screen rounded-xl shadow bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:p-6">
        <PageHeader 
          title="System Metrics" 
          description="Overview of support ticket performance and statistics." 
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            Failed to load metrics: {error?.message}
          </div>
        ) : (
          <MetricsPanel data={metricsData} />
        )}
      </main>
    </div>
  );
}
