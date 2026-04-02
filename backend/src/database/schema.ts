import { query } from './connection.js';

const initSchema = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'guest',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS workspaces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      location VARCHAR(255) NOT NULL,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      capacity INTEGER NOT NULL,
      hourly_rate DECIMAL(10, 2) NOT NULL,
      amenities JSONB DEFAULT '[]',
      images JSONB DEFAULT '[]',
      owner_id UUID NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces(id),
      guest_id UUID NOT NULL REFERENCES users(id),
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS pricing_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces(id),
      day_of_week INTEGER,
      season_type VARCHAR(50),
      multiplier DECIMAL(5, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS availability (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces(id),
      date DATE NOT NULL,
      available BOOLEAN DEFAULT true,
      bookings INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(workspace_id, date)
    )`,

    `CREATE TABLE IF NOT EXISTS availability_slots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces(id),
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      is_available BOOLEAN NOT NULL DEFAULT true,
      recurring_pattern VARCHAR(50),
      recurring_count INTEGER,
      created_by UUID NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id)`,
    `CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id)`,
    `CREATE INDEX IF NOT EXISTS idx_bookings_workspace ON bookings(workspace_id)`,
    `CREATE INDEX IF NOT EXISTS idx_availability_workspace ON availability(workspace_id)`,
    `CREATE INDEX IF NOT EXISTS idx_availability_slots_workspace ON availability_slots(workspace_id)`,
    `CREATE INDEX IF NOT EXISTS idx_availability_slots_dates ON availability_slots(start_date, end_date)`,
  ];

  for (const sql of queries) {
    try {
      await query(sql);
      console.log('✓ Schema initialized');
    } catch (error) {
      console.error('Schema initialization error:', error);
    }
  }
};

export default initSchema;
