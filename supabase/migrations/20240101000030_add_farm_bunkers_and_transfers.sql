-- Add farm_id to fuel_bunkers to link bunkers to specific farms
ALTER TABLE fuel_bunkers
ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES farms(id) ON DELETE SET NULL;

-- Create index for farm-based bunker lookups
CREATE INDEX IF NOT EXISTS idx_fuel_bunkers_farm_id ON fuel_bunkers(farm_id);

-- Add transfer transaction type to fuel_bunker_transactions
ALTER TABLE fuel_bunker_transactions
DROP CONSTRAINT IF EXISTS fuel_bunker_transactions_transaction_type_check;

ALTER TABLE fuel_bunker_transactions
ADD CONSTRAINT fuel_bunker_transactions_transaction_type_check 
CHECK (transaction_type IN ('addition', 'withdrawal', 'adjustment', 'transfer_in', 'transfer_out'));

-- Add related transaction reference for transfers
ALTER TABLE fuel_bunker_transactions
ADD COLUMN IF NOT EXISTS related_bunker_id UUID REFERENCES fuel_bunkers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS related_transaction_id UUID REFERENCES fuel_bunker_transactions(id) ON DELETE SET NULL;

-- Create function to transfer fuel between bunkers
CREATE OR REPLACE FUNCTION transfer_fuel_between_bunkers(
  p_source_bunker_id UUID,
  p_destination_bunker_id UUID,
  p_quantity DECIMAL,
  p_notes TEXT DEFAULT NULL,
  p_performed_by TEXT DEFAULT NULL
)
RETURNS TABLE (
  source_transaction_id UUID,
  destination_transaction_id UUID,
  quantity_transferred DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_source_current_level DECIMAL;
  v_source_new_level DECIMAL;
  v_dest_current_level DECIMAL;
  v_dest_capacity DECIMAL;
  v_dest_new_level DECIMAL;
  v_source_txn_id UUID;
  v_dest_txn_id UUID;
BEGIN
  -- Validate quantity
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Transfer quantity must be greater than 0';
  END IF;

  -- Validate bunkers are different
  IF p_source_bunker_id = p_destination_bunker_id THEN
    RAISE EXCEPTION 'Source and destination bunkers must be different';
  END IF;

  -- Get source bunker level with lock
  SELECT current_level INTO v_source_current_level
  FROM fuel_bunkers
  WHERE id = p_source_bunker_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source bunker not found';
  END IF;

  -- Check sufficient fuel in source
  v_source_new_level := v_source_current_level - p_quantity;
  IF v_source_new_level < 0 THEN
    RAISE EXCEPTION 'Insufficient fuel in source bunker. Current level: % L, requested: % L', v_source_current_level, p_quantity;
  END IF;

  -- Get destination bunker level and capacity with lock
  SELECT current_level, capacity INTO v_dest_current_level, v_dest_capacity
  FROM fuel_bunkers
  WHERE id = p_destination_bunker_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Destination bunker not found';
  END IF;

  -- Check destination capacity
  v_dest_new_level := v_dest_current_level + p_quantity;
  IF v_dest_new_level > v_dest_capacity THEN
    RAISE EXCEPTION 'Transfer would exceed destination bunker capacity. Available space: % L, transfer: % L', (v_dest_capacity - v_dest_current_level), p_quantity;
  END IF;

  -- Update source bunker
  UPDATE fuel_bunkers
  SET 
    current_level = v_source_new_level,
    updated_at = NOW()
  WHERE id = p_source_bunker_id;

  -- Update destination bunker
  UPDATE fuel_bunkers
  SET 
    current_level = v_dest_new_level,
    last_filled_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = p_destination_bunker_id;

  -- Create source transaction (transfer out)
  INSERT INTO fuel_bunker_transactions (
    bunker_id, transaction_type, quantity, previous_level, new_level,
    notes, performed_by, related_bunker_id
  ) VALUES (
    p_source_bunker_id, 'transfer_out', -p_quantity, v_source_current_level, v_source_new_level,
    p_notes, p_performed_by, p_destination_bunker_id
  )
  RETURNING id INTO v_source_txn_id;

  -- Create destination transaction (transfer in)
  INSERT INTO fuel_bunker_transactions (
    bunker_id, transaction_type, quantity, previous_level, new_level,
    notes, performed_by, related_bunker_id, related_transaction_id
  ) VALUES (
    p_destination_bunker_id, 'transfer_in', p_quantity, v_dest_current_level, v_dest_new_level,
    p_notes, p_performed_by, p_source_bunker_id, v_source_txn_id
  )
  RETURNING id INTO v_dest_txn_id;

  -- Update source transaction with related transaction id
  UPDATE fuel_bunker_transactions
  SET related_transaction_id = v_dest_txn_id
  WHERE id = v_source_txn_id;

  -- Return transaction details
  RETURN QUERY SELECT v_source_txn_id, v_dest_txn_id, p_quantity;
END;
$$;

-- Create function to withdraw fuel from bunker for fuel record (called during fuel record creation)
CREATE OR REPLACE FUNCTION withdraw_fuel_for_record(
  p_bunker_id UUID,
  p_quantity DECIMAL,
  p_fuel_record_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_performed_by TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_level DECIMAL;
  v_new_level DECIMAL;
  v_txn_id UUID;
BEGIN
  -- Get current level with lock
  SELECT current_level INTO v_current_level
  FROM fuel_bunkers
  WHERE id = p_bunker_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fuel bunker not found';
  END IF;

  -- Calculate new level
  v_new_level := v_current_level - p_quantity;

  -- Check sufficient fuel
  IF v_new_level < 0 THEN
    RAISE EXCEPTION 'Insufficient fuel in bunker. Current level: % L, requested: % L', v_current_level, p_quantity;
  END IF;

  -- Update bunker level
  UPDATE fuel_bunkers
  SET 
    current_level = v_new_level,
    updated_at = NOW()
  WHERE id = p_bunker_id;

  -- Insert transaction record
  INSERT INTO fuel_bunker_transactions (
    bunker_id, transaction_type, quantity, previous_level, new_level,
    reference_number, notes, performed_by
  ) VALUES (
    p_bunker_id, 'withdrawal', -p_quantity, v_current_level, v_new_level,
    p_fuel_record_id::TEXT, p_notes, p_performed_by
  )
  RETURNING id INTO v_txn_id;

  RETURN v_txn_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION transfer_fuel_between_bunkers TO authenticated;
GRANT EXECUTE ON FUNCTION withdraw_fuel_for_record TO authenticated;

-- Insert sample bunkers for each farm (if farms exist)
INSERT INTO fuel_bunkers (tank_id, tank_name, location, tank_type, capacity, current_level, min_level, fuel_type, status, farm_id)
SELECT 
  'TANK-' || UPPER(SUBSTRING(f.name, 1, 3)) || '-001',
  f.name || ' Main Tank',
  f.name,
  'stationary',
  10000,
  5000,
  1000,
  'diesel',
  'active',
  f.id
FROM farms f
WHERE NOT EXISTS (
  SELECT 1 FROM fuel_bunkers fb WHERE fb.farm_id = f.id
)
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON FUNCTION transfer_fuel_between_bunkers IS 'Transfers fuel from one bunker to another with full transaction logging';
COMMENT ON FUNCTION withdraw_fuel_for_record IS 'Withdraws fuel from a bunker when creating a fuel record';
COMMENT ON COLUMN fuel_bunkers.farm_id IS 'Links the bunker to a specific farm for farm-based fuel management';
