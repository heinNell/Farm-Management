-- Create fuel_prices table
CREATE TABLE IF NOT EXISTS fuel_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fuel_type VARCHAR(50) NOT NULL,
    price_per_liter DECIMAL(10,2) NOT NULL,
    effective_date TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    supplier VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on fuel_type and effective_date for faster lookups
CREATE INDEX IF NOT EXISTS idx_fuel_prices_type_date ON fuel_prices(fuel_type, effective_date DESC);

-- Create operating_sessions table
CREATE TABLE IF NOT EXISTS operating_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    session_start TIMESTAMPTZ NOT NULL,
    session_end TIMESTAMPTZ,
    initial_fuel_level DECIMAL(10,2),
    final_fuel_level DECIMAL(10,2),
    fuel_consumed DECIMAL(10,2),
    distance_traveled DECIMAL(10,2),
    operating_hours DECIMAL(10,2),
    efficiency_rating DECIMAL(5,2),
    operator_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on asset_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_operating_sessions_asset_id ON operating_sessions(asset_id);
CREATE INDEX IF NOT EXISTS idx_operating_sessions_start ON operating_sessions(session_start DESC);

-- Insert some sample fuel prices
INSERT INTO fuel_prices (fuel_type, price_per_liter, effective_date, location, supplier)
VALUES 
    ('Diesel', 1.45, NOW() - INTERVAL '30 days', 'Main Depot', 'Shell'),
    ('Diesel', 1.52, NOW() - INTERVAL '15 days', 'Main Depot', 'Shell'),
    ('Diesel', 1.48, NOW(), 'Main Depot', 'Shell'),
    ('Petrol', 1.65, NOW() - INTERVAL '30 days', 'Main Depot', 'Shell'),
    ('Petrol', 1.72, NOW() - INTERVAL '15 days', 'Main Depot', 'Shell'),
    ('Petrol', 1.68, NOW(), 'Main Depot', 'Shell')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE fuel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for fuel_prices
CREATE POLICY "Enable read access for all users" ON fuel_prices
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON fuel_prices
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON fuel_prices
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON fuel_prices
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for operating_sessions
CREATE POLICY "Enable read access for all users" ON operating_sessions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON operating_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON operating_sessions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON operating_sessions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fuel_prices_updated_at BEFORE UPDATE ON fuel_prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operating_sessions_updated_at BEFORE UPDATE ON operating_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
