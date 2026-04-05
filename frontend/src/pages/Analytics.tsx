import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/api.js';
import type { AnalyticsSummary, AnalyticsTrend, MonthlyRevenue, TopHour } from '../types/index.js';

interface AnalyticsPageProps {
  workspaceId: string;
  workspaceName?: string;
  onClose?: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ workspaceId, workspaceName, onClose }) => {
  const [timePeriod, setTimePeriod] = useState<7 | 30 | 90>(30);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrend[]>([]);
  const [topHours, setTopHours] = useState<TopHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const getMaxTrendValue = (key: 'revenue' | 'occupancyPercent' | 'bookings') => {
    if (trends.length === 0) return 1;
    return Math.max(...trends.map((t) => t[key]));
  };

  const getBarHeight = (value: number, max: number) => {
    return max > 0 ? (value / max) * 200 : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          {workspaceName && <p className="text-gray-600">{workspaceName}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-3 mb-6 border-b pb-4">
        {([7, 30, 90] as const).map((period) => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={`px-4 py-2 rounded transition ${
              timePeriod === period
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last {period} days
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading analytics...</div>
      ) : summary ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Revenue Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-green-700">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Avg: {formatCurrency(summary.averageBookingValue)}/booking
              </div>
            </div>

            {/* Occupancy Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Occupancy Rate</div>
              <div className="text-3xl font-bold text-blue-700">
                {summary.occupancyRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {summary.bookingHours.toFixed(0)} of {summary.totalAvailableHours} hours
              </div>
            </div>

            {/* Bookings Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
              <div className="text-3xl font-bold text-purple-700">
                {summary.totalBookings}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {summary.confirmedBookings} confirmed, {summary.cancelledBookings} cancelled
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <div className="text-sm text-gray-600 mb-1">Confirmed Rate</div>
              <div className="text-3xl font-bold text-orange-700">
                {summary.totalBookings > 0
                  ? ((summary.confirmedBookings / summary.totalBookings) * 100).toFixed(0)
                  : 0}
                %
              </div>
              <div className="text-xs text-gray-600 mt-2">
                of all bookings
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          {trends.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
              <div className="bg-gray-50 rounded-lg p-6 overflow-x-auto">
                <div className="flex items-end justify-between gap-1 min-w-full" style={{ minHeight: '250px' }}>
                  {trends.map((trend, idx) => {
                    const height = getBarHeight(
                      trend.revenue,
                      getMaxTrendValue('revenue')
                    );
                    const date = new Date(trend.date);
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition hover:from-blue-600 hover:to-blue-500 cursor-pointer group relative"
                          style={{ height: `${height}px`, minHeight: '4px' }}
                          title={`${trend.date}: ${formatCurrency(trend.revenue)}`}
                        >
                          <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition pointer-events-none">
                            {formatCurrency(trend.revenue)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 w-full text-center truncate">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Occupancy Trend Chart */}
          {trends.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Occupancy Trend</h3>
              <div className="bg-gray-50 rounded-lg p-6 overflow-x-auto">
                <div className="flex items-end justify-between gap-1 min-w-full" style={{ minHeight: '250px' }}>
                  {trends.map((trend, idx) => {
                    const height = getBarHeight(
                      trend.occupancyPercent,
                      100
                    );
                    const date = new Date(trend.date);
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition hover:from-green-600 hover:to-green-500 cursor-pointer group relative"
                          style={{ height: `${height}px`, minHeight: '4px' }}
                          title={`${trend.date}: ${trend.occupancyPercent.toFixed(1)}%`}
                        >
                          <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition pointer-events-none">
                            {trend.occupancyPercent.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 w-full text-center truncate">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Top Hours */}
          {topHours.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Peak Booking Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topHours.map((hour, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200"
                  >
                    <div className="text-sm text-gray-600 mb-1">
                      {String(hour.hour).padStart(2, '0')}:00
                    </div>
                    <div className="text-2xl font-bold text-indigo-700 mb-2">
                      {hour.bookings}
                    </div>
                    <div className="text-xs text-gray-600">
                      Revenue: {formatCurrency(hour.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
