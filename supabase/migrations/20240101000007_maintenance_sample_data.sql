-- Enhanced Maintenance Sample Data Migration
-- File: supabase/migrations/20240101000007_maintenance_sample_data.sql

-- Insert sample maintenance templates
INSERT INTO maintenance_templates (id, name, description, maintenance_type, category, interval_type, interval_value, estimated_duration, priority, required_parts, required_tools, instructions, safety_notes) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Engine Oil Change', 'Regular engine oil and filter replacement', 'Oil Change', 'engine', 'hours', 250, 2.0, 'medium', 
 ARRAY['Engine Oil 15W-40', 'Oil Filter', 'Oil Drain Plug Gasket'], 
 ARRAY['Oil Drain Pan', 'Socket Wrench Set', 'Oil Filter Wrench', 'Funnel'],
 'Warm up engine, drain old oil, replace filter, refill with new oil, check levels',
 'Ensure engine is warm but not hot. Wear safety glasses and gloves. Dispose of used oil properly.'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hydraulic System Inspection', 'Check hydraulic fluid levels, hoses, and connections', 'Inspection', 'hydraulics', 'hours', 100, 1.5, 'high',
 ARRAY['Hydraulic Fluid', 'Hydraulic Hose Clamps'],
 ARRAY['Pressure Gauge', 'Leak Detection Kit', 'Torque Wrench'],
 'Check fluid levels, inspect all hoses for wear, test system pressure, check for leaks',
 'System must be depressurized before inspection. Use proper PPE when handling hydraulic fluid.'),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Air Filter Replacement', 'Replace engine and cabin air filters', 'Filter Replacement', 'engine', 'months', 3, 0.5, 'low',
 ARRAY['Engine Air Filter', 'Cabin Air Filter'],
 ARRAY['Screwdriver Set', 'Compressed Air'],
 'Remove old filters, clean filter housing, install new filters, ensure proper seating',
 'Check filter orientation markings. Do not over-tighten filter housing.'),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Belt and Chain Inspection', 'Inspect drive belts and chains for wear and proper tension', 'Inspection', 'mechanical', 'weeks', 2, 1.0, 'medium',
 ARRAY['Drive Belts', 'Chain Lubricant'],
 ARRAY['Belt Tension Gauge', 'Chain Wear Gauge', 'Grease Gun'],
 'Check belt tension and condition, inspect chains for wear, lubricate as needed',
 'Engine must be off and cool. Keep hands away from moving parts.'),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Comprehensive Safety Inspection', 'Complete safety system check including lights, brakes, and emergency equipment', 'Safety Inspection', 'safety', 'months', 6, 4.0, 'critical',
 ARRAY['Light Bulbs', 'Brake Fluid', 'Safety Equipment'],
 ARRAY['Multimeter', 'Brake Pressure Tester', 'Safety Checklist'],
 'Test all lights and electrical systems, check brake operation, inspect safety equipment',
 'Follow lockout/tagout procedures. Test emergency stops and safety systems thoroughly.');

-- Insert sample maintenance schedules
INSERT INTO maintenance_schedules (id, template_id, asset_id, title, description, maintenance_type, category, interval_type, interval_value, next_due_date, last_completed_date, status, priority, assigned_technician, estimated_duration, current_hours, hours_at_last_service, required_parts, required_tools, instructions, safety_notes) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Tractor Alpha - Oil Change', 'Scheduled engine oil change for primary tractor', 'Oil Change', 'engine', 'hours', 250, '2025-11-25 09:00:00+00', '2025-11-05 09:00:00+00', 'due', 'medium', 'Mike Johnson', 2.0, 1250, 1000, 
 ARRAY['Engine Oil 15W-40', 'Oil Filter', 'Oil Drain Plug Gasket'], 
 ARRAY['Oil Drain Pan', 'Socket Wrench Set', 'Oil Filter Wrench', 'Funnel'],
 'Warm up engine, drain old oil, replace filter, refill with new oil, check levels',
 'Ensure engine is warm but not hot. Wear safety glasses and gloves. Dispose of used oil properly.'),

('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Harvester Beta - Hydraulic Check', 'Monthly hydraulic system inspection', 'Inspection', 'hydraulics', 'hours', 100, '2025-11-28 14:00:00+00', '2025-11-20 14:00:00+00', 'scheduled', 'high', 'Sarah Williams', 1.5, 850, 750,
 ARRAY['Hydraulic Fluid', 'Hydraulic Hose Clamps'],
 ARRAY['Pressure Gauge', 'Leak Detection Kit', 'Torque Wrench'],
 'Check fluid levels, inspect all hoses for wear, test system pressure, check for leaks',
 'System must be depressurized before inspection. Use proper PPE when handling hydraulic fluid.'),

('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Sprayer Gamma - Air Filter Service', 'Quarterly air filter replacement', 'Filter Replacement', 'engine', 'months', 3, '2025-11-20 10:00:00+00', '2025-11-10 10:00:00+00', 'overdue', 'low', 'David Brown', 0.5, 320, 300,
 ARRAY['Engine Air Filter', 'Cabin Air Filter'],
 ARRAY['Screwdriver Set', 'Compressed Air'],
 'Remove old filters, clean filter housing, install new filters, ensure proper seating',
 'Check filter orientation markings. Do not over-tighten filter housing.'),

