import React, { useState, useEffect } from 'react';
import { Workspace, Booking } from '../types/index.js';
import { bookingService, pricingService } from '../services/api.js';

interface BookingFormProps {
  workspace: Workspace;
  onSuccess?: (booking: Booking) => void;
  onCancel?: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ workspace, onSuccess, onCancel }) => {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('01:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [pricingDetails, setPricingDetails] = useState<any>(null);

  // Calculate price whenever dates change
  useEffect(() => {
    const calculatePrice = async () => {
      if (!startDate || !endDate || !startTime || !endTime) {
        setCalculatedPrice(null);
        setPricingDetails(null);
        return;
      }

      try {
        const start = new Date(`${startDate}T${startTime}:00Z`);
        const end = new Date(`${endDate}T${endTime}:00Z`);

        if (start >= end) {
          setCalculatedPrice(null);
          return;
        }

        const response = await pricingService.calculatePrice(workspace.id, start, end);
        setCalculatedPrice(response.data.totalPrice);
        setPricingDetails(response.data);
      } catch (err) {
        console.error('Price calculation error:', err);
      }
    };

    calculatePrice();
  }, [startDate, startTime, endDate, endTime, workspace.id]);

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (!calculatedPrice) {
        setError('Unable to calculate price');
        setLoading(false);
        return;
      }

      const response = await bookingService.create({
        workspaceId: workspace.id,
        guestId: '', // Set by backend
        startDate: start,
        endDate: end,
        totalPrice: calculatedPrice,
        status: 'pending',
      });

      onSuccess?.(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const totalPrice = calculatedPrice;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Book {workspace.name}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              min={minDate}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              min={startDate || minDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Base Hourly Rate:</span>
            <span className="font-medium">${workspace.hourlyRate.toFixed(2)}/hr</span>
          </div>

          {pricingDetails && pricingDetails.rules && pricingDetails.rules.length > 0 && (
            <div className="text-xs pt-2 border-t">
              <span className="text-gray-600 block mb-1">Dynamic Pricing Rules Applied:</span>
              {pricingDetails.rules.map((rule: any, idx: number) => (
                <div key={idx} className="text-gray-600 ml-2">
                  • {rule.dayOfWeek !== undefined ? `Weekday ${rule.dayOfWeek}` : rule.seasonType}
                  : {rule.multiplier}x multiplier
                </div>
              ))}
            </div>
          )}

          {pricingDetails && (
            <div className="text-xs pt-2 border-t">
              <span className="text-gray-600">
                Duration: {pricingDetails.hours.toFixed(1)} hours
              </span>
            </div>
          )}

          <div className="border-t pt-2 flex justify-between items-center">
            <span className="text-lg font-semibold">Total Price:</span>
            {totalPrice ? (
              <span className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
            ) : (
              <span className="text-gray-400">Select dates</span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !totalPrice}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Creating booking...' : 'Complete Booking'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
