-- Add filling_date column to fuel_records table
ALTER TABLE fuel_records 
ADD COLUMN
IF NOT EXISTS filling_date TIMESTAMPTZ;

-- Set filling_date to date for existing records where filling_date is null
UPDATE fuel_records 
SET filling_date = date 
WHERE filling_date IS NULL;

-- Make filling_date NOT NULL after populating existing records
DO $$ 
BEGIN
    IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'fuel_records' AND column_name = 'filling_date'
  ) THEN
    ALTER TABLE fuel_records ALTER COLUMN filling_date
    SET
    NOT NULL;
END
IF;
END $$;

-- Add index on filling_date for better query performance when looking up previous fills
CREATE INDEX
IF NOT EXISTS idx_fuel_records_filling_date ON fuel_records
(filling_date DESC);

-- Add index on asset_id and filling_date for efficiently finding previous fills by asset
CREATE INDEX
IF NOT EXISTS idx_fuel_records_asset_filling_date ON fuel_records
(asset_id, filling_date DESC);
