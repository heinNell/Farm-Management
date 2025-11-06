
-- Advanced Fuel Analytics Migration
-- Creates comprehensive fuel management system with analytics, KPIs, and reporting

-- Enhanced fuel_records table with additional analytics fields
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50) UNIQUE;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS fuel_grade VARCHAR(20) DEFAULT 'Regular';
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS odometer_reading INTEGER;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS weather_conditions VARCHAR(50);
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES assets(id);

-- Fuel prices tracking table
CREATE TABLE IF NOT EXISTS fuel_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fuel_type VARCHAR(50) NOT NULL,
    price_per_liter DECIMAL(10,4) NOT NULL,
    effective_date DATE NOT NULL,
    location VARCHAR(100),
    supplier VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Operating sessions table for detailed tracking
CREATE TABLE IF NOT EXISTS operating_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    initial_fuel_level DECIMAL(5,2),
    final_fuel_level DECIMAL(5,2),
    fuel_consumed DECIMAL(10,2),
    distance_traveled DECIMAL(10,2),
    operating_hours DECIMAL(10,2),
    efficiency_rating DECIMAL(5,2),
    operator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictive maintenance table
CREATE TABLE IF NOT EXISTS predictive_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    component_name VARCHAR(100) NOT NULL,
    failure_probability DECIMAL(3,2) CHECK (failure_probability >= 0 AND failure_probability <= 1),
    predicted_failure_date DATE,
    confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
    recommended_action TEXT,
    maintenance_priority INTEGER CHECK (maintenance_priority >= 1 AND maintenance_priority <= 5),
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fuel_records_date ON fuel_records(date);
CREATE INDEX IF NOT EXISTS idx_fuel_records_asset ON fuel_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_fuel_prices_date ON fuel_prices(effective_date);
CREATE INDEX IF NOT EXISTS idx_operating_sessions_asset ON operating_sessions(asset_id);
CREATE INDEX IF NOT EXISTS idx_operating_sessions_date ON operating_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_predictive_maintenance_asset ON predictive_maintenance(asset_id);

