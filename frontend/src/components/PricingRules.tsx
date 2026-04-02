import React, { useEffect, useState } from 'react';
import { pricingService, PricingRule } from '../services/api.js';

interface PricingRulesProps {
  workspaceId: string;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const seasons = [
  { value: 'peak', label: 'Peak Season (Summer)' },
  { value: 'shoulder', label: 'Shoulder Season (Spring/Fall)' },
  { value: 'low', label: 'Low Season (Winter)' },
];

export const PricingRules: React.FC<PricingRulesProps> = ({ workspaceId }) => {
  const [rules, setRules] = useState<PricingRule[]>([]);
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const newRule = {
        workspaceId,
        dayOfWeek: formData.dayOfWeek ? parseInt(formData.dayOfWeek) : undefined,
        seasonType: formData.seasonType ? (formData.seasonType as any) : undefined,
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add pricing rule');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Delete this pricing rule?')) return;

    try {
      await pricingService.deleteRule(id);
      setRules(rules.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete rule');
    }
  };

  const getRuleLabel = (rule: PricingRule) => {
    if (rule.dayOfWeek !== undefined) {
      return `${daysOfWeek[rule.dayOfWeek]} - ${rule.multiplier}x`;
    }
    const season = seasons.find((s) => s.value === rule.seasonType);
    return `${season?.label} - ${rule.multiplier}x`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Dynamic Pricing Rules</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : 'Add Rule'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAddRule} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week (Optional)
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value, seasonType: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a day</option>
                {daysOfWeek.map((day, idx) => (
                  <option key={idx} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season (Optional)
              </label>
              <select
                value={formData.seasonType}
                onChange={(e) => setFormData({ ...formData, seasonType: e.target.value, dayOfWeek: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a season</option>
                {seasons.map((season) => (
                  <option key={season.value} value={season.value}>
                    {season.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Multiplier (1.0 = base price)
            </label>
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={formData.multiplier}
              onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              Examples: 1.5 = 50% more expensive, 0.8 = 20% cheaper
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Add Pricing Rule
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-2 text-gray-600">Loading pricing rules...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No pricing rules set. All bookings will use the base hourly rate.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div>
                <span className="font-medium text-gray-900">{getRuleLabel(rule)}</span>
              </div>
              <button
                onClick={() => handleDeleteRule(rule.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">How it works:</span> Set pricing multipliers for specific days of the week or seasons.
          When guests book, the price will automatically be adjusted. For example, set 1.5x for Fridays and Saturdays to charge
          50% more on weekends, or 0.8x for winter to attract off-season bookings.
        </p>
      </div>
    </div>
  );
};
