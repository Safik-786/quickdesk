import { axiosInstance } from '../../lib/axios';

export const authApi = {
  login: (credentials) =>
    axiosInstance.post('/auth/login', credentials),

  register: (data) =>
    axiosInstance.post('/auth/register', data),
};
