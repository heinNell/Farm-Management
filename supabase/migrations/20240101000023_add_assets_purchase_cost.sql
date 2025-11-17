-- Add purchase_cost column to assets table
ALTER TABLE assets 
ADD COLUMN
IF NOT EXISTS purchase_cost DECIMAL
(12, 2);

-- Add index for purchase_cost queries
CREATE INDEX
IF NOT EXISTS idx_assets_purchase_cost ON assets
(purchase_cost);

-- Add comment
COMMENT ON COLUMN assets.purchase_cost IS 'Original purchase cost of the asset in local currency';

-- Update existing records with NULL values (no default to preserve data integrity)
-- Users can update these values manually or through import
