/*
  # Farm Labor and Tractor Platform Database Schema

  ## Overview
  Complete database schema for connecting farmers, laborers, and tractor owners.
  
  ## New Tables
  
  ### 1. profiles
  Extended user profiles with role-based information
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `phone` (text) - Contact phone number
  - `user_type` (text) - Role: 'farmer', 'laborer', or 'tractor_owner'
  - `location` (text) - User location/address
  - `bio` (text) - User description
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. labor_listings
  Available labor workers and their skills
  - `id` (uuid, PK) - Listing identifier
  - `user_id` (uuid, FK) - Reference to laborer's profile
  - `title` (text) - Job title/specialty
  - `description` (text) - Detailed description of skills
  - `skills` (text[]) - Array of skills
  - `daily_rate` (numeric) - Rate per day
  - `availability_status` (text) - 'available', 'busy', 'unavailable'
  - `experience_years` (integer) - Years of experience
  - `location` (text) - Work location preference
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. tractor_listings
  Available tractors for rent
  - `id` (uuid, PK) - Listing identifier
  - `owner_id` (uuid, FK) - Reference to owner's profile
  - `title` (text) - Tractor title/model
  - `description` (text) - Detailed description
  - `tractor_model` (text) - Model/brand information
  - `horsepower` (integer) - Tractor power
  - `year` (integer) - Manufacturing year
  - `hourly_rate` (numeric) - Rate per hour
  - `daily_rate` (numeric) - Rate per day
  - `availability_status` (text) - 'available', 'rented', 'maintenance'
  - `location` (text) - Tractor location
  - `image_url` (text) - Tractor photo
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. labor_bookings
  Booking requests for labor workers
  - `id` (uuid, PK) - Booking identifier
  - `labor_listing_id` (uuid, FK) - Reference to labor listing
  - `farmer_id` (uuid, FK) - Reference to farmer
  - `laborer_id` (uuid, FK) - Reference to laborer
  - `start_date` (date) - Work start date
  - `end_date` (date) - Work end date
  - `total_days` (integer) - Number of days
  - `total_amount` (numeric) - Total payment
  - `status` (text) - 'pending', 'confirmed', 'completed', 'cancelled'
  - `notes` (text) - Additional booking notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 5. tractor_bookings
  Booking requests for tractors
  - `id` (uuid, PK) - Booking identifier
  - `tractor_listing_id` (uuid, FK) - Reference to tractor
  - `farmer_id` (uuid, FK) - Reference to farmer
  - `owner_id` (uuid, FK) - Reference to tractor owner
  - `start_date` (timestamptz) - Rental start
  - `end_date` (timestamptz) - Rental end
  - `total_hours` (numeric) - Total hours
  - `total_amount` (numeric) - Total payment
  - `status` (text) - 'pending', 'confirmed', 'completed', 'cancelled'
  - `notes` (text) - Additional booking notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:
  
  1. **profiles**
     - Anyone can view all profiles
     - Users can only update their own profile
  
  2. **labor_listings**
     - Anyone can view all listings
     - Only laborers can create listings
     - Only the listing owner can update/delete their listing
  
  3. **tractor_listings**
     - Anyone can view all listings
     - Only tractor owners can create listings
     - Only the listing owner can update/delete their listing
  
  4. **labor_bookings**
     - Users can view bookings they're involved in (farmer or laborer)
     - Only farmers can create labor bookings
     - Farmers can cancel their own bookings
     - Laborers can update status of their bookings
  
  5. **tractor_bookings**
     - Users can view bookings they're involved in (farmer or owner)
     - Only farmers can create tractor bookings
     - Farmers can cancel their own bookings
     - Owners can update status of their bookings
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  user_type text NOT NULL CHECK (user_type IN ('farmer', 'laborer', 'tractor_owner')),
  location text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create labor_listings table
CREATE TABLE IF NOT EXISTS labor_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  skills text[] DEFAULT '{}',
  daily_rate numeric NOT NULL CHECK (daily_rate >= 0),
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  experience_years integer DEFAULT 0 CHECK (experience_years >= 0),
  location text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tractor_listings table
CREATE TABLE IF NOT EXISTS tractor_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  tractor_model text NOT NULL,
  horsepower integer CHECK (horsepower > 0),
  year integer CHECK (year >= 1900 AND year <= 2100),
  hourly_rate numeric NOT NULL CHECK (hourly_rate >= 0),
  daily_rate numeric NOT NULL CHECK (daily_rate >= 0),
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'rented', 'maintenance')),
  location text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create labor_bookings table
CREATE TABLE IF NOT EXISTS labor_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  labor_listing_id uuid NOT NULL REFERENCES labor_listings(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  laborer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days integer NOT NULL CHECK (total_days > 0),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tractor_bookings table
CREATE TABLE IF NOT EXISTS tractor_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tractor_listing_id uuid NOT NULL REFERENCES tractor_listings(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  total_hours numeric NOT NULL CHECK (total_hours > 0),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Labor listings policies
CREATE POLICY "Anyone can view labor listings"
  ON labor_listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Laborers can create listings"
  ON labor_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'laborer'
    )
  );

CREATE POLICY "Users can update own labor listings"
  ON labor_listings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own labor listings"
  ON labor_listings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Tractor listings policies
CREATE POLICY "Anyone can view tractor listings"
  ON tractor_listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tractor owners can create listings"
  ON tractor_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'tractor_owner'
    )
  );

CREATE POLICY "Users can update own tractor listings"
  ON tractor_listings FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own tractor listings"
  ON tractor_listings FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Labor bookings policies
CREATE POLICY "Users can view their labor bookings"
  ON labor_bookings FOR SELECT
  TO authenticated
  USING (farmer_id = auth.uid() OR laborer_id = auth.uid());

CREATE POLICY "Farmers can create labor bookings"
  ON labor_bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    farmer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'farmer'
    )
  );

CREATE POLICY "Farmers can cancel their labor bookings"
  ON labor_bookings FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Laborers can update their booking status"
  ON labor_bookings FOR UPDATE
  TO authenticated
  USING (laborer_id = auth.uid())
  WITH CHECK (laborer_id = auth.uid());

-- Tractor bookings policies
CREATE POLICY "Users can view their tractor bookings"
  ON tractor_bookings FOR SELECT
  TO authenticated
  USING (farmer_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Farmers can create tractor bookings"
  ON tractor_bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    farmer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'farmer'
    )
  );

CREATE POLICY "Farmers can cancel their tractor bookings"
  ON tractor_bookings FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Owners can update their tractor booking status"
  ON tractor_bookings FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_labor_listings_user_id ON labor_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_labor_listings_status ON labor_listings(availability_status);
CREATE INDEX IF NOT EXISTS idx_tractor_listings_owner_id ON tractor_listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_tractor_listings_status ON tractor_listings(availability_status);
CREATE INDEX IF NOT EXISTS idx_labor_bookings_farmer ON labor_bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_labor_bookings_laborer ON labor_bookings(laborer_id);
CREATE INDEX IF NOT EXISTS idx_tractor_bookings_farmer ON tractor_bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_tractor_bookings_owner ON tractor_bookings(owner_id);