-- Create fuel bunkers (storage tanks) table
CREATE TABLE fuel_bunkers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tank_id VARCHAR(50) UNIQUE NOT NULL,
  tank_name VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  description TEXT,
  tank_type VARCHAR(20) DEFAULT 'stationary' CHECK (tank_type IN ('stationary', 'mobile')),
  capacity DECIMAL(10,2) NOT NULL CHECK (capacity > 0),
  current_level DECIMAL(10,2) DEFAULT 0 CHECK (current_level >= 0 AND current_level <= capacity),
  min_level DECIMAL(10,2) CHECK (min_level >= 0),
  fuel_type VARCHAR(50),
  last_filled_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fuel bunker transactions (additions/withdrawals/adjustments)
CREATE TABLE fuel_bunker_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bunker_id UUID REFERENCES fuel_bunkers(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('addition', 'withdrawal', 'adjustment')),
  quantity DECIMAL(10,2) NOT NULL,
  previous_level DECIMAL(10,2),
  new_level DECIMAL(10,2),
  reference_number VARCHAR(50),
  notes TEXT,
  performed_by VARCHAR(100),
  transaction_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add source bunker to fuel records
ALTER TABLE fuel_records
ADD COLUMN source_bunker_id UUID REFERENCES fuel_bunkers(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_fuel_bunkers_status ON fuel_bunkers(status);
CREATE INDEX idx_fuel_bunkers_tank_type ON fuel_bunkers(tank_type);
CREATE INDEX idx_fuel_bunker_transactions_bunker ON fuel_bunker_transactions(bunker_id);
CREATE INDEX idx_fuel_bunker_transactions_date ON fuel_bunker_transactions(transaction_date);
CREATE INDEX idx_fuel_bunker_transactions_type ON fuel_bunker_transactions(transaction_type);
CREATE INDEX idx_fuel_records_source_bunker ON fuel_records(source_bunker_id);

-- Add updated_at trigger for fuel_bunkers
CREATE OR REPLACE FUNCTION update_fuel_bunkers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fuel_bunkers_updated_at
BEFORE UPDATE ON fuel_bunkers
FOR EACH ROW
EXECUTE FUNCTION update_fuel_bunkers_updated_at();

-- Function to add fuel to bunker
CREATE OR REPLACE FUNCTION add_fuel_to_bunker(
  p_bunker_id UUID,
  p_quantity DECIMAL(10,2),
  p_reference_number VARCHAR(50) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_performed_by VARCHAR(100) DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_current_level DECIMAL(10,2);
  v_capacity DECIMAL(10,2);
  v_new_level DECIMAL(10,2);
BEGIN
  -- Get current level and capacity
  SELECT current_level, capacity INTO v_current_level, v_capacity
  FROM fuel_bunkers
  WHERE id = p_bunker_id;

  -- Calculate new level
  v_new_level := v_current_level + p_quantity;

  -- Check if new level exceeds capacity
  IF v_new_level > v_capacity THEN
    RAISE EXCEPTION 'Cannot add fuel: new level (%) exceeds capacity (%)', v_new_level, v_capacity;
  END IF;

  -- Update bunker level
  UPDATE fuel_bunkers
  SET current_level = v_new_level,
      last_filled_date = NOW()
  WHERE id = p_bunker_id;

  -- Record transaction
  INSERT INTO fuel_bunker_transactions (
    bunker_id, transaction_type, quantity, previous_level, new_level,
    reference_number, notes, performed_by
  ) VALUES (
    p_bunker_id, 'addition', p_quantity, v_current_level, v_new_level,
    p_reference_number, p_notes, p_performed_by
  );
END;
$$ LANGUAGE plpgsql;

-- Function to withdraw fuel from bunker
CREATE OR REPLACE FUNCTION withdraw_fuel_from_bunker(
  p_bunker_id UUID,
  p_quantity DECIMAL(10,2),
  p_reference_number VARCHAR(50) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_performed_by VARCHAR(100) DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_current_level DECIMAL(10,2);
  v_new_level DECIMAL(10,2);
BEGIN
  -- Get current level
  SELECT current_level INTO v_current_level
  FROM fuel_bunkers
  WHERE id = p_bunker_id;

  -- Calculate new level
  v_new_level := v_current_level - p_quantity;

  -- Check if sufficient fuel available
  IF v_new_level < 0 THEN
    RAISE EXCEPTION 'Insufficient fuel: current level (%) is less than withdrawal quantity (%)', v_current_level, p_quantity;
  END IF;

  -- Update bunker level
  UPDATE fuel_bunkers
  SET current_level = v_new_level
  WHERE id = p_bunker_id;

  -- Record transaction
  INSERT INTO fuel_bunker_transactions (
    bunker_id, transaction_type, quantity, previous_level, new_level,
    reference_number, notes, performed_by
  ) VALUES (
    p_bunker_id, 'withdrawal', p_quantity, v_current_level, v_new_level,
    p_reference_number, p_notes, p_performed_by
  );
END;
$$ LANGUAGE plpgsql;

-- Function to adjust fuel level (for corrections, leaks, etc.)
CREATE OR REPLACE FUNCTION adjust_fuel_bunker_level(
  p_bunker_id UUID,
  p_new_level DECIMAL(10,2),
  p_notes TEXT DEFAULT NULL,
  p_performed_by VARCHAR(100) DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_current_level DECIMAL(10,2);
  v_capacity DECIMAL(10,2);
  v_quantity DECIMAL(10,2);
BEGIN
  -- Get current level and capacity
  SELECT current_level, capacity INTO v_current_level, v_capacity
  FROM fuel_bunkers
  WHERE id = p_bunker_id;

  -- Check if new level is valid
  IF p_new_level < 0 OR p_new_level > v_capacity THEN
    RAISE EXCEPTION 'Invalid level: must be between 0 and capacity (%)', v_capacity;
  END IF;

  -- Calculate adjustment quantity
  v_quantity := p_new_level - v_current_level;

  -- Update bunker level
  UPDATE fuel_bunkers
  SET current_level = p_new_level
  WHERE id = p_bunker_id;

  -- Record transaction
  INSERT INTO fuel_bunker_transactions (
    bunker_id, transaction_type, quantity, previous_level, new_level,
    notes, performed_by
  ) VALUES (
    p_bunker_id, 'adjustment', v_quantity, v_current_level, p_new_level,
    p_notes, p_performed_by
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE fuel_bunkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_bunker_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for fuel_bunkers
CREATE POLICY "Allow all operations for authenticated users on fuel_bunkers"
ON fuel_bunkers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for fuel_bunker_transactions
CREATE POLICY "Allow all operations for authenticated users on fuel_bunker_transactions"
ON fuel_bunker_transactions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comments
COMMENT ON TABLE fuel_bunkers IS 'Fuel storage tanks (stationary and mobile)';
COMMENT ON TABLE fuel_bunker_transactions IS 'History of all fuel bunker transactions';
COMMENT ON COLUMN fuel_bunkers.tank_type IS 'Type of tank: stationary (fixed) or mobile (truck)';
COMMENT ON COLUMN fuel_bunkers.current_level IS 'Current fuel level in liters';
COMMENT ON COLUMN fuel_bunkers.capacity IS 'Maximum capacity in liters';
COMMENT ON COLUMN fuel_bunker_transactions.transaction_type IS 'Type: addition (fuel delivered), withdrawal (fuel dispensed), adjustment (manual correction)';
