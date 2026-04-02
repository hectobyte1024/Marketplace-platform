import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { availabilityService } from '../services/api.js';
export const AvailabilityCalendar = ({ workspaceId }) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    // Form state
    const [formData, setFormData] = useState({
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '17:00',
        isAvailable: true,
        recurringPattern: '',
    });
    useEffect(() => {
        fetchSlots();
    }, [workspaceId]);
    const fetchSlots = async () => {
        try {
            setLoading(true);
            const response = await availabilityService.getSlots(workspaceId);
            setSlots(response.data);
            setError(null);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to load availability slots');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddSlot = async (e) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate) {
            setError('Please fill in all required fields');
            return;
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            setError('Start date must be before end date');
            return;
        }
        try {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
            const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
            await availabilityService.createSlot(workspaceId, {
                workspaceId,
                startDate: startDateTime,
                endDate: endDateTime,
                isAvailable: formData.isAvailable,
                recurringPattern: formData.recurringPattern || undefined,
            });
            setSlots([]);
            await fetchSlots();
            setShowForm(false);
            setFormData({
                startDate: '',
                startTime: '09:00',
                endDate: '',
                endTime: '17:00',
                isAvailable: true,
                recurringPattern: '',
            });
            setError(null);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to create availability slot');
        }
    };
    const handleDeleteSlot = async (slotId) => {
        try {
            await availabilityService.deleteSlot(slotId);
            setSlots(slots.filter((s) => s.id !== slotId));
            setDeleteConfirm(null);
            setError(null);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to delete availability slot');
        }
    };
    const formatDateTime = (date) => {
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const formatSlotLabel = (slot) => {
        if (slot.isAvailable) {
            return 'Available';
        }
        else {
            return 'Blocked';
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-bold", children: "Manage Availability" }), _jsx("button", { onClick: () => setShowForm(!showForm), className: "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600", children: showForm ? 'Cancel' : 'Add Slot' })] }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded text-sm", children: error })), showForm && (_jsxs("form", { onSubmit: handleAddSlot, className: "mb-6 p-4 bg-gray-50 rounded border", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Start Date" }), _jsx("input", { type: "date", required: true, value: formData.startDate, onChange: (e) => setFormData({ ...formData, startDate: e.target.value }), className: "w-full border rounded px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Start Time" }), _jsx("input", { type: "time", required: true, value: formData.startTime, onChange: (e) => setFormData({ ...formData, startTime: e.target.value }), className: "w-full border rounded px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "End Date" }), _jsx("input", { type: "date", required: true, value: formData.endDate, onChange: (e) => setFormData({ ...formData, endDate: e.target.value }), className: "w-full border rounded px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "End Time" }), _jsx("input", { type: "time", required: true, value: formData.endTime, onChange: (e) => setFormData({ ...formData, endTime: e.target.value }), className: "w-full border rounded px-3 py-2" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Status" }), _jsxs("select", { value: formData.isAvailable ? 'available' : 'blocked', onChange: (e) => setFormData({ ...formData, isAvailable: e.target.value === 'available' }), className: "w-full border rounded px-3 py-2", children: [_jsx("option", { value: "available", children: "Available" }), _jsx("option", { value: "blocked", children: "Blocked (Unavailable)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Recurring Pattern" }), _jsxs("select", { value: formData.recurringPattern, onChange: (e) => setFormData({ ...formData, recurringPattern: e.target.value }), className: "w-full border rounded px-3 py-2", children: [_jsx("option", { value: "", children: "None (One-time)" }), _jsx("option", { value: "daily", children: "Daily" }), _jsx("option", { value: "weekly", children: "Weekly" }), _jsx("option", { value: "monthly", children: "Monthly" })] })] })] }), _jsx("div", { className: "text-xs text-gray-600 mb-4", children: _jsx("p", { children: formData.isAvailable
                                ? '✓ This period will be available for booking'
                                : '✗ This period will be blocked/unavailable' }) }), _jsx("button", { type: "submit", className: "w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600", disabled: loading, children: loading ? 'Creating...' : 'Create Slot' })] })), loading && !showForm && (_jsx("div", { className: "text-center py-8 text-gray-500", children: "Loading slots..." })), !loading && slots.length === 0 && (_jsx("div", { className: "text-center py-8 text-gray-500", children: _jsx("p", { children: "No availability slots yet. Add one to get started." }) })), slots.length > 0 && (_jsx("div", { className: "space-y-2", children: slots.map((slot) => (_jsxs("div", { className: `p-3 rounded border-l-4 flex justify-between items-center ${slot.isAvailable
                        ? 'border-l-green-500 bg-green-50'
                        : 'border-l-red-500 bg-red-50'}`, children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "font-medium", children: [formatSlotLabel(slot), slot.recurringPattern && (_jsxs("span", { className: "text-xs ml-2 text-gray-600", children: ["(", slot.recurringPattern, ")"] }))] }), _jsxs("div", { className: "text-sm text-gray-600", children: [formatDateTime(slot.startDate), " \u2192 ", formatDateTime(slot.endDate)] })] }), deleteConfirm === slot.id ? (_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleDeleteSlot(slot.id), className: "bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700", children: "Yes" }), _jsx("button", { onClick: () => setDeleteConfirm(null), className: "bg-gray-400 text-white text-xs px-2 py-1 rounded hover:bg-gray-500", children: "No" })] })) : (_jsx("button", { onClick: () => setDeleteConfirm(slot.id), className: "ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600", children: "Delete" }))] }, slot.id))) }))] }));
};
