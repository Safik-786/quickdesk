import { axiosInstance } from '../../lib/axios';

export const ticketsApi = {
  // Employee
  submit: (data) => axiosInstance.post('/tickets', data),
  getMyTickets: () => axiosInstance.get('/tickets/mine'),

  // Agent
  getAll: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== '')),
    ).toString();
    return axiosInstance.get(`/tickets${params ? `?${params}` : ''}`);
  },
  getOne: (id) => axiosInstance.get(`/tickets/${id}`),
  getDraft: (id) => axiosInstance.get(`/tickets/${id}/draft`),
  override: (id, data) => axiosInstance.patch(`/tickets/${id}/override`, data),
  reply: (id, reply) => axiosInstance.post(`/tickets/${id}/reply`, { reply }),
};
