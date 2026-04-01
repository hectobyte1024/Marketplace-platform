import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-800' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800' },
};
export const BookingCard = ({ booking, workspaceName, onCancel, onConfirm, isHost = false, }) => {
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const colors = statusColors[booking.status] || statusColors.pending;
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { children: [workspaceName && (_jsx("h3", { className: "font-semibold text-gray-900", children: workspaceName })), _jsx("span", { className: `inline-block px-2 py-1 rounded text-sm font-medium ${colors.bg} ${colors.text}`, children: booking.status.charAt(0).toUpperCase() + booking.status.slice(1) })] }), _jsxs("span", { className: "text-xl font-bold text-gray-900", children: ["$", booking.totalPrice.toFixed(2)] })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-600", children: "Start" }), _jsx("p", { className: "text-sm font-medium", children: formatDate(startDate) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-600", children: "End" }), _jsx("p", { className: "text-sm font-medium", children: formatDate(endDate) })] }), _jsx("div", { className: "pt-2 border-t", children: _jsxs("p", { className: "text-xs text-gray-600", children: ["Duration: ", hours.toFixed(1), " hours"] }) })] }), (onCancel || onConfirm) && (_jsxs("div", { className: "flex gap-2 pt-3 border-t", children: [!isHost && onCancel && booking.status === 'pending' && (_jsx("button", { onClick: () => onCancel(booking.id), className: "flex-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded transition", children: "Cancel Booking" })), isHost && onConfirm && booking.status === 'pending' && (_jsx("button", { onClick: () => onConfirm(booking.id), className: "flex-1 text-sm bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded transition", children: "Confirm Booking" }))] }))] }));
};
