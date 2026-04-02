import { create } from 'zustand';
import type { Workspace, Booking, User } from '../types/index.js';

interface WorkspaceStore {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
}

interface BookingStore {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  removeBooking: (id: string) => void;
  setBookings: (bookings: Booking[]) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
}

interface UserStore {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'booking';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  selectedWorkspace: null,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setSelectedWorkspace: (selectedWorkspace) => set({ selectedWorkspace }),
}));

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  addBooking: (booking) =>
    set((state) => ({ bookings: [...state.bookings, booking] })),
  removeBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== id),
    })),
  setBookings: (bookings) => set({ bookings }),
  updateBooking: (id, updates) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),
}));

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isAuthenticated: !!token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          ...notification,
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
