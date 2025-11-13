-- Add missing columns to fuel_records table to match application expectations
-- The table currently has different column names than what the app uses

ALTER TABLE fuel_records 
ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_per_liter DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50) DEFAULT 'diesel',
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS fuel_grade VARCHAR(20),
ADD COLUMN IF NOT EXISTS weather_conditions VARCHAR(50),
ADD COLUMN IF NOT EXISTS operator_id UUID;

-- Copy data from old columns to new columns if they exist
UPDATE fuel_records 
SET 
    quantity = fuel_amount,
    cost = fuel_cost,
    price_per_liter = fuel_price_per_liter,
    fuel_type = COALESCE(record_type, 'diesel'),
    location = COALESCE(station_name, 'Unknown')
WHERE quantity IS NULL;

-- Make new columns NOT NULL after copying data
ALTER TABLE fuel_records 
ALTER COLUMN quantity SET NOT NULL,
ALTER COLUMN cost SET NOT NULL,
ALTER COLUMN price_per_liter SET NOT NULL,
ALTER COLUMN fuel_type SET NOT NULL,
ALTER COLUMN location SET NOT NULL;

-- Add check constraints (drop first if they exist to avoid conflicts)
DO $$
BEGIN
    -- Drop existing constraints if they exist
    ALTER TABLE fuel_records DROP CONSTRAINT IF EXISTS fuel_records_quantity_check;
    ALTER TABLE fuel_records DROP CONSTRAINT IF EXISTS fuel_records_price_check;
    
    -- Add the constraints
    ALTER TABLE fuel_records ADD CONSTRAINT fuel_records_quantity_check CHECK (quantity > 0);
    ALTER TABLE fuel_records ADD CONSTRAINT fuel_records_price_check CHECK (price_per_liter > 0);
END $$;

-- Change asset_id from VARCHAR to UUID if needed
-- First, we need to check if there are any records
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM fuel_records LIMIT 1) THEN
        -- If there are records, you may need to manually fix asset_id references
        RAISE NOTICE 'fuel_records table has data. Please verify asset_id references match UUID format.';
    ELSE
        -- If empty, we can safely change the type
        ALTER TABLE fuel_records ALTER COLUMN asset_id TYPE UUID USING asset_id::UUID;
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'fuel_records' 
AND column_name IN ('quantity', 'cost', 'price_per_liter', 'fuel_type', 'location', 'date', 'asset_id')
ORDER BY column_name;
