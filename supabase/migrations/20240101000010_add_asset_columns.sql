-- Add missing columns to assets table
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS model VARCHAR(100),
ADD COLUMN IF NOT EXISTS serial_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS current_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fuel_capacity DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50) DEFAULT 'Diesel',
ADD COLUMN IF NOT EXISTS barcode VARCHAR(100),
ADD COLUMN IF NOT EXISTS qr_code VARCHAR(255),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add constraints
ALTER TABLE assets
DROP CONSTRAINT IF EXISTS assets_status_check;

ALTER TABLE assets
ADD CONSTRAINT assets_status_check 
CHECK (status IN ('active', 'maintenance', 'retired', 'out_of_service'));

-- Add unique constraints (ignore if already exist)
DO $$ 
BEGIN
    ALTER TABLE assets ADD CONSTRAINT assets_serial_number_unique UNIQUE (serial_number);
EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE assets ADD CONSTRAINT assets_barcode_unique UNIQUE (barcode);
EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE assets ADD CONSTRAINT assets_qr_code_unique UNIQUE (qr_code);
EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_barcode ON assets(barcode);
