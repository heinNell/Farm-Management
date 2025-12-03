-- Create inspection_templates table
CREATE TABLE
IF NOT EXISTS inspection_templates
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK
(type IN
('safety', 'pre_season', 'compliance', 'maintenance')),
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK
(frequency IN
('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'as_needed')),
  checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now
(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now
()
);

-- Create index for faster lookups
CREATE INDEX
IF NOT EXISTS idx_inspection_templates_type ON inspection_templates
(type);
CREATE INDEX
IF NOT EXISTS idx_inspection_templates_is_active ON inspection_templates
(is_active);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inspection_templates_updated_at
()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now
();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_inspection_templates_updated_at
ON inspection_templates;
CREATE TRIGGER trigger_inspection_templates_updated_at
  BEFORE
UPDATE ON inspection_templates
  FOR EACH ROW
EXECUTE FUNCTION update_inspection_templates_updated_at
();

-- Enable RLS
ALTER TABLE inspection_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for inspection_templates
CREATE POLICY "Enable read access for all users" ON inspection_templates
  FOR
SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON inspection_templates
  FOR
INSERT WITH CHECK
    (true)
;

CREATE POLICY "Enable update for authenticated users" ON inspection_templates
  FOR
UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON inspection_templates
  FOR
DELETE USING (true);

-- Insert some default templates
INSERT INTO inspection_templates
    (name, description, type, frequency, checklist_items, is_active)
VALUES
    (
        'Daily Tractor Pre-Start Check',
        'Standard pre-start safety inspection for tractors before daily operation',
        'safety',
        'daily',
        '[
    {"id": "1", "description": "Check engine oil level", "order": 1},
    {"id": "2", "description": "Check coolant level", "order": 2},
    {"id": "3", "description": "Check hydraulic fluid level", "order": 3},
    {"id": "4", "description": "Inspect tires for damage and correct pressure", "order": 4},
    {"id": "5", "description": "Test lights and indicators", "order": 5},
    {"id": "6", "description": "Check brakes operation", "order": 6},
    {"id": "7", "description": "Inspect seat belt and ROPS", "order": 7},
    {"id": "8", "description": "Check fuel level", "order": 8},
    {"id": "9", "description": "Inspect for leaks under machine", "order": 9},
    {"id": "10", "description": "Test horn and warning devices", "order": 10}
  ]'
::jsonb,
  true
),
(
  'Weekly Equipment Maintenance Check',
  'Weekly maintenance inspection for all farm equipment',
  'maintenance',
  'weekly',
  '[
    {"id": "1", "description": "Grease all fittings", "order": 1},
    {"id": "2", "description": "Check and clean air filters", "order": 2},
    {"id": "3", "description": "Inspect belts for wear and tension", "order": 3},
    {"id": "4", "description": "Check battery condition and connections", "order": 4},
    {"id": "5", "description": "Inspect hoses for cracks or leaks", "order": 5},
    {"id": "6", "description": "Clean radiator and cooling fins", "order": 6},
    {"id": "7", "description": "Check PTO operation", "order": 7},
    {"id": "8", "description": "Inspect three-point hitch", "order": 8}
  ]'::jsonb,
  true
),
(
  'Pre-Season Harvester Inspection',
  'Comprehensive inspection before harvest season',
  'pre_season',
  'annual',
  '[
    {"id": "1", "description": "Inspect and replace worn header components", "order": 1},
    {"id": "2", "description": "Check feeder chain tension and wear", "order": 2},
    {"id": "3", "description": "Inspect concave and rotor for wear", "order": 3},
    {"id": "4", "description": "Check cleaning shoe sieves", "order": 4},
    {"id": "5", "description": "Inspect unloading auger", "order": 5},
    {"id": "6", "description": "Test all sensors and monitors", "order": 6},
    {"id": "7", "description": "Check cab air conditioning", "order": 7},
    {"id": "8", "description": "Inspect tracks/tires for wear", "order": 8},
    {"id": "9", "description": "Change all filters and fluids", "order": 9},
    {"id": "10", "description": "Calibrate yield monitor", "order": 10},
    {"id": "11", "description": "Test GPS/autosteer system", "order": 11},
    {"id": "12", "description": "Inspect fire extinguisher", "order": 12}
  ]'::jsonb,
  true
),
(
  'Annual Compliance Audit',
  'Annual safety and regulatory compliance audit',
  'compliance',
  'annual',
  '[
    {"id": "1", "description": "Verify all ROPS certifications current", "order": 1},
    {"id": "2", "description": "Check fire extinguisher inspection dates", "order": 2},
    {"id": "3", "description": "Verify first aid kit contents", "order": 3},
    {"id": "4", "description": "Review operator training records", "order": 4},
    {"id": "5", "description": "Inspect safety guards and shields", "order": 5},
    {"id": "6", "description": "Check SMV signage on slow vehicles", "order": 6},
    {"id": "7", "description": "Verify chemical storage compliance", "order": 7},
    {"id": "8", "description": "Review maintenance log completeness", "order": 8},
    {"id": "9", "description": "Check emergency shutdown procedures posted", "order": 9},
    {"id": "10", "description": "Verify PPE availability and condition", "order": 10}
  ]'::jsonb,
  true
);

COMMENT ON TABLE inspection_templates IS 'Templates for creating standardized inspections with predefined checklists';
