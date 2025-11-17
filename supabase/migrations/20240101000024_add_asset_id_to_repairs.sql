-- Add asset_id column to repair_items table
ALTER TABLE repair_items
ADD COLUMN asset_id UUID REFERENCES assets
(id) ON
DELETE
SET NULL;

-- Create index for better query performance
CREATE INDEX idx_repair_items_asset_id ON repair_items(asset_id);

-- Update existing records to link with assets where equipment_name matches
UPDATE repair_items r
SET asset_id
= a.id
FROM assets a
WHERE r.asset_id IS NULL 
  AND LOWER
(TRIM
(r.equipment_name)) = LOWER
(TRIM
(a.name));

-- Add comment to document the relationship
COMMENT ON COLUMN repair_items.asset_id IS 'Foreign key reference to the assets table';
