-- Create farms table for managing farm locations
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255),
    description TEXT,
    area_hectares DECIMAL(10,2),
    manager_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE TRIGGER update_farms_updated_at 
    BEFORE UPDATE ON farms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert the existing farms from asset locations
INSERT INTO farms (name, status) VALUES
    ('BOMPONI FARM', 'active'),
    ('BRANDHILL', 'active'),
    ('BURMA ESTATE', 'active'),
    ('BURMA VALLEY FARM', 'active'),
    ('FANGUDU', 'active'),
    ('MATANUSKA FARM', 'active')
ON CONFLICT (name) DO NOTHING;

-- Add farm_id to assets table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' AND column_name = 'farm_id'
    ) THEN
        ALTER TABLE assets ADD COLUMN farm_id UUID REFERENCES farms(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update existing assets to link to farms based on location
UPDATE assets 
SET farm_id = (SELECT id FROM farms WHERE farms.name = assets.location)
WHERE location IS NOT NULL;

-- Create index for faster farm lookups
CREATE INDEX IF NOT EXISTS idx_assets_farm_id ON assets(farm_id);

-- Grant permissions
GRANT ALL ON farms TO authenticated;
GRANT ALL ON farms TO service_role;
