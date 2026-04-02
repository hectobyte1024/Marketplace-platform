import React, { useEffect, useState } from 'react';
import { availabilityService } from '../services/api.js';
import type { AvailabilitySlot } from '../types/index.js';

export interface AvailabilityCalendarProps {
  workspaceId: string;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ workspaceId }) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load availability slots');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create availability slot');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await availabilityService.deleteSlot(slotId);
      setSlots(slots.filter((s) => s.id !== slotId));
      setDeleteConfirm(null);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete availability slot');
    }
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSlotLabel = (slot: AvailabilitySlot) => {
    if (slot.isAvailable) {
      return 'Available';
    } else {
      return 'Blocked';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Manage Availability</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {showForm ? 'Cancel' : 'Add Slot'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAddSlot} className="mb-6 p-4 bg-gray-50 rounded border">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.isAvailable ? 'available' : 'blocked'}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.value === 'available' })
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="available">Available</option>
                <option value="blocked">Blocked (Unavailable)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recurring Pattern</label>
              <select
                value={formData.recurringPattern}
                onChange={(e) => setFormData({ ...formData, recurringPattern: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">None (One-time)</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-gray-600 mb-4">
            <p>
              {formData.isAvailable
                ? '✓ This period will be available for booking'
                : '✗ This period will be blocked/unavailable'}
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Slot'}
          </button>
        </form>
      )}

      {loading && !showForm && (
        <div className="text-center py-8 text-gray-500">Loading slots...</div>
      )}

      {!loading && slots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No availability slots yet. Add one to get started.</p>
        </div>
      )}

      {slots.length > 0 && (
        <div className="space-y-2">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`p-3 rounded border-l-4 flex justify-between items-center ${
                slot.isAvailable
                  ? 'border-l-green-500 bg-green-50'
                  : 'border-l-red-500 bg-red-50'
              }`}
            >
              <div className="flex-1">
                <div className="font-medium">
                  {formatSlotLabel(slot)}
                  {slot.recurringPattern && (
                    <span className="text-xs ml-2 text-gray-600">
                      ({slot.recurringPattern})
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {formatDateTime(slot.startDate)} → {formatDateTime(slot.endDate)}
                </div>
              </div>
              {deleteConfirm === slot.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="bg-gray-400 text-white text-xs px-2 py-1 rounded hover:bg-gray-500"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(slot.id)}
                  className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
