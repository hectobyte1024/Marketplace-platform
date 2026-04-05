import React, { useEffect, useState } from 'react';
import { workspaceService } from '../services/api.js';
import { WorkspaceForm } from '../components/WorkspaceForm.js';
import { PricingRules } from '../components/PricingRules.js';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar.js';
import { AnalyticsPage } from './Analytics.js';
import type { Workspace } from '../types/index.js';

export const MyWorkspaces: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPricingId, setShowPricingId] = useState<string | null>(null);
  const [showAvailabilityId, setShowAvailabilityId] = useState<string | null>(null);
  const [showAnalyticsId, setShowAnalyticsId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await workspaceService.getMyWorkspaces();
      setWorkspaces(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await workspaceService.delete(id);
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete workspace');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingWorkspace(null);
    fetchWorkspaces();
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <WorkspaceForm
          workspace={editingWorkspace || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingWorkspace(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Workspaces</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Workspace
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading && <p className="text-center py-8">Loading workspaces...</p>}

        {!loading && workspaces.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">You haven't created any workspaces yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Workspace
            </button>
          </div>
        )}

        {!loading && workspaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {workspace.images && workspace.images.length > 0 && (
                  <img
                    src={workspace.images[0]}
                    alt={workspace.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{workspace.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{workspace.location}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {workspace.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Capacity:</span>
                      <p className="font-medium">{workspace.capacity} people</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Rate:</span>
                      <p className="font-medium">${workspace.hourlyRate}/hr</p>
                    </div>
                  </div>

                  {workspace.amenities && workspace.amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {workspace.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                        {workspace.amenities.length > 3 && (
                          <span className="text-xs text-gray-500">+{workspace.amenities.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button
                      onClick={() => {
                        setEditingWorkspace(workspace);
                        setShowForm(true);
                      }}
                      className="flex-1 min-w-20 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowPricingId(showPricingId === workspace.id ? null : workspace.id)}
                      className={`flex-1 min-w-24 ${showPricingId === workspace.id ? 'bg-purple-600' : 'bg-purple-500'} text-white py-2 rounded hover:bg-purple-600 text-sm`}
                    >
                      Pricing
                    </button>
                    <button
                      onClick={() => setShowAvailabilityId(showAvailabilityId === workspace.id ? null : workspace.id)}
                      className={`flex-1 min-w-24 ${showAvailabilityId === workspace.id ? 'bg-orange-600' : 'bg-orange-500'} text-white py-2 rounded hover:bg-orange-600 text-sm`}
                    >
                      Availability
                    </button>
                    <button
                      onClick={() => setShowAnalyticsId(showAnalyticsId === workspace.id ? null : workspace.id)}
                      className={`flex-1 min-w-24 ${showAnalyticsId === workspace.id ? 'bg-teal-600' : 'bg-teal-500'} text-white py-2 rounded hover:bg-teal-600 text-sm`}
                    >
                      Analytics
                    </button>
                  </div>

                  {/* Delete button on second row */}
                  <div className="flex gap-2 mb-4">
                    {deleteConfirm === workspace.id ? (
                      <div className="flex-1 bg-red-100 rounded p-2 text-center">
                        <p className="text-xs mb-1 font-medium">Delete workspace?</p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(workspace.id)}
                            className="flex-1 bg-red-600 text-white text-xs py-1 rounded hover:bg-red-700"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 bg-gray-400 text-white text-xs py-1 rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(workspace.id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 text-sm"
                      >
                        Delete Workspace
                      </button>
                    )}
                  </div>

                  {showPricingId === workspace.id && (
                    <div className="border-t pt-4 mt-4">
                      <PricingRules workspaceId={workspace.id} />
                    </div>
                  )}

                  {showAvailabilityId === workspace.id && (
                    <div className="border-t pt-4 mt-4">
                      <AvailabilityCalendar workspaceId={workspace.id} />
                    </div>
                  )}

                  {showAnalyticsId === workspace.id && (
                    <div className="border-t pt-4 mt-4">
                      <AnalyticsPage
                        workspaceId={workspace.id}
                        workspaceName={workspace.name}
                        onClose={() => setShowAnalyticsId(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
