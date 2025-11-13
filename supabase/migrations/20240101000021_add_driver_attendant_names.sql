-- Add driver_name and attendant_name columns to fuel_records table
ALTER TABLE fuel_records 
ADD COLUMN
IF NOT EXISTS driver_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS attendant_name VARCHAR
(255);

-- Add indexes for searching by driver or attendant
CREATE INDEX
IF NOT EXISTS idx_fuel_records_driver_name ON fuel_records
(driver_name);
CREATE INDEX
IF NOT EXISTS idx_fuel_records_attendant_name ON fuel_records
(attendant_name);

-- Add comment explaining the fields
COMMENT ON COLUMN fuel_records.driver_name IS 'Name of the driver who received the fuel';
COMMENT ON COLUMN fuel_records.attendant_name IS 'Name of the filling station attendant';
