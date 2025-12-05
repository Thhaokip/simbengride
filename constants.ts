import { VehicleType } from "./types";

export const APP_NAME = "SimbengRide";
export const CURRENCY_SYMBOL = "₹";
export const SUBSCRIPTION_COST = 100;
export const SUBSCRIPTION_DAYS = 100;

// Google Apps Script Web App URL
export const API_BASE_URL = "https://script.google.com/macros/s/AKfycbwjz0bgr9yRlYNa23kjE2vEIoes3I3Tf2UO6l-sPr5supzl7S6N3epvD0LA1V0ctauz/exec";

// Mock Coordinates for "Live" map (Centered roughly on a generic city center)
export const DEFAULT_LAT = 12.9716;
export const DEFAULT_LNG = 77.5946;

export const VEHICLE_IMAGES: Record<VehicleType, string> = {
  [VehicleType.AUTO]: "https://images.unsplash.com/photo-1597328290883-50c5787b7c7e?auto=format&fit=crop&q=80&w=200&h=150",
  [VehicleType.BIKE]: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=200&h=150",
  [VehicleType.CAR]: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=200&h=150",
  [VehicleType.SUV]: "https://images.unsplash.com/photo-1533473359331-0135ef1bcfb0?auto=format&fit=crop&q=80&w=200&h=150",
};