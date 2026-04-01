import axios from 'axios';
import { useUserStore } from '../stores/index.js';
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
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    verify: (token) => api.post('/auth/verify', { token }),
};
export const workspaceService = {
    getAll: () => api.get('/workspaces'),
    getById: (id) => api.get(`/workspaces/${id}`),
    getMyWorkspaces: () => api.get('/my-workspaces'),
    search: (location) => api.get(`/workspaces/search/location?location=${location}`),
    create: (data) => api.post('/workspaces', data),
    update: (id, data) => api.patch(`/workspaces/${id}`, data),
    delete: (id) => api.delete(`/workspaces/${id}`),
};
export const bookingService = {
    getById: (id) => api.get(`/bookings/${id}`),
    getMyBookings: () => api.get('/my-bookings'),
    getWorkspaceBookings: (workspaceId) => api.get(`/workspaces/${workspaceId}/bookings`),
    create: (data) => api.post('/bookings', data),
    updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};
export const healthCheck = () => api.get('/health');
