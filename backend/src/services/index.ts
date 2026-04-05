import { query } from '../database/connection.js';
import type { Workspace, Booking, User } from '../types/index.js';

// Import query at module level for DELETE
const deleteQuery = query;

export interface PricingRule {
  id: string;
  workspaceId: string;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  seasonType?: 'peak' | 'shoulder' | 'low';
  multiplier: number;
  createdAt: Date;
}

export class WorkspaceService {
  async getAll() {
    const result = await query('SELECT * FROM workspaces ORDER BY created_at DESC');
    return result.rows;
  }

  async getById(id: string) {
    const result = await query('SELECT * FROM workspaces WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getByLocation(location: string, radius: number = 10) {
    const result = await query(
      `SELECT * FROM workspaces WHERE location ILIKE $1 ORDER BY created_at DESC`,
      [`%${location}%`]
    );
    return result.rows;
  }

  async create(workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) {
    const result = await query(
      `INSERT INTO workspaces 
        (name, description, location, latitude, longitude, capacity, hourly_rate, amenities, images, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        workspace.name,
        workspace.description,
        workspace.location,
        workspace.latitude,
        workspace.longitude,
        workspace.capacity,
        workspace.hourlyRate,
        JSON.stringify(workspace.amenities),
        JSON.stringify(workspace.images),
        workspace.ownerId,
      ]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<Workspace>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE workspaces SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id: string) {
    const result = await query('DELETE FROM workspaces WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export class BookingService {
  async getById(id: string) {
    const result = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getByWorkspace(workspaceId: string) {
    const result = await query(
      'SELECT * FROM bookings WHERE workspace_id = $1 ORDER BY start_date',
      [workspaceId]
    );
    return result.rows;
  }

  async getByGuest(guestId: string) {
    const result = await query(
      'SELECT * FROM bookings WHERE guest_id = $1 ORDER BY start_date DESC',
      [guestId]
    );
    return result.rows;
  }

  async create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) {
    const result = await query(
      `INSERT INTO bookings 
        (workspace_id, guest_id, start_date, end_date, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        booking.workspaceId,
        booking.guestId,
        booking.startDate,
        booking.endDate,
        booking.totalPrice,
        booking.status,
      ]
    );
    return result.rows[0];
  }

  async updateStatus(id: string, status: Booking['status']) {
    const result = await query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
}

export class UserService {
  async getById(id: string) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getByEmail(email: string) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const result = await query(
      `INSERT INTO users (email, name, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at, updated_at`,
      [user.email, user.name, user.passwordHash, user.role]
    );
    return result.rows[0];
  }
}

export class PricingService {
  async getByWorkspace(workspaceId: string) {
    const result = await query(
      'SELECT * FROM pricing_rules WHERE workspace_id = $1 ORDER BY day_of_week, season_type',
      [workspaceId]
    );
    return result.rows;
  }

