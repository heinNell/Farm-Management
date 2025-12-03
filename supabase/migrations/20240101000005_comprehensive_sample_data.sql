-- Sample Data Migration: Insert comprehensive test data
-- File: supabase/migrations/20240101000005_comprehensive_sample_data.sql

-- Insert sample assets
INSERT INTO assets (id, name, type, model, serial_number, purchase_date, status, location, current_hours, fuel_capacity, fuel_type, barcode, qr_code, notes) VALUES
('11111111-1111-1111-1111-111111111111', 'Tractor Alpha', 'Tractor', 'John Deere 8R', 'JD8R-2023-001', '2023-01-15', 'active', 'North Field', 1250, 300.0, 'Diesel', 'TRC-ALPHA-001', 'QR-TRC-ALPHA-001', 'Primary field tractor'),
('22222222-2222-2222-2222-222222222222', 'Harvester Beta', 'Harvester', 'Case IH 9250', 'CI9250-2022-002', '2022-08-20', 'active', 'Equipment Shed', 850, 450.0, 'Diesel', 'HRV-BETA-002', 'QR-HRV-BETA-002', 'Main harvest equipment'),
('33333333-3333-3333-3333-333333333333', 'Sprayer Gamma', 'Sprayer', 'Apache AS1250', 'AP1250-2023-003', '2023-03-10', 'active', 'South Field', 320, 200.0, 'Diesel', 'SPR-GAMMA-003', 'QR-SPR-GAMMA-003', 'Precision spraying system'),
('44444444-4444-4444-4444-444444444444', 'Seeder Delta', 'Seeder', 'Kinze 4900', 'KZ4900-2021-004', '2021-11-05', 'maintenance', 'Workshop', 1850, 180.0, 'Diesel', 'SED-DELTA-004', 'QR-SED-DELTA-004', 'High-speed planting unit'),
('55555555-5555-5555-5555-555555555555', 'Utility Echo', 'Utility Vehicle', 'Kubota RTV-X1140', 'KB1140-2023-005', '2023-05-12', 'active', 'Main Yard', 180, 45.0, 'Gasoline', 'UTL-ECHO-005', 'QR-UTL-ECHO-005', 'Farm utility transport');

-- Insert sample fuel prices
INSERT INTO fuel_prices (fuel_type, price_per_liter, effective_date, location, supplier) VALUES
('Diesel', 1.45, '2025-11-01', 'Local Station A', 'FuelCorp'),
('Diesel', 1.48, '2025-11-08', 'Local Station A', 'FuelCorp'),
('Diesel', 1.42, '2025-11-15', 'Local Station A', 'FuelCorp'),
('Diesel', 1.51, '2025-11-22', 'Local Station A', 'FuelCorp'),
('Gasoline', 1.65, '2025-11-01', 'Local Station B', 'PetroMax'),
('Gasoline', 1.68, '2025-11-08', 'Local Station B', 'PetroMax'),
('Gasoline', 1.62, '2025-11-15', 'Local Station B', 'PetroMax');

-- Insert sample fuel records
INSERT INTO fuel_records (asset_id, date, quantity, price_per_liter, fuel_type, location, odometer_reading, receipt_number, fuel_grade, notes) VALUES
('11111111-1111-1111-1111-111111111111', '2025-11-01', 150.0, 1.45, 'Diesel', 'Local Station A', 12500, 'RCP-2025-001', 'Premium', 'Full tank for field work'),
('22222222-2222-2222-2222-222222222222', '2025-11-03', 200.0, 1.45, 'Diesel', 'Local Station A', 8500, 'RCP-2025-002', 'Premium', 'Harvest season preparation'),
('11111111-1111-1111-1111-111111111111', '2025-11-07', 120.0, 1.48, 'Diesel', 'Local Station A', 12650, 'RCP-2025-003', 'Regular', 'Mid-week refill'),
('33333333-3333-3333-3333-333333333333', '2025-11-10', 80.0, 1.48, 'Diesel', 'Local Station A', 3200, 'RCP-2025-004', 'Premium', 'Spraying operation'),
('55555555-5555-5555-5555-555555555555', '2025-11-14', 25.0, 1.65, 'Gasoline', 'Local Station B', 1800, 'RCP-2025-005', 'Regular', 'Weekly utility runs'),
('22222222-2222-2222-2222-222222222222', '2025-11-18', 180.0, 1.42, 'Diesel', 'Local Station A', 8720, 'RCP-2025-006', 'Premium', 'Extended harvest operation'),
('11111111-1111-1111-1111-111111111111', '2025-11-25', 140.0, 1.42, 'Diesel', 'Local Station A', 12800, 'RCP-2025-007', 'Regular', 'End of month refill');

