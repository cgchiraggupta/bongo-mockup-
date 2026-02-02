-- ============================================
-- ANTIGRAVITY - Complete Database Schema
-- ============================================
-- ⚠️ WARNING: THIS WILL RESET YOUR DATABASE ⚠️
-- ============================================

-- 1. CLEANUP (Drop everything to start fresh)
-- Drop Tables
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS driver_locations CASCADE;
DROP TABLE IF EXISTS driver_profiles CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- Drop Functions (Fixes "cannot change return type" error)
DROP FUNCTION IF EXISTS accept_bid(UUID, UUID);
DROP FUNCTION IF EXISTS calculate_suggested_price(DECIMAL, TEXT, INTEGER, BOOLEAN, DECIMAL);
DROP FUNCTION IF EXISTS get_nearby_jobs(UUID, INTEGER);
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS auto_expire_bids();

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- BOOKINGS TABLE
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users NOT NULL,
  driver_id UUID REFERENCES auth.users,
  
  -- Booking Configuration
  booking_type TEXT DEFAULT 'bidding' CHECK (booking_type IN ('bidding', 'instant')),
  category TEXT NOT NULL CHECK (category IN ('furniture', 'appliances', 'bulk_items')),
  
  -- Locations
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10,8) NOT NULL,
  pickup_lng DECIMAL(11,8) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_lat DECIMAL(10,8) NOT NULL,
  dropoff_lng DECIMAL(11,8) NOT NULL,
  distance_km DECIMAL(8,2) NOT NULL,
  
  -- Package Details
  item_description TEXT NOT NULL,
  item_photos TEXT[],
  weight_estimate_kg DECIMAL(8,2),
  dimensions TEXT, 
  floor_number INTEGER DEFAULT 0,
  elevator_available BOOLEAN DEFAULT false,
  help_with_loading BOOLEAN DEFAULT false,
  
  -- Bidding Configuration
  bidding_ends_at TIMESTAMP,
  min_bids_required INTEGER DEFAULT 3,
  suggested_price DECIMAL(10,2) NOT NULL,
  
  -- Final Pricing
  winning_bid_id UUID,
  final_price DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  driver_earnings DECIMAL(10,2),
  
  -- Status
  status TEXT DEFAULT 'accepting_bids' CHECK (status IN (
    'accepting_bids', 'bid_selected', 'driver_confirmed', 
    'picked_up', 'in_transit', 'delivered', 
    'completed', 'cancelled', 'driver_cancelled'
  )),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  bid_selected_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Cancellation
  cancelled_at TIMESTAMP,
  cancelled_by UUID REFERENCES auth.users,
  cancellation_reason TEXT
);

-- BIDS TABLE
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES auth.users NOT NULL,
  
  bid_amount DECIMAL(10,2) NOT NULL CHECK (bid_amount >= 200),
  estimated_time_mins INTEGER NOT NULL CHECK (estimated_time_mins > 0),
  driver_message TEXT,
  vehicle_type TEXT,
  helpers_included INTEGER DEFAULT 1,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'withdrawn')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  
  UNIQUE(booking_id, driver_id)
);

ALTER TABLE bookings ADD CONSTRAINT bookings_winning_bid_id_fkey FOREIGN KEY (winning_bid_id) REFERENCES bids(id);

-- DRIVER PROFILES TABLE
CREATE TABLE driver_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('tempo', 'mini_truck', 'pickup', 'auto')),
  vehicle_photos TEXT[],
  
  -- Capacity
  max_weight_kg DECIMAL(8,2) DEFAULT 500,
  has_helpers BOOLEAN DEFAULT false,
  
  -- Service
  service_radius_km INTEGER DEFAULT 25,
  base_location_lat DECIMAL(10,8),
  base_location_lng DECIMAL(11,8),
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  rating_avg DECIMAL(3,2) DEFAULT 5.0,
  total_deliveries INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DRIVER LOCATIONS TABLE
CREATE TABLE driver_locations (
  driver_id UUID PRIMARY KEY REFERENCES auth.users,
  booking_id UUID REFERENCES bookings(id),
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  heading DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RATINGS TABLE
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  rated_by UUID REFERENCES auth.users NOT NULL,
  rated_user UUID REFERENCES auth.users NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(booking_id, rated_by)
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_booking_id UUID REFERENCES bookings(id),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES & RLS
-- ============================================

CREATE INDEX idx_bookings_status ON bookings(status, created_at DESC);
CREATE INDEX idx_bids_booking ON bids(booking_id, bid_amount ASC);
CREATE INDEX idx_driver_locations_updated ON driver_locations(updated_at DESC);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Expanded in previous version, kept simple here for reliability)
CREATE POLICY "Public read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Auth insert bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Auth update bookings" ON bookings FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = driver_id);

CREATE POLICY "Public read bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Auth insert bids" ON bids FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "Auth update bids" ON bids FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Public read profiles" ON driver_profiles FOR SELECT USING (true);
CREATE POLICY "Auth update profiles" ON driver_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth insert profiles" ON driver_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public read locations" ON driver_locations FOR SELECT USING (true);
CREATE POLICY "Auth update locations" ON driver_locations FOR ALL USING (auth.uid() = driver_id);

-- ============================================
-- 4. RPC FUNCTIONS (Recreated)
-- ============================================

-- Function 1: Accept Bid
CREATE OR REPLACE FUNCTION accept_bid(p_bid_id UUID, p_booking_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bid_amount DECIMAL(10,2);
  v_driver_id UUID;
BEGIN
  -- Validate bid
  SELECT bid_amount, driver_id INTO v_bid_amount, v_driver_id
  FROM bids WHERE id = p_bid_id AND booking_id = p_booking_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Bid not found');
  END IF;
  
  -- Update booking
  UPDATE bookings SET 
    status = 'bid_selected',
    winning_bid_id = p_bid_id,
    driver_id = v_driver_id,
    final_price = v_bid_amount,
    bid_selected_at = NOW()
  WHERE id = p_booking_id;
  
  -- Update bids
  UPDATE bids SET status = 'accepted', accepted_at = NOW() WHERE id = p_bid_id;
  UPDATE bids SET status = 'expired' WHERE booking_id = p_booking_id AND id != p_bid_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Function 2: Calculate Suggested Price
CREATE OR REPLACE FUNCTION calculate_suggested_price(
  p_distance_km DECIMAL,
  p_category TEXT,
  p_floor_number INTEGER DEFAULT 0,
  p_elevator_available BOOLEAN DEFAULT false,
  p_weight_kg DECIMAL DEFAULT 0
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
  v_base_fare DECIMAL(10,2) := 150;
  v_per_km_rate DECIMAL(10,2) := 8;
  v_price DECIMAL(10,2);
BEGIN
  v_price := v_base_fare + (p_distance_km * v_per_km_rate);
  IF p_category = 'furniture' THEN v_price := v_price * 1.3; END IF;
  RETURN ROUND(v_price / 10) * 10;
END;
$$;
