-- Fix maintenance_schedules table to ensure created_at and updated_at columns exist
-- Migration: 20240101000016_fix_maintenance_schedules_timestamps.sql

-- Add created_at if it doesn't exist
DO $
$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'maintenance_schedules' AND column_name = 'created_at'
    ) THEN
    ALTER TABLE maintenance_schedules ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW
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
    WHERE table_name = 'maintenance_schedules' AND column_name = 'updated_at'
    ) THEN
    ALTER TABLE maintenance_schedules ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW
    ();
END
IF;
END $$;

-- Add estimated_cost column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'maintenance_schedules' AND column_name = 'estimated_cost'
    ) THEN
    ALTER TABLE maintenance_schedules ADD COLUMN estimated_cost DECIMAL
    (10,2);
END
IF;
END $$;

-- Add notes column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'maintenance_schedules' AND column_name = 'notes'
    ) THEN
    ALTER TABLE maintenance_schedules ADD COLUMN notes TEXT;
END
IF;
END $$;

-- Create trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_maintenance_schedules_updated_at
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW
();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maintenance_schedules_updated_at_trigger
ON maintenance_schedules;

CREATE TRIGGER maintenance_schedules_updated_at_trigger
    BEFORE
UPDATE ON maintenance_schedules
    FOR EACH ROW
EXECUTE FUNCTION update_maintenance_schedules_updated_at
();
