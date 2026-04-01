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
