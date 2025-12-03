-- Script to delete sample fuel data
-- This will remove the seed data that was inserted by migrations
-- Run this in Supabase SQL Editor

-- Delete sample operating sessions (before November 2025)
DELETE FROM operating_sessions 
WHERE session_start < '2025-11-01';

-- Delete sample fuel records (before November 2025)
DELETE FROM fuel_records 
WHERE date < '2025-11-01';

-- Delete sample fuel prices (before November 2025)
DELETE FROM fuel_prices 
WHERE effective_date < '2025-11-01';

-- Verify the deletion
    SELECT 'Operating Sessions remaining:' as table_name, COUNT(*) as count
    FROM operating_sessions
UNION ALL
    SELECT 'Fuel Records remaining:', COUNT(*)
    FROM fuel_records
UNION ALL
    SELECT 'Fuel Prices remaining:', COUNT(*)
    FROM fuel_prices;
