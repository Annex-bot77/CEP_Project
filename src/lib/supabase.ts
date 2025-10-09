import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserType = 'farmer' | 'laborer' | 'tractor_owner';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  user_type: UserType;
  location?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LaborListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  skills: string[];
  daily_rate: number;
  availability_status: 'available' | 'busy' | 'unavailable';
  experience_years: number;
  location: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface TractorListing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  tractor_model: string;
  horsepower?: number;
  year?: number;
  hourly_rate: number;
  daily_rate: number;
  availability_status: 'available' | 'rented' | 'maintenance';
  location: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface LaborBooking {
  id: string;
  labor_listing_id: string;
  farmer_id: string;
  laborer_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TractorBooking {
  id: string;
  tractor_listing_id: string;
  farmer_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_hours: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}
