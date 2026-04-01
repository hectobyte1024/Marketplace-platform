import React, { useEffect, useState } from 'react';
import { workspaceService } from '../services/api.js';
import { useWorkspaceStore, useUserStore } from '../stores/index.js';
import { WorkspaceCard } from '../components/WorkspaceCard.js';
import { BookingForm } from '../components/BookingForm.js';
import type { Workspace, Booking } from '../types/index.js';

export const Browse: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const response = await workspaceService.getAll();
        setWorkspaces(response.data);
      } catch (err) {
        setError('Failed to load workspaces');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation.trim()) return;

    try {
      setLoading(true);
      const response = await workspaceService.search(searchLocation);
      setWorkspaces(response.data);
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = (booking: Booking) => {
    setSelectedWorkspace(null);
    alert('Booking created successfully! The host will confirm your booking shortly.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Find Your Workspace</h1>

      <form onSubmit={handleSearch} className="mb-8 bg-gray-100 p-4 rounded-lg">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </form>

      {loading && <p className="text-center py-8">Loading workspaces...</p>}
      {error && <p className="text-center py-8 text-red-600">{error}</p>}

      {selectedWorkspace ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedWorkspace.name}</h2>
              <button
                onClick={() => setSelectedWorkspace(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  {selectedWorkspace.images && selectedWorkspace.images.length > 0 && (
                    <div className="h-48 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={selectedWorkspace.images[0]}
                        alt={selectedWorkspace.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Workspace';
                        }}
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{selectedWorkspace.location}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Capacity</p>
                      <p className="font-medium">{selectedWorkspace.capacity} people</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Rate</p>
                      <p className="font-medium">${selectedWorkspace.hourlyRate}/hour</p>
                    </div>

                    {selectedWorkspace.amenities && selectedWorkspace.amenities.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedWorkspace.amenities.map((amenity, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedWorkspace.description && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Description</p>
                        <p className="text-gray-700">{selectedWorkspace.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {!isAuthenticated ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-gray-700 mb-4">Sign in to book this workspace</p>
                    <a
                      href="/auth"
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Sign In
                    </a>
                  </div>
                ) : (
                  <BookingForm
                    workspace={selectedWorkspace}
                    onSuccess={handleBookingSuccess}
                    onCancel={() => setSelectedWorkspace(null)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => setSelectedWorkspace(workspace)}
              className="cursor-pointer hover:shadow-lg transition"
            >
              <WorkspaceCard {...workspace} />
            </div>
          ))}
        </div>
      )}

      {!loading && workspaces.length === 0 && (
        <p className="text-center py-8 text-gray-600">No workspaces found</p>
      )}
    </div>
  );
};
