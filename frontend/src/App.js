import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header.js';
import { Home } from './pages/Home.js';
import { Browse } from './pages/Browse.js';
import { Auth } from './pages/Auth.js';
import { MyWorkspaces } from './pages/MyWorkspaces.js';
import { MyBookings } from './pages/MyBookings.js';
import { NotificationCenter } from './components/NotificationCenter.js';
import { useUserStore, useNotificationStore, useBookingStore } from './stores/index.js';
import { authService } from './services/api.js';
import { useSocket, onBookingCreated, onNewBooking, onBookingConfirmed, onBookingCancelled } from './hooks/useSocket.js';
import './index.css';
// Protected route component
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/auth", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
function App() {
    const [loading, setLoading] = useState(true);
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);
    const setUser = useUserStore((state) => state.setUser);
    const setToken = useUserStore((state) => state.setToken);
    const addNotification = useNotificationStore((state) => state.addNotification);
    const updateBooking = useBookingStore((state) => state.updateBooking);
    // Initialize Socket.io
    const { socket, connected } = useSocket();
    // Check if user is logged in on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token is still valid
                    const response = await authService.verify(token);
                    if (response.data.valid) {
                        // Fetch current user
                        const userResponse = await authService.getMe();
                        setUser(userResponse.data);
                    }
                    else {
                        // Token invalid
                        setToken(null);
                    }
                }
                catch (error) {
                    console.error('Auth check failed:', error);
                    setToken(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, [setUser, setToken]);
    // Set up Socket.io event listeners
    useEffect(() => {
        if (!socket || !connected)
            return;
        // Listen for booking created
        onBookingCreated((data) => {
            addNotification({
                type: 'booking',
                title: 'Booking Created',
                message: data.message,
                data,
            });
        });
        // Listen for new booking (host view)
        onNewBooking((data) => {
            addNotification({
                type: 'booking',
                title: 'New Booking Request',
                message: data.message,
                data,
            });
        });
        // Listen for booking confirmed
        onBookingConfirmed((data) => {
            addNotification({
                type: 'success',
                title: 'Booking Confirmed!',
                message: data.message,
                data,
            });
            updateBooking(data.bookingId, { status: 'confirmed' });
        });
        // Listen for booking cancelled
        onBookingCancelled((data) => {
            addNotification({
                type: 'info',
                title: 'Booking Cancelled',
                message: data.message,
                data,
            });
            updateBooking(data.bookingId, { status: 'cancelled' });
        });
    }, [socket, connected, addNotification, updateBooking]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "text-xl", children: "Loading..." }) }));
    }
    return (_jsx(BrowserRouter, { children: _jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(Header, {}), _jsx(NotificationCenter, {}), _jsx("main", { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/auth", element: isAuthenticated ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(Auth, {}) }), _jsx(Route, { path: "/workspaces", element: _jsx(Browse, {}) }), _jsx(Route, { path: "/my-bookings", element: _jsx(ProtectedRoute, { children: _jsx(MyBookings, {}) }) }), _jsx(Route, { path: "/my-workspaces", element: _jsx(ProtectedRoute, { children: _jsx(MyWorkspaces, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) })] }) }));
}
export default App;
