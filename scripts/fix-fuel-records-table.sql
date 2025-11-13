-- Fix fuel_records table structure
-- This script ensures the fuel_records table has all required columns

-- Check if the table exists and has the correct structure
DO $
$ 
BEGIN
    -- Add date column if missing
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'fuel_records' AND column_name = 'date'
    ) THEN
    ALTER TABLE fuel_records ADD COLUMN date TIMESTAMPTZ NOT NULL DEFAULT NOW
    ();
END
IF;

    -- Add created_at if missing
    IF NOT EXISTS (
        SELECT 1
FROM information_schema.columns
WHERE table_name = 'fuel_records' AND column_name = 'created_at'
    ) THEN
ALTER TABLE fuel_records ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW
();
END
IF;

    -- Add updated_at if missing
    IF NOT EXISTS (
        SELECT 1
FROM information_schema.columns
WHERE table_name = 'fuel_records' AND column_name = 'updated_at'
    ) THEN
ALTER TABLE fuel_records ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW
();
END
IF;
END $$;

-- Verify the structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'fuel_records'
ORDER BY ordinal_position;
