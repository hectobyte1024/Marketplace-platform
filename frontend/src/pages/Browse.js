import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { workspaceService } from '../services/api.js';
import { useUserStore } from '../stores/index.js';
import { WorkspaceCard } from '../components/WorkspaceCard.js';
import { BookingForm } from '../components/BookingForm.js';
export const Browse = () => {
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchLocation, setSearchLocation] = useState('');
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);
    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                setLoading(true);
                const response = await workspaceService.getAll();
                setWorkspaces(response.data);
            }
            catch (err) {
                setError('Failed to load workspaces');
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchWorkspaces();
    }, []);
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchLocation.trim())
            return;
        try {
            setLoading(true);
            const response = await workspaceService.search(searchLocation);
            setWorkspaces(response.data);
        }
        catch (err) {
            setError('Search failed');
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleBookingSuccess = (booking) => {
        setSelectedWorkspace(null);
        alert('Booking created successfully! The host will confirm your booking shortly.');
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-8", children: "Find Your Workspace" }), _jsx("form", { onSubmit: handleSearch, className: "mb-8 bg-gray-100 p-4 rounded-lg", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Search by location...", value: searchLocation, onChange: (e) => setSearchLocation(e.target.value), className: "flex-1 px-4 py-2 border rounded-lg" }), _jsx("button", { type: "submit", className: "bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700", children: "Search" })] }) }), loading && _jsx("p", { className: "text-center py-8", children: "Loading workspaces..." }), error && _jsx("p", { className: "text-center py-8 text-red-600", children: error }), selectedWorkspace ? (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold", children: selectedWorkspace.name }), _jsx("button", { onClick: () => setSelectedWorkspace(null), className: "text-gray-500 hover:text-gray-700 text-2xl", children: "\u00D7" })] }), _jsxs("div", { className: "p-6 grid grid-cols-2 gap-6", children: [_jsx("div", { children: _jsxs("div", { className: "space-y-4", children: [selectedWorkspace.images && selectedWorkspace.images.length > 0 && (_jsx("div", { className: "h-48 bg-gray-200 rounded-lg overflow-hidden", children: _jsx("img", { src: selectedWorkspace.images[0], alt: selectedWorkspace.name, className: "w-full h-full object-cover", onError: (e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Workspace';
                                                    } }) })), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Location" }), _jsx("p", { className: "font-medium", children: selectedWorkspace.location })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Capacity" }), _jsxs("p", { className: "font-medium", children: [selectedWorkspace.capacity, " people"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Rate" }), _jsxs("p", { className: "font-medium", children: ["$", selectedWorkspace.hourlyRate, "/hour"] })] }), selectedWorkspace.amenities && selectedWorkspace.amenities.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Amenities" }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedWorkspace.amenities.map((amenity, idx) => (_jsx("span", { className: "bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm", children: amenity }, idx))) })] })), selectedWorkspace.description && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Description" }), _jsx("p", { className: "text-gray-700", children: selectedWorkspace.description })] }))] })] }) }), _jsx("div", { children: !isAuthenticated ? (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 text-center", children: [_jsx("p", { className: "text-gray-700 mb-4", children: "Sign in to book this workspace" }), _jsx("a", { href: "/auth", className: "inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700", children: "Sign In" })] })) : (_jsx(BookingForm, { workspace: selectedWorkspace, onSuccess: handleBookingSuccess, onCancel: () => setSelectedWorkspace(null) })) })] })] }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: workspaces.map((workspace) => (_jsx("div", { onClick: () => setSelectedWorkspace(workspace), className: "cursor-pointer hover:shadow-lg transition", children: _jsx(WorkspaceCard, { ...workspace }) }, workspace.id))) })), !loading && workspaces.length === 0 && (_jsx("p", { className: "text-center py-8 text-gray-600", children: "No workspaces found" }))] }));
};
