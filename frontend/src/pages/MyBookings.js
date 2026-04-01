import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { bookingService, workspaceService } from '../services/api.js';
import { BookingCard } from '../components/BookingCard.js';
export const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [workspaces, setWorkspaces] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    useEffect(() => {
        fetchBookings();
    }, []);
    const fetchBookings = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await bookingService.getMyBookings();
            setBookings(response.data);
            // Fetch workspace details for all bookings
            const workspaceMap = new Map();
            for (const booking of response.data) {
                if (!workspaceMap.has(booking.workspaceId)) {
                    try {
                        const wsResponse = await workspaceService.getById(booking.workspaceId);
                        workspaceMap.set(booking.workspaceId, wsResponse.data);
                    }
                    catch (err) {
                        console.error('Failed to fetch workspace:', booking.workspaceId);
                    }
                }
            }
            setWorkspaces(workspaceMap);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to load bookings');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }
        try {
            await bookingService.updateStatus(bookingId, 'cancelled');
            setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to cancel booking');
        }
    };
    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);
    return (_jsxs("div", { className: "max-w-6xl mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-boldmb-8", children: "My Bookings" }), error && (_jsx("div", { className: "mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: error })), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "inline-block", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }), _jsx("p", { className: "mt-2 text-gray-600", children: "Loading bookings..." })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "mb-6 flex gap-2 flex-wrap", children: ['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (_jsxs("button", { onClick: () => setFilter(status), className: `px-4 py-2 rounded-full text-sm font-medium transition ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`, children: [status.charAt(0).toUpperCase() + status.slice(1), status !== 'all' && (_jsxs("span", { className: "ml-2 text-xs", children: ["(", bookings.filter(b => b.status === status).length, ")"] }))] }, status))) }), filteredBookings.length === 0 ? (_jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-gray-600", children: bookings.length === 0 ? 'You have no bookings yet.' : 'No bookings match this filter.' }), bookings.length === 0 && (_jsx("a", { href: "/workspaces", className: "mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium", children: "Browse Workspaces \u2192" }))] })) : (_jsx("div", { className: "grid gap-4", children: filteredBookings.map(booking => (_jsx(BookingCard, { booking: booking, workspaceName: workspaces.get(booking.workspaceId)?.name, onCancel: handleCancel }, booking.id))) }))] }))] }));
};
