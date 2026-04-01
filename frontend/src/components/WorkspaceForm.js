import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { workspaceService } from '../services/api.js';
export const WorkspaceForm = ({ workspace, onSuccess, onCancel, }) => {
    const isEdit = !!workspace;
    const [formData, setFormData] = useState({
        name: workspace?.name || '',
        description: workspace?.description || '',
        location: workspace?.location || '',
        latitude: workspace?.latitude || 0,
        longitude: workspace?.longitude || 0,
        capacity: workspace?.capacity || 10,
        hourlyRate: workspace?.hourlyRate || 50,
        amenities: workspace?.amenities?.join(', ') || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'capacity' || name === 'hourlyRate' || name === 'latitude' || name === 'longitude'
                ? parseFloat(value)
                : value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const data = {
                ...formData,
                amenities: formData.amenities
                    .split(',')
                    .map((a) => a.trim())
                    .filter(Boolean),
                images: [],
            };
            if (isEdit) {
                await workspaceService.update(workspace.id, data);
            }
            else {
                await workspaceService.create(data);
            }
            if (onSuccess)
                onSuccess();
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to save workspace');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto p-6 bg-white rounded-lg shadow", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: isEdit ? 'Edit Workspace' : 'Create New Workspace' }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Workspace Name *" }), _jsx("input", { type: "text", name: "name", value: formData.name, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Modern Downtown Office", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Location *" }), _jsx("input", { type: "text", name: "location", value: formData.location, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "New York, NY", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Capacity (people) *" }), _jsx("input", { type: "number", name: "capacity", value: formData.capacity, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", min: "1", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Hourly Rate ($) *" }), _jsx("input", { type: "number", name: "hourlyRate", value: formData.hourlyRate, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", min: "1", step: "0.01", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Latitude" }), _jsx("input", { type: "number", name: "latitude", value: formData.latitude, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", step: "0.0001" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Longitude" }), _jsx("input", { type: "number", name: "longitude", value: formData.longitude, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", step: "0.0001" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Description" }), _jsx("textarea", { name: "description", value: formData.description, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Describe your workspace...", rows: 4 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Amenities (comma-separated)" }), _jsx("input", { type: "text", name: "amenities", value: formData.amenities, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "WiFi, Parking, Coffee Bar, Meeting Rooms" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "submit", disabled: loading, className: "flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50", children: loading ? 'Saving...' : isEdit ? 'Update Workspace' : 'Create Workspace' }), onCancel && (_jsx("button", { type: "button", onClick: onCancel, className: "flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400", children: "Cancel" }))] })] })] }));
};
