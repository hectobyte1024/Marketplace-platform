export interface Workspace {
  id: string;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  hourlyRate: number;
  amenities: string[];
  images: string[];
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  workspaceId: string;
  guestId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'guest' | 'host' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingRule {
  id: string;
  workspaceId: string;
  dayOfWeek?: number;
  seasonType?: 'peak' | 'shoulder' | 'low';
  multiplier: number;
  createdAt: Date;
}

export interface Availability {
  id: string;
  workspaceId: string;
  date: Date;
  available: boolean;
  bookings: number;
  createdAt: Date;
}
