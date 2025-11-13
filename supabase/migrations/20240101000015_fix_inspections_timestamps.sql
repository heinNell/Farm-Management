-- Fix inspections table to ensure created_at and updated_at columns exist
-- Migration: 20240101000015_fix_inspections_timestamps.sql

-- Add created_at if it doesn't exist
DO $
$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'created_at'
    ) THEN
    ALTER TABLE inspections ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW
    ();
END
IF;
END $$;

-- Add updated_at if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'updated_at'
    ) THEN
    ALTER TABLE inspections ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW
    ();
END
IF;
END $$;

-- Add findings column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'findings'
    ) THEN
    ALTER TABLE inspections ADD COLUMN findings TEXT;
END
IF;
END $$;

-- Add recommendations column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'recommendations'
    ) THEN
    ALTER TABLE inspections ADD COLUMN recommendations TEXT;
END
IF;
END $$;

-- Create trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_inspections_updated_at
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW
();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inspections_updated_at_trigger
ON inspections;

CREATE TRIGGER inspections_updated_at_trigger
    BEFORE
UPDATE ON inspections
    FOR EACH ROW
EXECUTE FUNCTION update_inspections_updated_at
();
