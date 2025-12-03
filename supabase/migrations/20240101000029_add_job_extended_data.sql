-- Add extended_data column to job_cards table for tracking repairs, spares, IR requests, and services
-- This column stores JSONB data for comprehensive job tracking

DO $
$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'job_cards' AND column_name = 'extended_data'
    ) THEN
    ALTER TABLE job_cards ADD COLUMN extended_data JSONB DEFAULT NULL;
END
IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN job_cards.extended_data IS 'JSONB containing: repair_items, spare_allocations, ir_requests, third_party_services, and cost totals';

-- Create index for querying jobs with specific statuses in extended data
CREATE INDEX
IF NOT EXISTS idx_job_cards_extended_data ON job_cards USING GIN
(extended_data);
