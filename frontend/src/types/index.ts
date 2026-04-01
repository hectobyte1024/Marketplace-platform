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
