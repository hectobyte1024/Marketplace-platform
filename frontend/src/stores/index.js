import { create } from 'zustand';
export const useWorkspaceStore = create((set) => ({
    workspaces: [],
    selectedWorkspace: null,
    setWorkspaces: (workspaces) => set({ workspaces }),
    setSelectedWorkspace: (selectedWorkspace) => set({ selectedWorkspace }),
}));
export const useBookingStore = create((set) => ({
    bookings: [],
    addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
    removeBooking: (id) => set((state) => ({
        bookings: state.bookings.filter((b) => b.id !== id),
    })),
    setBookings: (bookings) => set({ bookings }),
    updateBooking: (id, updates) => set((state) => ({
        bookings: state.bookings.map((b) => b.id === id ? { ...b, ...updates } : b),
    })),
}));
export const useUserStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setToken: (token) => {
        if (token) {
            localStorage.setItem('token', token);
        }
        else {
            localStorage.removeItem('token');
        }
        set({ token, isAuthenticated: !!token });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
export const useNotificationStore = create((set) => ({
    notifications: [],
    addNotification: (notification) => set((state) => ({
        notifications: [
            ...state.notifications,
            {
                id: Date.now().toString(),
                timestamp: Date.now(),
                ...notification,
            },
        ],
    })),
    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
    })),
    clearNotifications: () => set({ notifications: [] }),
}));
