-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS add_fuel_to_bunker(UUID, DECIMAL, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS withdraw_fuel_from_bunker(UUID, DECIMAL, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS adjust_fuel_bunker_level(UUID, DECIMAL, TEXT, TEXT);

-- Create function to add fuel to bunker
CREATE OR REPLACE FUNCTION add_fuel_to_bunker
(
  p_bunker_id UUID,
  p_quantity DECIMAL,
  p_reference_number TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_performed_by TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_level DECIMAL;
  v_capacity DECIMAL;
  v_new_level DECIMAL;
BEGIN
    -- Get current level and capacity
    SELECT current_level, capacity
    INTO v_current_level
    , v_capacity
  FROM fuel_bunkers
  WHERE id = p_bunker_id
  FOR
    UPDATE;

    IF NOT FOUND THEN
    RAISE EXCEPTION 'Fuel bunker not found';
END
IF;

  -- Calculate new level
  v_new_level := v_current_level + p_quantity;

-- Check capacity
IF v_new_level > v_capacity THEN
    RAISE EXCEPTION 'Adding % L would exceed capacity (% L)', p_quantity, v_capacity;
END
IF;

  -- Update bunker level
  UPDATE fuel_bunkers
  SET 
    current_level = v_new_level,
    last_filled_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = p_bunker_id;

-- Insert transaction record
INSERT INTO fuel_bunker_transactions
    (
    bunker_id,
    transaction_type,
    quantity,
    previous_level,
    new_level,
    reference_number,
    notes,
    performed_by
    )
VALUES
    (
        p_bunker_id,
        'addition',
        p_quantity,
        v_current_level,
        v_new_level,
        p_reference_number,
        p_notes,
        p_performed_by
  );
END;
$$;

-- Create function to withdraw fuel from bunker
CREATE OR REPLACE FUNCTION withdraw_fuel_from_bunker
(
  p_bunker_id UUID,
  p_quantity DECIMAL,
  p_reference_number TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_performed_by TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_level DECIMAL;
  v_new_level DECIMAL;
BEGIN
    -- Get current level
    SELECT current_level
    INTO v_current_level
    FROM fuel_bunkers
    WHERE id = p_bunker_id
    FOR
    UPDATE;

    IF NOT FOUND THEN
    RAISE EXCEPTION 'Fuel bunker not found';
END
IF;

  -- Calculate new level
  v_new_level := v_current_level - p_quantity;

-- Check sufficient fuel
IF v_new_level < 0 THEN
    RAISE EXCEPTION 'Insufficient fuel. Current level: % L, requested: % L', v_current_level, p_quantity;
END
IF;

  -- Update bunker level
  UPDATE fuel_bunkers
  SET 
    current_level = v_new_level,
    updated_at = NOW()
  WHERE id = p_bunker_id;

-- Insert transaction record
INSERT INTO fuel_bunker_transactions
    (
    bunker_id,
    transaction_type,
    quantity,
    previous_level,
    new_level,
    reference_number,
    notes,
    performed_by
    )
VALUES
    (
        p_bunker_id,
        'withdrawal',
        -p_quantity,
        v_current_level,
        v_new_level,
        p_reference_number,
        p_notes,
        p_performed_by
  );
END;
$$;

-- Create function to adjust fuel bunker level
CREATE OR REPLACE FUNCTION adjust_fuel_bunker_level
(
  p_bunker_id UUID,
  p_new_level DECIMAL,
  p_notes TEXT DEFAULT NULL,
  p_performed_by TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_level DECIMAL;
  v_capacity DECIMAL;
  v_quantity_change DECIMAL;
BEGIN
    -- Get current level and capacity
    SELECT current_level, capacity
    INTO v_current_level
    , v_capacity
  FROM fuel_bunkers
  WHERE id = p_bunker_id
  FOR
    UPDATE;

    IF NOT FOUND THEN
    RAISE EXCEPTION 'Fuel bunker not found';
END
IF;

  -- Check capacity
  IF p_new_level > v_capacity THEN
    RAISE EXCEPTION 'New level % L exceeds capacity % L', p_new_level, v_capacity;
END
IF;

  IF p_new_level < 0 THEN
    RAISE EXCEPTION 'New level cannot be negative';
END
IF;

  -- Calculate quantity change
  v_quantity_change := p_new_level - v_current_level;

-- Update bunker level
UPDATE fuel_bunkers
  SET 
    current_level = p_new_level,
    updated_at = NOW()
  WHERE id = p_bunker_id;

-- Insert transaction record
INSERT INTO fuel_bunker_transactions
    (
    bunker_id,
    transaction_type,
    quantity,
    previous_level,
    new_level,
    reference_number,
    notes,
    performed_by
    )
VALUES
    (
        p_bunker_id,
        'adjustment',
        v_quantity_change,
        v_current_level,
        p_new_level,
        NULL,
        p_notes,
        p_performed_by
  );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION add_fuel_to_bunker TO authenticated;
GRANT EXECUTE ON FUNCTION withdraw_fuel_from_bunker TO authenticated;
GRANT EXECUTE ON FUNCTION adjust_fuel_bunker_level TO authenticated;
