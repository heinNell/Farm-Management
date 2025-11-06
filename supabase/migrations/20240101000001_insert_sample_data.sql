
-- Insert sample data for inventory_items
INSERT INTO inventory_items (sku, name, category, current_stock, min_stock, max_stock, unit, location, status) VALUES
('TOOL-001', 'Hydraulic Jack', 'Tools', 5, 2, 10, 'pieces', 'Main Workshop', 'in_stock'),
('TOOL-002', 'Wrench Set', 'Tools', 1, 3, 15, 'sets', 'Tool Shed A', 'low_stock'),
('PART-001', 'Engine Oil Filter', 'Parts', 0, 5, 25, 'pieces', 'Parts Storage', 'out_of_stock'),
('PART-002', 'Hydraulic Hose', 'Parts', 12, 3, 20, 'meters', 'Parts Storage', 'in_stock'),
('CHEM-001', 'Engine Oil 15W-40', 'Chemicals', 8, 4, 30, 'liters', 'Chemical Storage', 'in_stock'),
('SEED-001', 'Corn Seeds Premium', 'Seeds', 50, 10, 100, 'kg', 'Seed Storage', 'in_stock');

-- Insert sample data for repair_items
INSERT INTO repair_items (equipment_name, defect_tag, priority, status, description, estimated_cost, assigned_technician, warranty_status, estimated_completion) VALUES
('John Deere 6120M', 'HYDR-001', 'high', 'in_progress', 'Hydraulic system leak in main cylinder', 1250.00, 'Mike Johnson', 'out_of_warranty', '2024-01-15 16:00:00+00'),
('Case IH Magnum 340', 'ENG-002', 'medium', 'pending', 'Engine overheating issue, coolant system check needed', 800.00, 'Sarah Wilson', 'in_warranty', '2024-01-20 10:00:00+00'),
('New Holland T7.270', 'TRANS-003', 'low', 'completed', 'Transmission fluid replacement and filter change', 450.00, 'Tom Brown', 'extended', '2024-01-10 14:00:00+00'),
('Kubota M7-172', 'ELEC-004', 'high', 'pending', 'Electrical system malfunction, dashboard warning lights', 950.00, 'Mike Johnson', 'in_warranty', '2024-01-18 12:00:00+00');

-- Insert sample data for job_cards
INSERT INTO job_cards (title, description, priority, status, assigned_to, location, estimated_hours, due_date, tags) VALUES
('Tractor Maintenance - JD 6120M', 'Complete 500-hour service including oil change, filter replacement, and system checks', 'high', 'in_progress', 'Mike Johnson', 'Main Workshop Bay 1', 8, '2024-01-15 17:00:00+00', ARRAY['maintenance', 'tractor', 'scheduled']),
('Planter Calibration', 'Calibrate seed planter for spring season, check seed spacing and depth settings', 'medium', 'todo', 'Sarah Wilson', 'Equipment Shed B', 4, '2024-01-25 12:00:00+00', ARRAY['calibration', 'planter', 'spring-prep']),
('Sprayer Tank Cleaning', 'Deep clean sprayer tank and lines, prepare for herbicide application', 'medium', 'review', 'Tom Brown', 'Wash Bay', 3, '2024-01-12 15:00:00+00', ARRAY['cleaning', 'sprayer', 'preparation']),
('Combine Header Inspection', 'Inspect combine header for wear, replace worn parts before harvest', 'low', 'completed', 'Mike Johnson', 'Storage Building C', 6, '2024-01-08 16:00:00+00', ARRAY['inspection', 'combine', 'harvest-prep']);

