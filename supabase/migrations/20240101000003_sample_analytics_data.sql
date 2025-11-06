
-- Sample data for fuel analytics and predictive maintenance
-- This provides realistic test data for the enhanced fuel management system

-- Insert sample fuel prices
INSERT INTO fuel_prices (fuel_type, price_per_liter, effective_date, location, supplier) VALUES
('Diesel', 6.85, '2024-01-01', 'Main Depot', 'FuelCorp'),
('Diesel', 6.92, '2024-01-15', 'Main Depot', 'FuelCorp'),
('Diesel', 7.05, '2024-02-01', 'Main Depot', 'FuelCorp'),
('Gasoline', 7.25, '2024-01-01', 'Main Depot', 'PetroMax'),
('Gasoline', 7.38, '2024-01-15', 'Main Depot', 'PetroMax'),
('Gasoline', 7.42, '2024-02-01', 'Main Depot', 'PetroMax');

-- Update existing fuel_records with additional fields
UPDATE fuel_records SET 
    receipt_number = 'RCP-' || LPAD((ROW_NUMBER() OVER (ORDER BY date))::TEXT, 6, '0'),
    fuel_grade = CASE 
        WHEN random() > 0.7 THEN 'Premium'
        WHEN random() > 0.3 THEN 'Regular'
        ELSE 'Economy'
    END,
    odometer_reading = (random() * 50000 + 10000)::INTEGER,
    notes = CASE 
        WHEN random() > 0.8 THEN 'Emergency refuel'
        WHEN random() > 0.6 THEN 'Scheduled maintenance refuel'
        WHEN random() > 0.4 THEN 'Pre-operation top-up'
        ELSE 'Regular refuel'
    END,
    weather_conditions = CASE 
        WHEN random() > 0.7 THEN 'Rainy'
        WHEN random() > 0.4 THEN 'Sunny'
        WHEN random() > 0.2 THEN 'Cloudy'
        ELSE 'Overcast'
    END;

-- Insert sample operating sessions
INSERT INTO operating_sessions (
    asset_id, 
    session_start, 
    session_end, 
    initial_fuel_level, 
    final_fuel_level, 
    fuel_consumed, 
    distance_traveled, 
    operating_hours, 
    efficiency_rating,
    operator_notes
)
SELECT 
    a.id,
    NOW() - (random() * 60 || ' days')::INTERVAL - (random() * 24 || ' hours')::INTERVAL,
    NOW() - (random() * 60 || ' days')::INTERVAL,
    (random() * 40 + 60)::DECIMAL(5,2), -- Initial fuel level 60-100%
    (random() * 30 + 20)::DECIMAL(5,2), -- Final fuel level 20-50%
    (random() * 25 + 15)::DECIMAL(10,2), -- Fuel consumed 15-40L
    (random() * 50 + 10)::DECIMAL(10,2), -- Distance 10-60km
    (random() * 6 + 2)::DECIMAL(10,2), -- Operating hours 2-8h
    (random() * 2 + 3)::DECIMAL(5,2), -- Efficiency rating 3-5
    CASE 
        WHEN random() > 0.8 THEN 'Excellent performance'
        WHEN random() > 0.6 THEN 'Normal operations'
        WHEN random() > 0.4 THEN 'Minor issues noted'
        WHEN random() > 0.2 THEN 'Requires attention'
        ELSE 'Performance concerns'
    END
FROM assets a
CROSS JOIN generate_series(1, 5) -- 5 sessions per asset
WHERE a.type IN ('Tractor', 'Combine', 'Sprayer');

-- Generate realistic predictive maintenance data
WITH asset_usage AS (
    SELECT 
        a.id,
        a.name,
        COUNT(os.id) as session_count,
        AVG(os.operating_hours) as avg_hours,
        SUM(os.fuel_consumed) as total_fuel
    FROM assets a
    LEFT JOIN operating_sessions os ON a.id = os.asset_id
    WHERE a.type IN ('Tractor', 'Combine', 'Sprayer')
    GROUP BY a.id, a.name
)
INSERT INTO predictive_maintenance (
    asset_id,
    component_name,
    failure_probability,
    predicted_failure_date,
    confidence_level,
    recommended_action,
    maintenance_priority
)
SELECT 
    au.id,
    component,
    CASE 
        WHEN au.avg_hours > 6 THEN (random() * 0.4 + 0.4)::DECIMAL(3,2) -- 0.4-0.8
        WHEN au.avg_hours > 4 THEN (random() * 0.3 + 0.2)::DECIMAL(3,2) -- 0.2-0.5
        ELSE (random() * 0.2 + 0.1)::DECIMAL(3,2) -- 0.1-0.3
    END as failure_prob,
    CURRENT_DATE + (random() * 90 + 15)::INTEGER * INTERVAL '1 day' as pred_date,
    (random() * 0.3 + 0.6)::DECIMAL(3,2) as confidence,
    CASE 
        WHEN random() > 0.7 THEN 'Schedule preventive maintenance'
        WHEN random() > 0.4 THEN 'Monitor closely'
        WHEN random() > 0.2 THEN 'Continue normal operations'
        ELSE 'Inspect component'
    END as action,
    CASE 
        WHEN random() > 0.8 THEN 1
        WHEN random() > 0.5 THEN 2
        WHEN random() > 0.2 THEN 3
        ELSE 4
    END as priority
FROM asset_usage au
CROSS JOIN (
    VALUES 
    ('Engine System'),
    ('Hydraulic Pump'),
    ('Drive Belt'),
    ('Air Filter'),
    ('Fuel Injectors'),
    ('Cooling System'),
    ('Transmission'),
    ('Brake System')
) AS components(component);

-- Update predictive maintenance calculation
SELECT update_predictive_maintenance();

-- Add some maintenance history to fuel_records
UPDATE fuel_records 
SET notes = COALESCE(notes, '') || ' | Post-maintenance refuel'
WHERE random() > 0.9;

-- Create some high-priority alerts
INSERT INTO predictive_maintenance (
    asset_id,
    component_name,
    failure_probability,
    predicted_failure_date,
    confidence_level,
    recommended_action,
    maintenance_priority
)
SELECT 
    a.id,
    'Critical System Alert',
    0.85,
    CURRENT_DATE + 7,
    0.92,
    'URGENT: Schedule immediate inspection and maintenance',
    1
FROM assets a
WHERE a.name LIKE '%8370R%'
LIMIT 1;
