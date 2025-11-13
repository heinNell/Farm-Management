-- Remove old fuel_records columns that have been replaced
-- Migration: 20240101000017_remove_old_fuel_columns.sql

-- Make ALL old columns nullable first (in case they're still NOT NULL)
DO $$
BEGIN
    -- Drop NOT NULL constraints from old columns
    ALTER TABLE fuel_records ALTER COLUMN fuel_amount DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE fuel_records ALTER COLUMN fuel_cost DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE fuel_records ALTER COLUMN fuel_price_per_liter DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE fuel_records ALTER COLUMN record_type DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE fuel_records ALTER COLUMN station_name DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Option 1: Drop the old columns entirely (recommended for clean schema)
-- Uncomment if you want to completely remove old columns:
-- ALTER TABLE fuel_records 
-- DROP COLUMN IF EXISTS fuel_amount,
-- DROP COLUMN IF EXISTS fuel_cost,
-- DROP COLUMN IF EXISTS fuel_price_per_liter,
-- DROP COLUMN IF EXISTS record_type,
-- DROP COLUMN IF EXISTS station_name;

-- Option 2: Keep old columns as nullable for backwards compatibility
-- This is the safer approach - old columns are now nullable above

-- Ensure the new columns are properly set up
-- Add default values for safety
ALTER TABLE fuel_records 
ALTER COLUMN quantity SET DEFAULT 0,
ALTER COLUMN cost SET DEFAULT 0,
ALTER COLUMN price_per_liter SET DEFAULT 0;

-- Make asset_id nullable (it should allow null when no asset is selected)
ALTER TABLE fuel_records 
ALTER COLUMN asset_id DROP NOT NULL;

-- Verify the changes
COMMENT ON COLUMN fuel_records.quantity IS 'Fuel quantity in liters (replaces fuel_amount)';
COMMENT ON COLUMN fuel_records.cost IS 'Total cost of fuel (replaces fuel_cost)';
COMMENT ON COLUMN fuel_records.price_per_liter IS 'Price per liter (replaces fuel_price_per_liter)';
COMMENT ON COLUMN fuel_records.fuel_type IS 'Type of fuel (replaces record_type)';
COMMENT ON COLUMN fuel_records.location IS 'Fueling location (replaces station_name)';