-- Insert sample operating sessions
INSERT INTO operating_sessions (asset_id, session_start, session_end, initial_fuel_level, final_fuel_level, fuel_consumed, distance_traveled, operating_hours, efficiency_rating, operator_notes) VALUES
('11111111-1111-1111-1111-111111111111', '2025-11-01 08:00:00+00', '2025-11-01 16:00:00+00', 95.0, 75.0, 60.0, 25.5, 8.0, 85.5, 'Field cultivation - North Field'),
('22222222-2222-2222-2222-222222222222', '2025-11-03 07:30:00+00', '2025-11-03 18:00:00+00', 90.0, 65.0, 112.5, 15.8, 10.5, 78.2, 'Corn harvest - Main Field'),
('33333333-3333-3333-3333-333333333333', '2025-11-10 09:00:00+00', '2025-11-10 14:00:00+00', 85.0, 70.0, 30.0, 45.2, 5.0, 92.1, 'Herbicide application - South Field'),
('11111111-1111-1111-1111-111111111111', '2025-11-07 08:30:00+00', '2025-11-07 15:30:00+00', 80.0, 62.0, 54.0, 22.1, 7.0, 87.3, 'Soil preparation - East Field'),
('55555555-5555-5555-5555-555555555555', '2025-11-14 10:00:00+00', '2025-11-14 12:00:00+00', 70.0, 60.0, 4.5, 18.5, 2.0, 88.9, 'Equipment transport'),
('22222222-2222-2222-2222-222222222222', '2025-11-18 06:00:00+00', '2025-11-18 19:00:00+00', 95.0, 55.0, 180.0, 28.3, 13.0, 76.8, 'Extended harvest - Multiple fields');

-- Insert sample predictive maintenance data
INSERT INTO predictive_maintenance (asset_id, component_name, failure_probability, predicted_failure_date, confidence_level, recommended_action, maintenance_priority) VALUES
('11111111-1111-1111-1111-111111111111', 'Engine System', 0.25, '2025-12-15', 0.78, 'Schedule routine engine maintenance', 3),
('11111111-1111-1111-1111-111111111111', 'Hydraulic System', 0.15, '2026-01-20', 0.65, 'Monitor hydraulic fluid levels', 4),
('22222222-2222-2222-2222-222222222222', 'Engine System', 0.45, '2025-12-28', 0.82, 'Schedule comprehensive engine inspection', 2),
('22222222-2222-2222-2222-222222222222', 'Transmission', 0.35, '2026-01-10', 0.71, 'Check transmission fluid and filters', 3),
('33333333-3333-3333-3333-333333333333', 'Pump System', 0.20, '2026-01-05', 0.68, 'Inspect pump seals and pressure', 3),
('44444444-4444-4444-4444-444444444444', 'Engine System', 0.65, '2025-12-15', 0.89, 'Schedule immediate engine overhaul', 1),
('44444444-4444-4444-4444-444444444444', 'Seeding Mechanism', 0.55, '2025-12-20', 0.75, 'Replace worn seeding components', 2),
('55555555-5555-5555-5555-555555555555', 'Engine System', 0.10, '2026-02-01', 0.60, 'Continue normal operations', 4);

-- Update sample data for existing tables to ensure consistency
INSERT INTO inventory_items (sku, name, category, current_stock, min_stock, max_stock, unit, location, status) VALUES
('FUEL-DIESEL-001', 'Diesel Fuel', 'Fuel', 5000, 1000, 10000, 'liters', 'Fuel Storage Tank 1', 'in_stock'),
('FUEL-GAS-001', 'Gasoline', 'Fuel', 800, 200, 2000, 'liters', 'Fuel Storage Tank 2', 'in_stock'),
('OIL-ENG-001', 'Engine Oil 15W-40', 'Lubricants', 50, 10, 100, 'liters', 'Parts Storage', 'in_stock'),
('FILTER-AIR-001', 'Air Filter - Tractor', 'Filters', 12, 5, 25, 'pieces', 'Parts Storage', 'in_stock'),
('FILTER-FUEL-001', 'Fuel Filter - Universal', 'Filters', 8, 3, 20, 'pieces', 'Parts Storage', 'low_stock')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO repair_items (equipment_name, defect_tag, priority, status, description, estimated_cost, assigned_technician, warranty_status, estimated_completion) VALUES
('Tractor Alpha', 'DEF-001', 'medium', 'pending', 'Hydraulic leak in lift cylinder', 450.00, 'Mike Johnson', 'out_of_warranty', '2025-11-10 17:00:00+00'),
('Seeder Delta', 'DEF-002', 'high', 'in_progress', 'Engine overheating issue', 1200.00, 'Sarah Williams', 'in_warranty', '2025-11-15 17:00:00+00'),
('Harvester Beta', 'DEF-003', 'low', 'completed', 'Replace worn belts', 180.00, 'Mike Johnson', 'out_of_warranty', '2025-11-25 17:00:00+00')
ON CONFLICT DO NOTHING;

-- Run the predictive maintenance update function
SELECT update_predictive_maintenance();