-- Insert sample data for inspections
INSERT INTO inspections (title, type, inspector, status, progress, score, scheduled_date, checklist_items) VALUES
('Workshop Safety Audit', 'safety', 'John Smith', 'completed', 100, 92, '2024-01-05 09:00:00+00', 
 '[
   {"id": "1", "description": "Fire extinguisher accessibility", "completed": true, "notes": "All extinguishers accessible and charged"},
   {"id": "2", "description": "Emergency exit clear", "completed": true, "notes": "All exits clearly marked and unobstructed"},
   {"id": "3", "description": "First aid kit stocked", "completed": true, "notes": "Kit fully stocked, expires 2025-06"},
   {"id": "4", "description": "Hazardous material storage", "completed": false, "notes": "Chemical storage area needs better ventilation"}
 ]'::jsonb),
('Pre-Season Equipment Check', 'pre_season', 'Sarah Wilson', 'in_progress', 65, 0, '2024-01-10 08:00:00+00',
 '[
   {"id": "1", "description": "Tractor fluid levels", "completed": true, "notes": "All levels checked and topped off"},
   {"id": "2", "description": "Implement attachment points", "completed": true, "notes": "All pins and connections inspected"},
   {"id": "3", "description": "Tire pressure and condition", "completed": false, "notes": "Need to check rear tires on JD 6120M"},
   {"id": "4", "description": "Hydraulic system operation", "completed": false, "notes": "Pending repair completion"}
 ]'::jsonb),
('Environmental Compliance', 'compliance', 'Tom Brown', 'scheduled', 0, 0, '2024-01-20 13:00:00+00',
 '[
   {"id": "1", "description": "Chemical storage compliance", "completed": false},
   {"id": "2", "description": "Waste disposal records", "completed": false},
   {"id": "3", "description": "Spill prevention measures", "completed": false},
   {"id": "4", "description": "Documentation review", "completed": false}
 ]'::jsonb);

-- Insert sample data for maintenance_schedules
INSERT INTO maintenance_schedules (equipment_name, maintenance_type, interval_type, interval_value, current_hours, next_due_date, priority, assigned_technician, status, failure_probability) VALUES
('John Deere 6120M', 'Engine Oil Change', 'hours', 250, 240, '2024-01-15 08:00:00+00', 'high', 'Mike Johnson', 'overdue', 15.5),
('Case IH Magnum 340', 'Hydraulic Filter Replacement', 'hours', 500, 450, '2024-02-01 10:00:00+00', 'medium', 'Sarah Wilson', 'scheduled', 8.2),
('New Holland T7.270', 'Transmission Service', 'hours', 1000, 850, '2024-03-15 14:00:00+00', 'low', 'Tom Brown', 'scheduled', 5.1),
('Kubota M7-172', 'Annual Safety Inspection', 'calendar', 365, NULL, '2024-01-30 09:00:00+00', 'high', 'Mike Johnson', 'scheduled', 12.8),
('John Deere 9600 Combine', 'Pre-Harvest Service', 'calendar', 180, NULL, '2024-06-01 08:00:00+00', 'medium', 'Sarah Wilson', 'scheduled', 7.3);

-- Insert sample data for stock_items
INSERT INTO stock_items (item_name, category, supplier, unit_price, quantity_on_hand, reorder_level, reorder_quantity, location, notes) VALUES
('Diesel Fuel', 'Fuel', 'Local Fuel Co.', 1.45, 500, 100, 1000, 'Fuel Tank 1', 'Monitor for water contamination'),
('Hydraulic Fluid ISO 46', 'Fluids', 'Farm Supply Plus', 12.50, 25, 10, 50, 'Chemical Storage', 'Temperature sensitive storage'),
('Grease - Multi-Purpose', 'Lubricants', 'Equipment Parts Inc.', 8.75, 15, 5, 25, 'Workshop Storage', 'High temperature grease'),
('Air Filter - Universal', 'Filters', 'Filter World', 25.00, 8, 3, 15, 'Parts Room A', 'Fits most tractors'),
('Spark Plugs - NGK', 'Electrical', 'Auto Parts Direct', 4.50, 20, 8, 30, 'Parts Room B', 'Various heat ranges available'),
('Welding Rod 7018', 'Welding Supplies', 'Welding Supply Co.', 45.00, 3, 5, 10, 'Welding Shop', 'Keep dry, rotate stock');
