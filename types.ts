export enum UserRole {
  ADMIN = 'ADMIN',
  RIDER = 'RIDER',
  OWNER = 'OWNER',
}

export enum VehicleType {
  AUTO = 'Auto Rickshaw',
  BIKE = 'Bike',
  CAR = 'Car',
  SUV = 'SUV'
}

export interface BaseArea {
  id: string;
  name: string;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  expiresAt: string; // ISO Date string
  isFirstTime?: boolean;
}

export interface VehicleOwner extends User {
  vehicleType: VehicleType;
  baseArea: string;
  vehicleNumber?: string;
  isAvailable: boolean;
  lat: number;
  lng: number;
}

export interface Rider extends User {
  // Rider specific fields if any
}

export interface PaymentDetails {
  orderId: string;
  amount: number;
  days: number;
}

// Service Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
