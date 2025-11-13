-- Add asset_id column to inspections table to track which equipment is being inspected
-- Migration: 20240101000014_add_asset_to_inspections.sql

-- Add asset_id column with foreign key to assets table
ALTER TABLE inspections 
ADD COLUMN
IF NOT EXISTS asset_id UUID REFERENCES assets
(id) ON
DELETE
SET NULL;

-- Add index for performance on asset queries
CREATE INDEX
IF NOT EXISTS idx_inspections_asset_id ON inspections
(asset_id);

-- Add comment for documentation
COMMENT ON COLUMN inspections.asset_id IS 'Reference to the asset/equipment being inspected';