  async create(rule: Omit<PricingRule, 'id' | 'createdAt'>) {
    const result = await query(
      `INSERT INTO pricing_rules (workspace_id, day_of_week, season_type, multiplier)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [rule.workspaceId, rule.dayOfWeek, rule.seasonType, rule.multiplier]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<PricingRule>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'workspaceId') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE pricing_rules SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id: string) {
    const result = await query('DELETE FROM pricing_rules WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Calculate dynamic price based on rules
  calculatePrice(baseRate: number, rules: PricingRule[], startDate: Date): number {
    let multiplier = 1;

    // Check day of week
    const dayOfWeek = startDate.getDay();
    const dayRule = rules.find((r) => r.dayOfWeek === dayOfWeek && !r.seasonType);
    if (dayRule) {
      multiplier *= dayRule.multiplier;
    }

    // Check season (simplified - based on month)
    const month = startDate.getMonth();
    let season: 'peak' | 'shoulder' | 'low';
    if ([6, 7].includes(month)) {
      // July, August = peak
      season = 'peak';
    } else if ([0, 11, 5, 12].includes(month)) {
      // Jan, Dec, Jun, May = shoulder
      season = 'shoulder';
    } else {
      season = 'low';
    }

    const seasonRule = rules.find((r) => r.seasonType === season && r.dayOfWeek === undefined);
    if (seasonRule) {
      multiplier *= seasonRule.multiplier;
    }

    return Math.round(baseRate * multiplier * 100) / 100;
  }
}

export interface AvailabilitySlot {
  id: string;
  workspaceId: string;
  startDate: Date;
  endDate: Date;
  isAvailable: boolean;
  recurringPattern?: string; // 'daily', 'weekly', 'monthly'
  recurringCount?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AvailabilityService {
  async getByWorkspace(workspaceId: string) {
    const result = await query(
      `SELECT * FROM availability_slots 
       WHERE workspace_id = $1 
       ORDER BY start_date ASC`,
      [workspaceId]
    );
    return result.rows;
  }

  async checkAvailability(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    // Check if there are any overlapping unavailable slots
    const result = await query(
      `SELECT COUNT(*) as count FROM availability_slots 
       WHERE workspace_id = $1 
       AND is_available = false 
       AND (start_date, end_date) OVERLAPS ($2::timestamp, $3::timestamp)`,
      [workspaceId, startDate, endDate]
    );

    const unavailableCount = parseInt(result.rows[0]?.count ?? 0);
    
    // Also check for overlapping bookings
    const bookingResult = await query(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE workspace_id = $1 
       AND status IN ('confirmed', 'pending')
       AND (start_date, end_date) OVERLAPS ($2::timestamp, $3::timestamp)`,
      [workspaceId, startDate, endDate]
    );

    const bookingCount = parseInt(bookingResult.rows[0]?.count ?? 0);
    
    return unavailableCount === 0 && bookingCount === 0;
  }

