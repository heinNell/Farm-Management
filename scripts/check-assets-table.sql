-- Check assets table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'assets'
ORDER BY ordinal_position;

-- Check if there are any assets
SELECT COUNT(*) as asset_count
FROM assets;

-- Show sample assets
SELECT id, name, type, status
FROM assets LIMIT
5;
