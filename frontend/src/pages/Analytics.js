import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { analyticsService } from '../services/api.js';
export const AnalyticsPage = ({ workspaceId, workspaceName, onClose }) => {
    const [timePeriod, setTimePeriod] = useState(30);
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [topHours, setTopHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchAnalytics();
    }, [workspaceId, timePeriod]);
    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [summaryRes, trendsRes, topHoursRes] = await Promise.all([
                analyticsService.getSummary(workspaceId, timePeriod),
                analyticsService.getTrends(workspaceId, timePeriod),
                analyticsService.getTopHours(workspaceId, timePeriod),
            ]);
            setSummary(summaryRes.data);
            setTrends(trendsRes.data);
            setTopHours(topHoursRes.data);
            setError(null);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to load analytics');
        }
        finally {
            setLoading(false);
        }
    };
    const formatCurrency = (value) => {
        return `$${value.toFixed(2)}`;
    };
    const getMaxTrendValue = (key) => {
        if (trends.length === 0)
            return 1;
        return Math.max(...trends.map((t) => t[key]));
    };
    const getBarHeight = (value, max) => {
        return max > 0 ? (value / max) * 200 : 0;
    };
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Analytics Dashboard" }), workspaceName && _jsx("p", { className: "text-gray-600", children: workspaceName })] }), onClose && (_jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700 text-2xl", children: "\u2715" }))] }), _jsx("div", { className: "flex gap-3 mb-6 border-b pb-4", children: [7, 30, 90].map((period) => (_jsxs("button", { onClick: () => setTimePeriod(period), className: `px-4 py-2 rounded transition ${timePeriod === period
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: ["Last ", period, " days"] }, period))) }), error && (_jsx("div", { className: "mb-6 p-4 bg-red-100 text-red-700 rounded", children: error })), loading ? (_jsx("div", { className: "text-center py-12 text-gray-500", children: "Loading analytics..." })) : summary ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [_jsxs("div", { className: "bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200", children: [_jsx("div", { className: "text-sm text-gray-600 mb-1", children: "Total Revenue" }), _jsx("div", { className: "text-3xl font-bold text-green-700", children: formatCurrency(summary.totalRevenue) }), _jsxs("div", { className: "text-xs text-gray-600 mt-2", children: ["Avg: ", formatCurrency(summary.averageBookingValue), "/booking"] })] }), _jsxs("div", { className: "bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200", children: [_jsx("div", { className: "text-sm text-gray-600 mb-1", children: "Occupancy Rate" }), _jsxs("div", { className: "text-3xl font-bold text-blue-700", children: [summary.occupancyRate.toFixed(1), "%"] }), _jsxs("div", { className: "text-xs text-gray-600 mt-2", children: [summary.bookingHours.toFixed(0), " of ", summary.totalAvailableHours, " hours"] })] }), _jsxs("div", { className: "bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200", children: [_jsx("div", { className: "text-sm text-gray-600 mb-1", children: "Total Bookings" }), _jsx("div", { className: "text-3xl font-bold text-purple-700", children: summary.totalBookings }), _jsxs("div", { className: "text-xs text-gray-600 mt-2", children: [summary.confirmedBookings, " confirmed, ", summary.cancelledBookings, " cancelled"] })] }), _jsxs("div", { className: "bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200", children: [_jsx("div", { className: "text-sm text-gray-600 mb-1", children: "Confirmed Rate" }), _jsxs("div", { className: "text-3xl font-bold text-orange-700", children: [summary.totalBookings > 0
                                                ? ((summary.confirmedBookings / summary.totalBookings) * 100).toFixed(0)
                                                : 0, "%"] }), _jsx("div", { className: "text-xs text-gray-600 mt-2", children: "of all bookings" })] })] }), trends.length > 0 && (_jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Revenue Trend" }), _jsx("div", { className: "bg-gray-50 rounded-lg p-6 overflow-x-auto", children: _jsx("div", { className: "flex items-end justify-between gap-1 min-w-full", style: { minHeight: '250px' }, children: trends.map((trend, idx) => {
                                        const height = getBarHeight(trend.revenue, getMaxTrendValue('revenue'));
                                        const date = new Date(trend.date);
                                        return (_jsxs("div", { className: "flex-1 flex flex-col items-center gap-2", children: [_jsx("div", { className: "w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition hover:from-blue-600 hover:to-blue-500 cursor-pointer group relative", style: { height: `${height}px`, minHeight: '4px' }, title: `${trend.date}: ${formatCurrency(trend.revenue)}`, children: _jsx("div", { className: "absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition pointer-events-none", children: formatCurrency(trend.revenue) }) }), _jsx("div", { className: "text-xs text-gray-600 w-full text-center truncate", children: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })] }, idx));
                                    }) }) })] })), trends.length > 0 && (_jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Occupancy Trend" }), _jsx("div", { className: "bg-gray-50 rounded-lg p-6 overflow-x-auto", children: _jsx("div", { className: "flex items-end justify-between gap-1 min-w-full", style: { minHeight: '250px' }, children: trends.map((trend, idx) => {
                                        const height = getBarHeight(trend.occupancyPercent, 100);
                                        const date = new Date(trend.date);
                                        return (_jsxs("div", { className: "flex-1 flex flex-col items-center gap-2", children: [_jsx("div", { className: "w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition hover:from-green-600 hover:to-green-500 cursor-pointer group relative", style: { height: `${height}px`, minHeight: '4px' }, title: `${trend.date}: ${trend.occupancyPercent.toFixed(1)}%`, children: _jsxs("div", { className: "absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition pointer-events-none", children: [trend.occupancyPercent.toFixed(1), "%"] }) }), _jsx("div", { className: "text-xs text-gray-600 w-full text-center truncate", children: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })] }, idx));
                                    }) }) })] })), topHours.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Peak Booking Hours" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: topHours.map((hour, idx) => (_jsxs("div", { className: "bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200", children: [_jsxs("div", { className: "text-sm text-gray-600 mb-1", children: [String(hour.hour).padStart(2, '0'), ":00"] }), _jsx("div", { className: "text-2xl font-bold text-indigo-700 mb-2", children: hour.bookings }), _jsxs("div", { className: "text-xs text-gray-600", children: ["Revenue: ", formatCurrency(hour.revenue)] })] }, idx))) })] }))] })) : null] }));
};
