import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { pricingService } from '../services/api.js';
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const seasons = [
    { value: 'peak', label: 'Peak Season (Summer)' },
    { value: 'shoulder', label: 'Shoulder Season (Spring/Fall)' },
    { value: 'low', label: 'Low Season (Winter)' },
];
export const PricingRules = ({ workspaceId }) => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        dayOfWeek: '',
        seasonType: '',
        multiplier: '1.0',
    });
    useEffect(() => {
        fetchRules();
    }, [workspaceId]);
    const fetchRules = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await pricingService.getRules(workspaceId);
            setRules(response.data);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to load pricing rules');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddRule = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const newRule = {
                workspaceId,
                dayOfWeek: formData.dayOfWeek ? parseInt(formData.dayOfWeek) : undefined,
                seasonType: formData.seasonType ? formData.seasonType : undefined,
                multiplier: parseFloat(formData.multiplier),
            };
            if (!newRule.dayOfWeek && !newRule.seasonType) {
                setError('Please select either a day of week or season');
                return;
            }
            const response = await pricingService.createRule(workspaceId, newRule);
            setRules([...rules, response.data]);
            setFormData({ dayOfWeek: '', seasonType: '', multiplier: '1.0' });
            setShowForm(false);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to add pricing rule');
        }
    };
    const handleDeleteRule = async (id) => {
        if (!window.confirm('Delete this pricing rule?'))
            return;
        try {
            await pricingService.deleteRule(id);
            setRules(rules.filter((r) => r.id !== id));
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to delete rule');
        }
    };
    const getRuleLabel = (rule) => {
        if (rule.dayOfWeek !== undefined) {
            return `${daysOfWeek[rule.dayOfWeek]} - ${rule.multiplier}x`;
        }
        const season = seasons.find((s) => s.value === rule.seasonType);
        return `${season?.label} - ${rule.multiplier}x`;
    };
    return (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h3", { className: "text-xl font-semibold", children: "Dynamic Pricing Rules" }), _jsx("button", { onClick: () => setShowForm(!showForm), className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition", children: showForm ? 'Cancel' : 'Add Rule' })] }), error && (_jsx("div", { className: "mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: error })), showForm && (_jsxs("form", { onSubmit: handleAddRule, className: "mb-6 p-4 bg-gray-50 rounded-lg space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Day of Week (Optional)" }), _jsxs("select", { value: formData.dayOfWeek, onChange: (e) => setFormData({ ...formData, dayOfWeek: e.target.value, seasonType: '' }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select a day" }), daysOfWeek.map((day, idx) => (_jsx("option", { value: idx, children: day }, idx)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Season (Optional)" }), _jsxs("select", { value: formData.seasonType, onChange: (e) => setFormData({ ...formData, seasonType: e.target.value, dayOfWeek: '' }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select a season" }), seasons.map((season) => (_jsx("option", { value: season.value, children: season.label }, season.value)))] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Price Multiplier (1.0 = base price)" }), _jsx("input", { type: "number", min: "0.1", max: "10", step: "0.1", value: formData.multiplier, onChange: (e) => setFormData({ ...formData, multiplier: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Examples: 1.5 = 50% more expensive, 0.8 = 20% cheaper" })] }), _jsx("button", { type: "submit", className: "w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition", children: "Add Pricing Rule" })] })), loading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "inline-block", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }), _jsx("p", { className: "mt-2 text-gray-600", children: "Loading pricing rules..." })] })) : rules.length === 0 ? (_jsx("div", { className: "text-center py-8 bg-gray-50 rounded-lg", children: _jsx("p", { className: "text-gray-600", children: "No pricing rules set. All bookings will use the base hourly rate." }) })) : (_jsx("div", { className: "space-y-2", children: rules.map((rule) => (_jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition", children: [_jsx("div", { children: _jsx("span", { className: "font-medium text-gray-900", children: getRuleLabel(rule) }) }), _jsx("button", { onClick: () => handleDeleteRule(rule.id), className: "text-red-600 hover:text-red-800 text-sm font-medium transition", children: "Delete" })] }, rule.id))) })), _jsx("div", { className: "mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200", children: _jsxs("p", { className: "text-sm text-blue-900", children: [_jsx("span", { className: "font-semibold", children: "How it works:" }), " Set pricing multipliers for specific days of the week or seasons. When guests book, the price will automatically be adjusted. For example, set 1.5x for Fridays and Saturdays to charge 50% more on weekends, or 0.8x for winter to attract off-season bookings."] }) })] }));
};