-- Database functions for fuel efficiency calculations
CREATE OR REPLACE FUNCTION calculate_fuel_efficiency(
    p_asset_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    total_fuel_consumed DECIMAL,
    total_distance DECIMAL,
    average_efficiency DECIMAL,
    efficiency_trend DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH fuel_data AS (
        SELECT 
            SUM(quantity) as total_fuel,
            SUM(COALESCE(distance_traveled, 0)) as total_dist,
            AVG(efficiency_rating) as avg_eff
        FROM operating_sessions os
        WHERE os.asset_id = p_asset_id
        AND os.session_start::DATE BETWEEN p_start_date AND p_end_date
    ),
    trend_data AS (
        SELECT 
            (
                SELECT AVG(efficiency_rating) 
                FROM operating_sessions 
                WHERE asset_id = p_asset_id 
                AND session_start::DATE >= p_end_date - INTERVAL '7 days'
            ) - (
                SELECT AVG(efficiency_rating) 
                FROM operating_sessions 
                WHERE asset_id = p_asset_id 
                AND session_start::DATE BETWEEN p_start_date AND p_start_date + INTERVAL '7 days'
            ) as trend
    )
    SELECT 
        fd.total_fuel,
        fd.total_dist,
        fd.avg_eff,
        COALESCE(td.trend, 0)
    FROM fuel_data fd
    CROSS JOIN trend_data td;
END;
$$ LANGUAGE plpgsql;

-- Function for predictive maintenance calculations
CREATE OR REPLACE FUNCTION update_predictive_maintenance()
RETURNS VOID AS $$
DECLARE
    asset_record RECORD;
    failure_prob DECIMAL;
    confidence DECIMAL;
BEGIN
    FOR asset_record IN SELECT id, name, type FROM assets LOOP
        -- Simple predictive algorithm based on usage patterns
        WITH usage_stats AS (
            SELECT 
                COUNT(*) as session_count,
                AVG(operating_hours) as avg_hours,
                SUM(fuel_consumed) as total_fuel,
                MAX(session_start) as last_operation
            FROM operating_sessions 
            WHERE asset_id = asset_record.id
            AND session_start >= CURRENT_DATE - INTERVAL '90 days'
        )
        SELECT 
            CASE 
                WHEN us.avg_hours > 8 THEN 0.7
                WHEN us.avg_hours > 6 THEN 0.5
                WHEN us.avg_hours > 4 THEN 0.3
                ELSE 0.1
            END,
            CASE 
                WHEN us.session_count > 50 THEN 0.9
                WHEN us.session_count > 20 THEN 0.7
                ELSE 0.5
            END
        INTO failure_prob, confidence
        FROM usage_stats us;

        -- Insert or update predictive maintenance record
        INSERT INTO predictive_maintenance (
            asset_id, 
            component_name, 
            failure_probability, 
            predicted_failure_date,
            confidence_level,
            recommended_action,
            maintenance_priority
        ) VALUES (
            asset_record.id,
            'Engine System',
            COALESCE(failure_prob, 0.1),
            CURRENT_DATE + INTERVAL '30 days',
            COALESCE(confidence, 0.5),
            CASE 
                WHEN failure_prob > 0.6 THEN 'Schedule immediate maintenance'
                WHEN failure_prob > 0.4 THEN 'Monitor closely and schedule maintenance'
                ELSE 'Continue normal operations'
            END,
            CASE 
                WHEN failure_prob > 0.6 THEN 1
                WHEN failure_prob > 0.4 THEN 2
                ELSE 3
            END
        )
        ON CONFLICT (asset_id, component_name) 
        DO UPDATE SET 
            failure_probability = EXCLUDED.failure_probability,
            predicted_failure_date = EXCLUDED.predicted_failure_date,
            confidence_level = EXCLUDED.confidence_level,
            recommended_action = EXCLUDED.recommended_action,
            maintenance_priority = EXCLUDED.maintenance_priority,
            last_calculated = NOW(),
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Views for common queries and reporting
CREATE OR REPLACE VIEW fuel_consumption_summary AS
SELECT 
    a.name as asset_name,
    a.type as asset_type,
    DATE_TRUNC('month', fr.date) as month,
    SUM(fr.quantity) as total_fuel_consumed,
    SUM(fr.cost) as total_cost,
    AVG(fr.price_per_liter) as avg_price_per_liter,
    COUNT(*) as refuel_count
FROM fuel_records fr
JOIN assets a ON fr.asset_id = a.id
GROUP BY a.id, a.name, a.type, DATE_TRUNC('month', fr.date)
ORDER BY month DESC, total_fuel_consumed DESC;

CREATE OR REPLACE VIEW efficiency_report AS
SELECT 
    a.name as asset_name,
    a.type as asset_type,
    os.session_start::DATE as operation_date,
    os.fuel_consumed,
    os.distance_traveled,
    os.operating_hours,
    CASE 
        WHEN os.distance_traveled > 0 THEN os.fuel_consumed / os.distance_traveled
        ELSE NULL
    END as fuel_per_km,
    CASE 
        WHEN os.operating_hours > 0 THEN os.fuel_consumed / os.operating_hours
        ELSE NULL
    END as fuel_per_hour,
    os.efficiency_rating
FROM operating_sessions os
JOIN assets a ON os.asset_id = a.id
WHERE os.session_end IS NOT NULL
ORDER BY os.session_start DESC;

CREATE OR REPLACE VIEW maintenance_alerts AS
SELECT 
    a.name as asset_name,
    a.type as asset_type,
    pm.component_name,
    pm.failure_probability,
    pm.predicted_failure_date,
    pm.confidence_level,
    pm.recommended_action,
    pm.maintenance_priority,
    CASE 
        WHEN pm.failure_probability >= 0.7 THEN 'Critical'
        WHEN pm.failure_probability >= 0.4 THEN 'Warning'
        ELSE 'Normal'
    END as risk_level
FROM predictive_maintenance pm
JOIN assets a ON pm.asset_id = a.id
ORDER BY pm.failure_probability DESC, pm.predicted_failure_date ASC;

-- RLS Policies
ALTER TABLE fuel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_maintenance ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON fuel_prices FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON fuel_prices FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON operating_sessions FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON operating_sessions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON predictive_maintenance FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON predictive_maintenance FOR ALL USING (auth.role() = 'authenticated');

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fuel_prices_updated_at BEFORE UPDATE ON fuel_prices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operating_sessions_updated_at BEFORE UPDATE ON operating_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_predictive_maintenance_updated_at BEFORE UPDATE ON predictive_maintenance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
