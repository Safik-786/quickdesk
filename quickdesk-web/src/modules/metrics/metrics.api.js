import { axiosInstance } from '../../lib/axios';

export const metricsApi = {
  getSummary: () => axiosInstance.get('/metrics'),
};
