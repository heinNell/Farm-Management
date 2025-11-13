-- Fix the update_updated_at_column function to use correct field name
DROP TRIGGER IF EXISTS update_assets_updated_at
ON assets;

-- Recreate the function with correct field name
CREATE OR REPLACE FUNCTION update_updated_at_column
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW
();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_assets_updated_at 
    BEFORE
UPDATE ON assets 
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
