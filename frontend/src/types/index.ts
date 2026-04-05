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
  role: 'guest' | 'host' | 'admin';
  createdAt: Date;
}

export interface AvailabilitySlot {
  id: string;
  workspaceId: string;
  startDate: Date | string;
  endDate: Date | string;
  isAvailable: boolean;
  recurringPattern?: string;
  recurringCount?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

export interface TopHour {
  hour: number;
  bookings: number;
  revenue: number;
}
