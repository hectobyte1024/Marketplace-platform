import React, { useEffect, useState } from 'react';
import { Booking, Workspace } from '../types/index.js';
import { bookingService, workspaceService } from '../services/api.js';
import { BookingCard } from '../components/BookingCard.js';

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workspaces, setWorkspaces] = useState<Map<string, Workspace>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.data);

      // Fetch workspace details for all bookings
      const workspaceMap = new Map<string, Workspace>();
      for (const booking of response.data) {
        if (!workspaceMap.has(booking.workspaceId)) {
          try {
            const wsResponse = await workspaceService.getById(booking.workspaceId);
            workspaceMap.set(booking.workspaceId, wsResponse.data);
          } catch (err) {
            console.error('Failed to fetch workspace:', booking.workspaceId);
          }
        }
      }
      setWorkspaces(workspaceMap);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingService.updateStatus(bookingId, 'cancelled');
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-boldmb-8">My Bookings</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-2 text-gray-600">Loading bookings...</p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex gap-2 flex-wrap">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-2 text-xs">
                    ({bookings.filter(b => b.status === status).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                {bookings.length === 0 ? 'You have no bookings yet.' : 'No bookings match this filter.'}
              </p>
              {bookings.length === 0 && (
                <a
                  href="/workspaces"
                  className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
                >
                  Browse Workspaces →
                </a>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  workspaceName={workspaces.get(booking.workspaceId)?.name}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
