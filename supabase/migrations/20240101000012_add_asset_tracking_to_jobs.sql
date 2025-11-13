-- Add asset tracking and hour tracking to job_cards table
ALTER TABLE job_cards 
ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS actual_hours INTEGER,
ADD COLUMN IF NOT EXISTS completed_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS hour_meter_reading DECIMAL(10,1);

-- Add index for faster asset lookups
CREATE INDEX IF NOT EXISTS idx_job_cards_asset_id ON job_cards(asset_id);

-- Update the status check constraint to include all statuses
ALTER TABLE job_cards DROP CONSTRAINT IF EXISTS job_cards_status_check;
ALTER TABLE job_cards 
ADD CONSTRAINT job_cards_status_check 
CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'urgent', 'cancelled'));

-- Comment explaining the new fields
COMMENT ON COLUMN job_cards.asset_id IS 'Reference to the asset this job is for';
COMMENT ON COLUMN job_cards.hour_meter_reading IS 'Hour meter reading of the asset when job was created';
COMMENT ON COLUMN job_cards.actual_hours IS 'Actual hours spent on the job';
COMMENT ON COLUMN job_cards.notes IS 'Additional notes about the job';
COMMENT ON COLUMN job_cards.completed_date IS 'Date when the job was completed';
