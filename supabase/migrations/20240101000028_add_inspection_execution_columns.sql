-- Add columns required for inspection execution functionality
-- This includes creator, signature (JSONB for signature data), and inspector_signature

-- Add creator column to track who created the inspection
DO $
$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'creator'
    ) THEN
    ALTER TABLE inspections ADD COLUMN creator VARCHAR
    (255);
END
IF;
END $$;

-- Add signature column as JSONB to store signature data
-- Structure: { inspector_name: string, signature_data: string (base64), signed_at: string (ISO date) }
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'signature'
    ) THEN
    ALTER TABLE inspections ADD COLUMN signature JSONB DEFAULT NULL;
END
IF;
END $$;

-- Add inspector_signature column as an alternative text field for signature data URL
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inspections' AND column_name = 'inspector_signature'
    ) THEN
    ALTER TABLE inspections ADD COLUMN inspector_signature TEXT DEFAULT NULL;
END
IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN inspections.creator IS 'User who created this inspection';
COMMENT ON COLUMN inspections.signature IS 'JSONB containing inspector signature data: { inspector_name, signature_data (base64), signed_at }';
COMMENT ON COLUMN inspections.inspector_signature IS 'Alternative text field for signature data URL';
