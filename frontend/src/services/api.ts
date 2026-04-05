import axios from 'axios';
import { useUserStore } from '../stores/index.js';
import type { Workspace, Booking, AvailabilitySlot, AnalyticsSummary, AnalyticsTrend, MonthlyRevenue, TopHour } from '../types/index.js';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authService = {
  register: (data: { email: string; name: string; password: string; role?: 'guest' | 'host' }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verify: (token: string) => api.post('/auth/verify', { token }),
};

export const workspaceService = {
  getAll: () => api.get<Workspace[]>('/workspaces'),
  getById: (id: string) => api.get<Workspace>(`/workspaces/${id}`),
  getMyWorkspaces: () => api.get<Workspace[]>('/my-workspaces'),
  search: (location: string) =>
    api.get<Workspace[]>(`/workspaces/search/location?location=${location}`),
  create: (data: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Workspace>('/workspaces', data),
  update: (id: string, data: Partial<Workspace>) =>
    api.patch<Workspace>(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
};

export interface PricingRule {
  id: string;
  workspaceId: string;
  dayOfWeek?: number;
  seasonType?: 'peak' | 'shoulder' | 'low';
  multiplier: number;
  createdAt: Date;
}

export const bookingService = {
  getById: (id: string) => api.get<Booking>(`/bookings/${id}`),
  getMyBookings: () => api.get<Booking[]>('/my-bookings'),
  getByWorkspace: (workspaceId: string) =>
    api.get<Booking[]>(`/workspaces/${workspaceId}/bookings`),
  create: (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Booking>('/bookings', data),
  updateStatus: (id: string, status: string) =>
    api.patch<Booking>(`/bookings/${id}/status`, { status }),
};

export const pricingService = {
  getRules: (workspaceId: string) =>
    api.get<PricingRule[]>(`/workspaces/${workspaceId}/pricing`),
  createRule: (workspaceId: string, data: Omit<PricingRule, 'id' | 'createdAt'>) =>
    api.post<PricingRule>(`/workspaces/${workspaceId}/pricing`, data),
  updateRule: (id: string, data: Partial<PricingRule>) =>
    api.patch<PricingRule>(`/pricing-rules/${id}`, data),
  deleteRule: (id: string) => api.delete(`/pricing-rules/${id}`),
  calculatePrice: (workspaceId: string, startDate: Date, endDate: Date) =>
    api.post<{
      baseRate: number;
      totalPrice: number;
      hours: number;
      rules: PricingRule[];
    }>(`/workspaces/${workspaceId}/calculate-price`, {
      startDate,
      endDate,
    }),
};

export const availabilityService = {
  getSlots: (workspaceId: string) =>
    api.get<AvailabilitySlot[]>(`/workspaces/${workspaceId}/availability`),
  checkAvailability: (workspaceId: string, startDate: Date, endDate: Date) =>
    api.post<{ available: boolean }>(`/workspaces/${workspaceId}/check-availability`, {
      startDate,
      endDate,
    }),
  createSlot: (
    workspaceId: string,
    data: Omit<AvailabilitySlot, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ) => api.post<AvailabilitySlot>(`/workspaces/${workspaceId}/availability`, data),
  updateSlot: (id: string, data: Partial<AvailabilitySlot>) =>
    api.patch<AvailabilitySlot>(`/availability-slots/${id}`, data),
  deleteSlot: (id: string) => api.delete(`/availability-slots/${id}`),
};

export const analyticsService = {
  getSummary: (workspaceId: string, days: number = 30) =>
    api.get<AnalyticsSummary>(`/workspaces/${workspaceId}/analytics/summary?days=${days}`),
  getTrends: (workspaceId: string, days: number = 30) =>
    api.get<AnalyticsTrend[]>(`/workspaces/${workspaceId}/analytics/trends?days=${days}`),
  getMonthlyRevenue: (workspaceId: string, months: number = 6) =>
    api.get<MonthlyRevenue[]>(`/workspaces/${workspaceId}/analytics/monthly?months=${months}`),
  getTopHours: (workspaceId: string, days: number = 30) =>
    api.get<TopHour[]>(`/workspaces/${workspaceId}/analytics/top-hours?days=${days}`),
};

export const healthCheck = () => api.get('/health');
