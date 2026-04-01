import { query } from '../database/connection.js';
import type { Workspace, Booking, User } from '../types/index.js';

// Import query at module level for DELETE
const deleteQuery = query;

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
