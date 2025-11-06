-- Fix Migration: Create missing core tables for UI functionality
-- File: supabase/migrations/20240101000004_fix_missing_tables.sql

-- Create assets table (referenced but missing)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    purchase_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired', 'out_of_service')),
    location VARCHAR(255),
    current_hours INTEGER DEFAULT 0,
    fuel_capacity DECIMAL(10,2),
    fuel_type VARCHAR(50) DEFAULT 'Diesel',
    barcode VARCHAR(100) UNIQUE,
    qr_code VARCHAR(255) UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create fuel_records table (referenced but missing)
CREATE TABLE IF NOT EXISTS fuel_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    price_per_liter DECIMAL(10,4) NOT NULL CHECK (price_per_liter > 0),
    cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price_per_liter) STORED,
    fuel_type VARCHAR(50) NOT NULL DEFAULT 'Diesel',
    location VARCHAR(255) NOT NULL,
    odometer_reading INTEGER,
    receipt_number VARCHAR(50) UNIQUE,
    fuel_grade VARCHAR(20) DEFAULT 'Regular',
    notes TEXT,
    weather_conditions VARCHAR(50),
    operator_id UUID REFERENCES assets(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing constraint to predictive_maintenance table
ALTER TABLE predictive_maintenance 
ADD CONSTRAINT unique_asset_component UNIQUE (asset_id, component_name);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_barcode ON assets(barcode);
CREATE INDEX IF NOT EXISTS idx_assets_qr_code ON assets(qr_code);
CREATE INDEX IF NOT EXISTS idx_fuel_records_asset_id ON fuel_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_fuel_records_date ON fuel_records(date);
CREATE INDEX IF NOT EXISTS idx_fuel_records_fuel_type ON fuel_records(fuel_type);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_assets_updated_at 
    BEFORE UPDATE ON assets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fuel_records_updated_at 
    BEFORE UPDATE ON fuel_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations for authenticated users" ON assets
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON fuel_records
    FOR ALL USING (auth.role() = 'authenticated');

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE assets;
ALTER PUBLICATION supabase_realtime ADD TABLE fuel_records;
ALTER PUBLICATION supabase_realtime ADD TABLE fuel_prices;
ALTER PUBLICATION supabase_realtime ADD TABLE operating_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE predictive_maintenance;

-- Update TABLES constant reference tables
UPDATE pg_description SET description = 'Core farm management tables with fuel analytics support' 
WHERE objoid = 'public.assets'::regclass;