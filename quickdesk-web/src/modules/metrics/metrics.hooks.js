import { useQuery } from '@tanstack/react-query';
import { metricsApi } from './metrics.api';


export function useMetricsSummary() {
  return useQuery({
    queryKey: ['metrics', 'summary'],
    queryFn: metricsApi.getSummary,
  });
}