('44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'Seeder Delta - Belt Inspection', 'Bi-weekly belt and chain check', 'Inspection', 'mechanical', 'weeks', 2, '2025-11-25 08:00:00+00', '2025-11-11 08:00:00+00', 'in_progress', 'medium', 'Tom Anderson', 1.0, 1850, 1850,
 ARRAY['Drive Belts', 'Chain Lubricant'],
 ARRAY['Belt Tension Gauge', 'Chain Wear Gauge', 'Grease Gun'],
 'Check belt tension and condition, inspect chains for wear, lubricate as needed',
 'Engine must be off and cool. Keep hands away from moving parts.'),

('55555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'Utility Echo - Safety Inspection', 'Semi-annual comprehensive safety check', 'Safety Inspection', 'safety', 'months', 6, '2025-12-12 13:00:00+00', '2025-11-12 13:00:00+00', 'scheduled', 'critical', 'Mike Johnson', 4.0, 180, 150,
 ARRAY['Light Bulbs', 'Brake Fluid', 'Safety Equipment'],
 ARRAY['Multimeter', 'Brake Pressure Tester', 'Safety Checklist'],
 'Test all lights and electrical systems, check brake operation, inspect safety equipment',
 'Follow lockout/tagout procedures. Test emergency stops and safety systems thoroughly.');

-- Insert sample maintenance history
INSERT INTO maintenance_history (id, schedule_id, asset_id, template_id, maintenance_type, title, description, scheduled_date, started_at, completed_at, duration_hours, performed_by, supervised_by, work_performed, parts_used, tools_used, completion_status, findings, issues_found, recommendations, quality_rating, compliance_verified, labor_cost, parts_cost, equipment_condition_before, equipment_condition_after, hours_at_maintenance, photos, follow_up_required, follow_up_notes) VALUES
('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Oil Change', 'Tractor Alpha - Oil Change', 'Previous oil change service', '2025-11-05 09:00:00+00', '2025-11-05 09:15:00+00', '2025-11-05 11:30:00+00', 2.25, 'Mike Johnson', 'Sarah Williams', 'Drained old oil (12.5L), replaced oil filter, installed new drain plug gasket, filled with 13L fresh 15W-40 oil', 
 '[{"name": "Engine Oil 15W-40", "quantity": 13, "unit": "liters", "cost": 78.00, "part_number": "EO-15W40-13L"}, {"name": "Oil Filter", "quantity": 1, "unit": "piece", "cost": 24.50, "part_number": "OF-JD8R-001"}]'::jsonb,
 ARRAY['Oil Drain Pan', 'Socket Wrench Set', 'Oil Filter Wrench', 'Funnel', 'Torque Wrench'],
 'completed', 'Oil was dark but not contaminated. Filter was moderately dirty.', 'None', 'Continue with standard 250-hour intervals. Monitor for any leaks.', 5, true, 120.00, 102.50, 'good', 'excellent', 1000, 
 ARRAY['https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg'], false, NULL),

('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Inspection', 'Harvester Beta - Hydraulic Check', 'Previous hydraulic system inspection', '2025-11-20 14:00:00+00', '2025-11-20 14:10:00+00', '2025-11-20 15:45:00+00', 1.58, 'Sarah Williams', NULL, 'Checked all hydraulic fluid levels, inspected hoses and fittings, tested system pressure at 2800 PSI, no leaks detected', 
 '[{"name": "Hydraulic Fluid", "quantity": 2, "unit": "liters", "cost": 32.00, "part_number": "HF-AW68-2L"}]'::jsonb,
 ARRAY['Pressure Gauge', 'Leak Detection Kit', 'Fluid Test Kit'],
 'completed', 'System operating within normal parameters. Fluid clean and at proper level.', 'Minor wear on hydraulic hose #3, recommend monitoring', 'Schedule hose replacement in next 100 hours', 4, true, 95.00, 32.00, 'good', 'good', 750,
 ARRAY['https://images.pexels.com/photos/5691636/pexels-photo-5691636.jpeg'], true, 'Monitor hydraulic hose #3 for wear progression'),

('cccccccc-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Filter Replacement', 'Sprayer Gamma - Air Filter Service', 'Previous air filter replacement', '2025-11-10 10:00:00+00', '2025-11-10 10:05:00+00', '2025-11-10 10:35:00+00', 0.5, 'David Brown', NULL, 'Removed and replaced engine air filter and cabin air filter, cleaned filter housing, checked air intake system', 
 '[{"name": "Engine Air Filter", "quantity": 1, "unit": "piece", "cost": 28.75, "part_number": "AF-AP1250-ENG"}, {"name": "Cabin Air Filter", "quantity": 1, "unit": "piece", "cost": 15.25, "part_number": "AF-AP1250-CAB"}]'::jsonb,
 ARRAY['Screwdriver Set', 'Compressed Air', 'Shop Vacuum'],
 'completed', 'Old filters were moderately dirty but not clogged. Air intake system clean.', 'None', 'Continue with quarterly replacement schedule', 5, true, 30.00, 44.00, 'good', 'good', 300,
 ARRAY[], false, NULL);