  async create(slot: Omit<AvailabilitySlot, 'id' | 'createdAt' | 'updatedAt'>) {
    const result = await query(
      `INSERT INTO availability_slots 
        (workspace_id, start_date, end_date, is_available, recurring_pattern, recurring_count, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        slot.workspaceId,
        slot.startDate,
        slot.endDate,
        slot.isAvailable,
        slot.recurringPattern || null,
        slot.recurringCount || null,
        slot.createdBy,
      ]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<AvailabilitySlot>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.startDate !== undefined) {
      fields.push(`start_date = $${paramIndex++}`);
      values.push(updates.startDate);
    }
    if (updates.endDate !== undefined) {
      fields.push(`end_date = $${paramIndex++}`);
      values.push(updates.endDate);
    }
    if (updates.isAvailable !== undefined) {
      fields.push(`is_available = $${paramIndex++}`);
      values.push(updates.isAvailable);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE availability_slots 
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  async delete(id: string) {
    const result = await query('DELETE FROM availability_slots WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getAvailableSlots(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilitySlot[]> {
    const result = await query(
      `SELECT * FROM availability_slots 
       WHERE workspace_id = $1 
       AND is_available = true
       AND start_date >= $2 
       AND end_date <= $3
       ORDER BY start_date ASC`,
      [workspaceId, startDate, endDate]
    );
    return result.rows;
  }
}

export interface AnalyticsSummary {
  totalRevenue: number;
  averageBookingValue: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  occupancyRate: number;
  bookingHours: number;
  totalAvailableHours: number;
}

export interface AnalyticsTrend {
  date: string;
  revenue: number;
  bookings: number;
  occupancyPercent: number;
}

export class AnalyticsService {
  async getSummary(workspaceId: string, days: number = 30): Promise<AnalyticsSummary> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get revenue and booking stats
    const bookingResult = await query(
      `SELECT 
        SUM(total_price) as total_revenue,
        AVG(total_price) as avg_price,
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(EXTRACT(EPOCH FROM (end_date - start_date)) / 3600) as booking_hours
       FROM bookings 
       WHERE workspace_id = $1 
       AND created_at >= $2 
       AND status IN ('confirmed', 'cancelled', 'completed')`,
      [workspaceId, startDate]
    );

    const bookingData = bookingResult.rows[0];

    // Get workspace details for available hours calculation
    const workspaceResult = await query(
      'SELECT hourly_rate FROM workspaces WHERE id = $1',
      [workspaceId]
    );
    const workspace = workspaceResult.rows[0];

    // Calculate total available hours in the period
    const totalDays = days;
    const totalAvailableHours = totalDays * 24;

    const totalRevenue = parseFloat(bookingData.total_revenue) || 0;
    const bookingHours = parseFloat(bookingData.booking_hours) || 0;
    const occupancyRate = totalAvailableHours > 0 ? (bookingHours / totalAvailableHours) * 100 : 0;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageBookingValue: parseFloat(bookingData.avg_price) || 0,
      totalBookings: parseInt(bookingData.total_bookings) || 0,
      confirmedBookings: parseInt(bookingData.confirmed) || 0,
      cancelledBookings: parseInt(bookingData.cancelled) || 0,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      bookingHours: Math.round(bookingHours * 100) / 100,
      totalAvailableHours,
    };
  }

  async getTrends(workspaceId: string, days: number = 30): Promise<AnalyticsTrend[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await query(
      `SELECT 
        DATE(start_date) as date,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_price ELSE 0 END) as revenue,
        COUNT(CASE WHEN status IN ('confirmed', 'completed') THEN 1 END) as bookings,
        SUM(EXTRACT(EPOCH FROM (end_date - start_date)) / 3600) as booking_hours
       FROM bookings 
       WHERE workspace_id = $1 
       AND start_date >= $2
       GROUP BY DATE(start_date)
       ORDER BY DATE(start_date) ASC`,
      [workspaceId, startDate]
    );

    // Calculate occupancy percent for each day
    const trends = result.rows.map((row: any) => ({
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
      revenue: Math.round(parseFloat(row.revenue) || 0 * 100) / 100,
      bookings: parseInt(row.bookings) || 0,
      occupancyPercent: Math.round((parseFloat(row.booking_hours) || 0 / 24) * 100 * 100) / 100,
    }));

    return trends;
  }

  async getMonthlyRevenue(workspaceId: string, months: number = 6): Promise<any[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const result = await query(
      `SELECT 
        DATE_TRUNC('month', start_date)::DATE as month,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_price ELSE 0 END) as revenue,
        COUNT(CASE WHEN status IN ('confirmed', 'completed') THEN 1 END) as bookings
       FROM bookings 
       WHERE workspace_id = $1 
       AND start_date >= $2
       GROUP BY DATE_TRUNC('month', start_date)
       ORDER BY DATE_TRUNC('month', start_date) DESC`,
      [workspaceId, startDate]
    );

    return result.rows.map((row: any) => ({
      month: row.month ? new Date(row.month).toISOString().split('T')[0] : '',
      revenue: Math.round(parseFloat(row.revenue) || 0 * 100) / 100,
      bookings: parseInt(row.bookings) || 0,
    }));
  }

  async getTopHours(workspaceId: string, days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await query(
      `SELECT 
        EXTRACT(HOUR FROM start_date) as hour,
        COUNT(*) as bookings,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_price ELSE 0 END) as revenue
       FROM bookings 
       WHERE workspace_id = $1 
       AND start_date >= $2
       AND status IN ('confirmed', 'completed')
       GROUP BY EXTRACT(HOUR FROM start_date)
       ORDER BY bookings DESC
       LIMIT 5`,
      [workspaceId, startDate]
    );

    return result.rows.map((row: any) => ({
      hour: parseInt(row.hour) || 0,
      bookings: parseInt(row.bookings) || 0,
      revenue: Math.round(parseFloat(row.revenue) || 0 * 100) / 100,
    }));
  }
}
