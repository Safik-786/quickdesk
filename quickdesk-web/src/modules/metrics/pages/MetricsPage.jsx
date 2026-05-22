
import Navbar from '../../core/components/Navbar';
import MetricsPanel from '../components/MetricsPanel';
import { useMetricsSummary } from '../metrics.hooks';

export default function MetricsPage() {
  const { data: metricsData, isLoading, isError, error } = useMetricsSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Metrics</h1>
          <p className="text-gray-500 mt-2">Overview of support ticket performance and statistics.</p>
        </div>

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
