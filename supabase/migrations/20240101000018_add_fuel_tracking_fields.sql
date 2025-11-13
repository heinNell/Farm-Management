-- Add missing fields to fuel_records for hour tracking and consumption
-- Migration: 20240101000018_add_fuel_tracking_fields.sql

-- Add current_hours field to track equipment hours at fueling time
ALTER TABLE fuel_records 
ADD COLUMN IF NOT EXISTS current_hours INTEGER;

-- Add previous_hours to calculate hour difference
ALTER TABLE fuel_records 
ADD COLUMN IF NOT EXISTS previous_hours INTEGER;

-- Add consumption_rate (liters per hour)
ALTER TABLE fuel_records 
ADD COLUMN IF NOT EXISTS consumption_rate DECIMAL(10,2);

-- Add hour_difference to show hours since last refuel
ALTER TABLE fuel_records 
ADD COLUMN IF NOT EXISTS hour_difference INTEGER;

-- Create index for faster queries by asset and date
CREATE INDEX IF NOT EXISTS idx_fuel_records_asset_date ON fuel_records(asset_id, date DESC);

-- Add comments for documentation
COMMENT ON COLUMN fuel_records.current_hours IS 'Hour meter reading at time of fueling';
COMMENT ON COLUMN fuel_records.previous_hours IS 'Previous hour meter reading from last fuel record';
COMMENT ON COLUMN fuel_records.consumption_rate IS 'Calculated consumption in liters per hour';
COMMENT ON COLUMN fuel_records.hour_difference IS 'Hours operated since last refuel';
