-- Create maintenance_alerts table for tracking maintenance notifications
CREATE TABLE IF NOT EXISTS maintenance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('upcoming', 'overdue', 'critical')),
    message TEXT NOT NULL,
    hours_until_due DECIMAL(10, 1),
    days_until_due DECIMAL(10, 1),
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by TEXT,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_schedule_id ON maintenance_alerts(schedule_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_acknowledged ON maintenance_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_alert_type ON maintenance_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_created_at ON maintenance_alerts(created_at DESC);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_unack_type 
ON maintenance_alerts(acknowledged, alert_type) 
WHERE acknowledged = FALSE;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_maintenance_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_alerts_updated_at
    BEFORE UPDATE ON maintenance_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_maintenance_alerts_updated_at();

-- Enable Row Level Security
ALTER TABLE maintenance_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all authenticated users"
ON maintenance_alerts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for all authenticated users"
ON maintenance_alerts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for all authenticated users"
ON maintenance_alerts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Enable delete access for all authenticated users"
ON maintenance_alerts FOR DELETE
TO authenticated
USING (true);

-- Add comment
COMMENT ON TABLE maintenance_alerts IS 'Tracks maintenance schedule alerts and notifications';
