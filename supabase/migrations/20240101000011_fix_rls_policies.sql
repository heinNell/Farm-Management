-- Ensure RLS policies are correctly set up for all tables

-- Assets table
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON assets;
DROP POLICY IF EXISTS "Enable read access for all users" ON assets;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON assets;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON assets;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON assets;

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies
CREATE POLICY "Enable read access for all users" ON assets
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON assets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON assets
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON assets
    FOR DELETE USING (auth.role() = 'authenticated');

-- Farms table
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON farms;
DROP POLICY IF EXISTS "Enable read access for all users" ON farms;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON farms;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON farms;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON farms;

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON farms
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON farms
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON farms
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON farms
    FOR DELETE USING (auth.role() = 'authenticated');

-- Fuel records table
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON fuel_records;
DROP POLICY IF EXISTS "Enable read access for all users" ON fuel_records;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON fuel_records;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON fuel_records;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON fuel_records;

ALTER TABLE fuel_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON fuel_records
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON fuel_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON fuel_records
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON fuel_records
    FOR DELETE USING (auth.role() = 'authenticated');
