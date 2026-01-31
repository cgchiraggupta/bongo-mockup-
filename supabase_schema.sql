-- =============================================
-- MIGRATION: Add Bidding Marketplace columns
-- (Safe to run multiple times)
-- =============================================

-- 1. Add missing columns to existing bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'furniture',
ADD COLUMN IF NOT EXISTS item_description TEXT,
ADD COLUMN IF NOT EXISTS floor_pickup INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS floor_dropoff INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS elevator_pickup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS elevator_dropoff BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS help_with_loading BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bidding_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suggested_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS winning_bid_id UUID,
ADD COLUMN IF NOT EXISTS final_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS bid_selected_at TIMESTAMP WITH TIME ZONE;

-- 2. Update status constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'accepting_bids', 'bid_selected', 'driver_assigned', 
                  'driver_confirmed', 'picked_up', 'in_transit', 'delivered', 
                  'completed', 'cancelled'));

-- 3. Function to accept a bid (safe to re-run)
CREATE OR REPLACE FUNCTION accept_bid(p_bid_id UUID, p_booking_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_driver_id UUID;
  v_bid_amount DECIMAL;
BEGIN
  SELECT driver_id, bid_amount INTO v_driver_id, v_bid_amount
  FROM bids WHERE id = p_bid_id AND booking_id = p_booking_id;
  
  IF v_driver_id IS NULL THEN RETURN FALSE; END IF;
  
  UPDATE bids SET status = 'accepted', accepted_at = NOW() WHERE id = p_bid_id;
  UPDATE bids SET status = 'rejected' WHERE booking_id = p_booking_id AND id != p_bid_id AND status = 'pending';
  UPDATE bookings SET 
    status = 'bid_selected',
    driver_id = v_driver_id,
    winning_bid_id = p_bid_id,
    final_price = v_bid_amount,
    bid_selected_at = NOW()
  WHERE id = p_booking_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DONE! Your database is now ready for bidding
-- =============================================