-- Insert sample maintenance notifications
INSERT INTO maintenance_notifications (id, schedule_id, asset_id, notification_type, priority, title, message, delivery_channels, recipients, status, scheduled_send_time, sent_at, delivered_at, delivery_results, context_data) VALUES
('aaaaaaaa-aaaa-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'due_soon', 'medium', 'Due Soon: Tractor Alpha - Oil Change', 'Maintenance for Tractor Alpha is due in 24 hours. Please schedule completion.', 
 ARRAY['in_app', 'email'], ARRAY['Mike Johnson', 'maintenance@farm.com'], 'delivered', '2025-11-24 09:00:00+00', '2025-11-24 09:02:00+00', '2025-11-24 09:05:00+00',
 '{"in_app": {"status": "delivered", "timestamp": "2025-11-24T09:03:00Z"}, "email": {"status": "delivered", "timestamp": "2025-11-24T09:05:00Z"}}'::jsonb,
 '{"asset_name": "Tractor Alpha", "hours_until_due": 24, "maintenance_type": "Oil Change"}'::jsonb),

('bbbbbbbb-bbbb-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'overdue', 'low', 'OVERDUE: Sprayer Gamma - Air Filter Service', 'Maintenance for Sprayer Gamma is 8 days overdue. Please complete as soon as possible.', 
 ARRAY['in_app', 'email', 'sms'], ARRAY['David Brown', 'maintenance@farm.com'], 'delivered', '2025-11-28 08:00:00+00', '2025-11-28 08:01:00+00', '2025-11-28 08:03:00+00',
 '{"in_app": {"status": "delivered", "timestamp": "2025-11-28T08:01:00Z"}, "email": {"status": "delivered", "timestamp": "2025-11-28T08:02:00Z"}, "sms": {"status": "delivered", "timestamp": "2025-11-28T08:03:00Z"}}'::jsonb,
 '{"asset_name": "Sprayer Gamma", "days_overdue": 8, "maintenance_type": "Filter Replacement"}'::jsonb),

('cccccccc-cccc-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'in_progress', 'medium', 'In Progress: Seeder Delta - Belt Inspection', 'Maintenance for Seeder Delta is currently in progress by Tom Anderson.', 
 ARRAY['in_app'], ARRAY['maintenance@farm.com'], 'delivered', '2025-11-24 08:30:00+00', '2025-11-24 08:31:00+00', '2025-11-24 08:31:00+00',
 '{"in_app": {"status": "delivered", "timestamp": "2025-11-24T08:31:00Z"}}'::jsonb,
 '{"asset_name": "Seeder Delta", "technician": "Tom Anderson", "maintenance_type": "Inspection"}'::jsonb);

-- Insert sample calendar events
INSERT INTO maintenance_calendar_events (id, schedule_id, asset_id, title, description, event_type, start_time, end_time, assigned_to, location, status, color, recurrence_rule) VALUES
('aaaaaaaa-aaaa-aaaa-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Tractor Alpha - Oil Change', 'Scheduled engine oil change for primary tractor', 'maintenance', '2025-11-05 09:00:00+00', '2025-11-05 11:00:00+00', 'Mike Johnson', 'Workshop Bay 1', 'scheduled', '#2563EB', NULL),

('bbbbbbbb-bbbb-bbbb-2222-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Harvester Beta - Hydraulic Check', 'Monthly hydraulic system inspection', 'maintenance', '2025-11-28 14:00:00+00', '2025-11-28 15:30:00+00', 'Sarah Williams', 'Field Service', 'scheduled', '#EA580C', NULL),

('cccccccc-cccc-cccc-3333-333333333333', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Sprayer Gamma - Air Filter Service', 'Quarterly air filter replacement (OVERDUE)', 'maintenance', '2025-11-20 10:00:00+00', '2025-11-20 10:30:00+00', 'David Brown', 'Workshop Bay 2', 'confirmed', '#DC2626', NULL),

('dddddddd-dddd-dddd-4444-444444444444', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Seeder Delta - Belt Inspection', 'Bi-weekly belt and chain check (IN PROGRESS)', 'maintenance', '2025-11-25 08:00:00+00', '2025-11-25 09:00:00+00', 'Tom Anderson', 'Workshop Bay 3', 'in_progress', '#2563EB', NULL),

('eeeeeeee-eeee-eeee-5555-555555555555', '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Utility Echo - Safety Inspection', 'Semi-annual comprehensive safety check', 'maintenance', '2025-11-12 13:00:00+00', '2025-11-12 17:00:00+00', 'Mike Johnson', 'Safety Inspection Area', 'scheduled', '#DC2626', NULL);

-- Update maintenance status based on current dates
SELECT update_maintenance_status();

-- Generate initial notifications
SELECT generate_maintenance_notifications();
