import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { workspaceService } from '../services/api.js';
import { WorkspaceForm } from '../components/WorkspaceForm.js';
import { PricingRules } from '../components/PricingRules.js';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar.js';
import { AnalyticsPage } from './Analytics.js';
export const MyWorkspaces = () => {
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showPricingId, setShowPricingId] = useState(null);
    const [showAvailabilityId, setShowAvailabilityId] = useState(null);
    const [showAnalyticsId, setShowAnalyticsId] = useState(null);
    useEffect(() => {
        fetchWorkspaces();
    }, []);
    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const response = await workspaceService.getMyWorkspaces();
            setWorkspaces(response.data);
            setError(null);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to load workspaces');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        try {
            await workspaceService.delete(id);
            setWorkspaces((prev) => prev.filter((w) => w.id !== id));
            setDeleteConfirm(null);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to delete workspace');
        }
    };
    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingWorkspace(null);
        fetchWorkspaces();
    };
    if (showForm) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsx(WorkspaceForm, { workspace: editingWorkspace || undefined, onSuccess: handleFormSuccess, onCancel: () => {
                    setShowForm(false);
                    setEditingWorkspace(null);
                } }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold", children: "My Workspaces" }), _jsx("button", { onClick: () => setShowForm(true), className: "bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700", children: "+ Add Workspace" })] }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded", children: error })), loading && _jsx("p", { className: "text-center py-8", children: "Loading workspaces..." }), !loading && workspaces.length === 0 && (_jsxs("div", { className: "bg-white p-8 rounded-lg shadow text-center", children: [_jsx("p", { className: "text-gray-600 mb-4", children: "You haven't created any workspaces yet." }), _jsx("button", { onClick: () => setShowForm(true), className: "bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700", children: "Create Your First Workspace" })] })), !loading && workspaces.length > 0 && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: workspaces.map((workspace) => (_jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow", children: [workspace.images && workspace.images.length > 0 && (_jsx("img", { src: workspace.images[0], alt: workspace.name, className: "w-full h-48 object-cover" })), _jsxs("div", { className: "p-4", children: [_jsx("h3", { className: "text-lg font-bold mb-2", children: workspace.name }), _jsx("p", { className: "text-gray-600 text-sm mb-2", children: workspace.location }), _jsx("p", { className: "text-gray-600 text-sm mb-4 line-clamp-2", children: workspace.description }), _jsxs("div", { className: "grid grid-cols-2 gap-2 mb-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Capacity:" }), _jsxs("p", { className: "font-medium", children: [workspace.capacity, " people"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Rate:" }), _jsxs("p", { className: "font-medium", children: ["$", workspace.hourlyRate, "/hr"] })] })] }), workspace.amenities && workspace.amenities.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Amenities:" }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [workspace.amenities.slice(0, 3).map((amenity, idx) => (_jsx("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded", children: amenity }, idx))), workspace.amenities.length > 3 && (_jsxs("span", { className: "text-xs text-gray-500", children: ["+", workspace.amenities.length - 3] }))] })] })), _jsxs("div", { className: "flex gap-2 mb-4 flex-wrap", children: [_jsx("button", { onClick: () => {
                                                    setEditingWorkspace(workspace);
                                                    setShowForm(true);
                                                }, className: "flex-1 min-w-20 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-sm", children: "Edit" }), _jsx("button", { onClick: () => setShowPricingId(showPricingId === workspace.id ? null : workspace.id), className: `flex-1 min-w-24 ${showPricingId === workspace.id ? 'bg-purple-600' : 'bg-purple-500'} text-white py-2 rounded hover:bg-purple-600 text-sm`, children: "Pricing" }), _jsx("button", { onClick: () => setShowAvailabilityId(showAvailabilityId === workspace.id ? null : workspace.id), className: `flex-1 min-w-24 ${showAvailabilityId === workspace.id ? 'bg-orange-600' : 'bg-orange-500'} text-white py-2 rounded hover:bg-orange-600 text-sm`, children: "Availability" }), _jsx("button", { onClick: () => setShowAnalyticsId(showAnalyticsId === workspace.id ? null : workspace.id), className: `flex-1 min-w-24 ${showAnalyticsId === workspace.id ? 'bg-teal-600' : 'bg-teal-500'} text-white py-2 rounded hover:bg-teal-600 text-sm`, children: "Analytics" })] }), _jsx("div", { className: "flex gap-2 mb-4", children: deleteConfirm === workspace.id ? (_jsxs("div", { className: "flex-1 bg-red-100 rounded p-2 text-center", children: [_jsx("p", { className: "text-xs mb-1 font-medium", children: "Delete workspace?" }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => handleDelete(workspace.id), className: "flex-1 bg-red-600 text-white text-xs py-1 rounded hover:bg-red-700", children: "Yes, Delete" }), _jsx("button", { onClick: () => setDeleteConfirm(null), className: "flex-1 bg-gray-400 text-white text-xs py-1 rounded hover:bg-gray-500", children: "Cancel" })] })] })) : (_jsx("button", { onClick: () => setDeleteConfirm(workspace.id), className: "flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 text-sm", children: "Delete Workspace" })) }), showPricingId === workspace.id && (_jsx("div", { className: "border-t pt-4 mt-4", children: _jsx(PricingRules, { workspaceId: workspace.id }) })), showAvailabilityId === workspace.id && (_jsx("div", { className: "border-t pt-4 mt-4", children: _jsx(AvailabilityCalendar, { workspaceId: workspace.id }) })), showAnalyticsId === workspace.id && (_jsx("div", { className: "border-t pt-4 mt-4", children: _jsx(AnalyticsPage, { workspaceId: workspace.id, workspaceName: workspace.name, onClose: () => setShowAnalyticsId(null) }) }))] })] }, workspace.id))) }))] }) }));
};
