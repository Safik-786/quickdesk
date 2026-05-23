import { axiosInstance } from '../../lib/axios';

export const ticketsApi = {
  // Employee
  submit: (data) =>
    axiosInstance.post('/tickets', data, {
      headers: { 'Content-Type': undefined }, // let axios set multipart/form-data + boundary from FormData
    }),
  getMyTickets: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== '')),
    ).toString();
    return axiosInstance.get(`/tickets/mine${params ? `?${params}` : ''}`);
  },

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
