import React from 'react';
import { Booking } from '../types/index.js';

interface BookingCardProps {
  booking: Booking;
  workspaceName?: string;
  onCancel?: (bookingId: string) => void;
  onConfirm?: (bookingId: string) => void;
  isHost?: boolean;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800' },
};

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  workspaceName,
  onCancel,
  onConfirm,
  isHost = false,
}) => {
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const colors = statusColors[booking.status] || statusColors.pending;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          {workspaceName && (
            <h3 className="font-semibold text-gray-900">{workspaceName}</h3>
          )}
          <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${colors.bg} ${colors.text}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
        <span className="text-xl font-bold text-gray-900">${booking.totalPrice.toFixed(2)}</span>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <p className="text-xs text-gray-600">Start</p>
          <p className="text-sm font-medium">{formatDate(startDate)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">End</p>
          <p className="text-sm font-medium">{formatDate(endDate)}</p>
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-600">Duration: {hours.toFixed(1)} hours</p>
        </div>
      </div>

      {(onCancel || onConfirm) && (
        <div className="flex gap-2 pt-3 border-t">
          {!isHost && onCancel && booking.status === 'pending' && (
            <button
              onClick={() => onCancel(booking.id)}
              className="flex-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded transition"
            >
              Cancel Booking
            </button>
          )}
          {isHost && onConfirm && booking.status === 'pending' && (
            <button
              onClick={() => onConfirm(booking.id)}
              className="flex-1 text-sm bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded transition"
            >
              Confirm Booking
            </button>
          )}
        </div>
      )}
    </div>
  );
};
