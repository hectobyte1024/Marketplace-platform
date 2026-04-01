import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { bookingService } from '../services/api.js';
export const BookingForm = ({ workspace, onSuccess, onCancel }) => {
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('00:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('01:00');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const calculatePrice = () => {
        if (!startDate || !endDate || !startTime || !endTime)
            return 0;
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return hours > 0 ? Math.round(hours * workspace.hourlyRate * 100) / 100 : 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const startDateTime = `${startDate}T${startTime}:00Z`;
            const endDateTime = `${endDate}T${endTime}:00Z`;
            // Validate dates
            const start = new Date(startDateTime);
            const end = new Date(endDateTime);
            if (start >= end) {
                setError('End time must be after start time');
                setLoading(false);
                return;
            }
            if (start < new Date()) {
                setError('Cannot book in the past');
                setLoading(false);
                return;
            }
            const response = await bookingService.create({
                workspaceId: workspace.id,
                guestId: '', // Set by backend
                startDate: start,
                endDate: end,
                totalPrice: calculatePrice(),
                status: 'pending',
            });
            onSuccess?.(response.data);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to create booking');
        }
        finally {
            setLoading(false);
        }
    };
    const minDate = new Date().toISOString().split('T')[0];
    const totalPrice = calculatePrice();
    return (_jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("h2", { className: "text-xl font-semibold mb-4", children: ["Book ", workspace.name] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Date" }), _jsx("input", { type: "date", min: minDate, value: startDate, onChange: (e) => setStartDate(e.target.value), required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Time" }), _jsx("input", { type: "time", value: startTime, onChange: (e) => setStartTime(e.target.value), required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "End Date" }), _jsx("input", { type: "date", min: startDate || minDate, value: endDate, onChange: (e) => setEndDate(e.target.value), required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "End Time" }), _jsx("input", { type: "time", value: endTime, onChange: (e) => setEndTime(e.target.value), required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex justify-between items-center text-sm mb-2", children: [_jsx("span", { className: "text-gray-600", children: "Hourly Rate:" }), _jsxs("span", { className: "font-medium", children: ["$", workspace.hourlyRate.toFixed(2), "/hr"] })] }), _jsxs("div", { className: "border-t pt-2 flex justify-between items-center", children: [_jsx("span", { className: "text-lg font-semibold", children: "Total Price:" }), _jsxs("span", { className: "text-2xl font-bold text-blue-600", children: ["$", totalPrice.toFixed(2)] })] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm", children: error })), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "submit", disabled: loading, className: "flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition", children: loading ? 'Creating booking...' : 'Complete Booking' }), onCancel && (_jsx("button", { type: "button", onClick: onCancel, className: "flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition", children: "Cancel" }))] })] })] }));
};
