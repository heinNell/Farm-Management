-- Enhanced Maintenance Scheduling System Migration
-- File: supabase/migrations/20240101000006_enhanced_maintenance_system.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create maintenance_templates table for recurring maintenance task templates
CREATE TABLE IF NOT EXISTS maintenance_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    maintenance_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    interval_type VARCHAR(20) NOT NULL CHECK (interval_type IN ('hours', 'days', 'weeks', 'months', 'calendar')),
    interval_value INTEGER NOT NULL CHECK (interval_value > 0),
    estimated_duration DECIMAL(4,2) DEFAULT 1.0, -- in hours
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    required_parts TEXT[], -- Array of part names/SKUs
    required_tools TEXT[], -- Array of tool names
    instructions TEXT,
    safety_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create enhanced maintenance_schedules table
CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES maintenance_templates(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    maintenance_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    
    -- Scheduling configuration
    interval_type VARCHAR(20) NOT NULL CHECK (interval_type IN ('hours', 'days', 'weeks', 'months', 'calendar')),
    interval_value INTEGER NOT NULL CHECK (interval_value > 0),
    next_due_date TIMESTAMPTZ NOT NULL,
    last_completed_date TIMESTAMPTZ,
    
    -- Current status
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'due', 'overdue', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Assignment and tracking
    assigned_technician VARCHAR(255),
    estimated_duration DECIMAL(4,2) DEFAULT 1.0,
    actual_duration DECIMAL(4,2),
    
    -- Equipment tracking
    current_hours INTEGER DEFAULT 0,
    hours_at_last_service INTEGER DEFAULT 0,
    
    -- Alerts and notifications
    alert_thresholds JSONB DEFAULT '{"hours_before": [48, 24, 1], "days_before": [7, 3, 1]}',
    last_alert_sent TIMESTAMPTZ,
    
    -- Additional fields
    required_parts TEXT[],
    required_tools TEXT[],
    instructions TEXT,
    safety_notes TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create maintenance_history table for detailed execution logs
CREATE TABLE IF NOT EXISTS maintenance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    template_id UUID REFERENCES maintenance_templates(id) ON DELETE SET NULL,
    
    -- Execution details
    maintenance_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Timing
    scheduled_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_hours DECIMAL(4,2),
    
    -- Personnel and assignment
    performed_by VARCHAR(255) NOT NULL,
    supervised_by VARCHAR(255),
    
    -- Work performed
    work_performed TEXT NOT NULL,
    parts_used JSONB DEFAULT '[]', -- [{name, quantity, cost, part_number}]
    tools_used TEXT[],
    
    -- Results and findings
    completion_status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (completion_status IN ('completed', 'partial', 'deferred', 'failed')),
    findings TEXT,
    issues_found TEXT,
    recommendations TEXT,
    
    -- Quality and compliance
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    compliance_verified BOOLEAN DEFAULT false,
    
    -- Cost tracking
    labor_cost DECIMAL(10,2) DEFAULT 0,
    parts_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (COALESCE(labor_cost, 0) + COALESCE(parts_cost, 0)) STORED,
    
    -- Equipment condition
    equipment_condition_before VARCHAR(20) CHECK (equipment_condition_before IN ('excellent', 'good', 'fair', 'poor', 'critical')),
    equipment_condition_after VARCHAR(20) CHECK (equipment_condition_after IN ('excellent', 'good', 'fair', 'poor', 'critical')),
    hours_at_maintenance INTEGER,
    
    -- Documentation
    photos TEXT[], -- Array of photo URLs
    documents TEXT[], -- Array of document URLs
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMPTZ,
    follow_up_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create maintenance_notifications table for alert management
CREATE TABLE IF NOT EXISTS maintenance_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('due_soon', 'overdue', 'completed', 'cancelled', 'rescheduled')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Delivery configuration
    delivery_channels TEXT[] NOT NULL DEFAULT ARRAY['in_app'], -- email, sms, in_app, push
    recipients TEXT[] NOT NULL,
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
    scheduled_send_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Delivery results
    delivery_results JSONB DEFAULT '{}', -- {channel: {status, timestamp, error}}
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Context data
    context_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create maintenance_calendar_events table for calendar integration
CREATE TABLE IF NOT EXISTS maintenance_calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    
    -- Event details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL DEFAULT 'maintenance',
    
    -- Timing
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT false,
    
    -- Assignment
    assigned_to VARCHAR(255),
    location VARCHAR(255),
    
    -- Status and metadata
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for calendar display
    
    -- Recurrence (for recurring events)
    recurrence_rule TEXT, -- RRULE format
    recurrence_exception_dates TIMESTAMPTZ[],
    
    -- Integration
    external_calendar_id VARCHAR(255),
    external_event_id VARCHAR(255),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_active ON maintenance_templates(is_active, maintenance_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_category ON maintenance_templates(category);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_asset_id ON maintenance_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_next_due ON maintenance_schedules(next_due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_status ON maintenance_schedules(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_assigned ON maintenance_schedules(assigned_technician);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_priority ON maintenance_schedules(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_template ON maintenance_schedules(template_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_history_schedule_id ON maintenance_history(schedule_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_asset_id ON maintenance_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_date ON maintenance_history(completed_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_performed_by ON maintenance_history(performed_by);

CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_schedule ON maintenance_notifications(schedule_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_status ON maintenance_notifications(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_send_time ON maintenance_notifications(scheduled_send_time);

CREATE INDEX IF NOT EXISTS idx_maintenance_calendar_start_time ON maintenance_calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_maintenance_calendar_assigned ON maintenance_calendar_events(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_calendar_status ON maintenance_calendar_events(status);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_maintenance_templates_updated_at 
    BEFORE UPDATE ON maintenance_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_schedules_updated_at 
    BEFORE UPDATE ON maintenance_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_history_updated_at 
    BEFORE UPDATE ON maintenance_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_notifications_updated_at 
    BEFORE UPDATE ON maintenance_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_calendar_events_updated_at 
    BEFORE UPDATE ON maintenance_calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE maintenance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations for authenticated users" ON maintenance_templates
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON maintenance_schedules
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON maintenance_history
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON maintenance_notifications
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON maintenance_calendar_events
    FOR ALL USING (auth.role() = 'authenticated');

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_history;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_calendar_events;

-- Create functions for maintenance automation

-- Function to calculate next due date based on interval
CREATE OR REPLACE FUNCTION calculate_next_due_date(
    last_date TIMESTAMPTZ,
    interval_type VARCHAR,
    interval_value INTEGER
) RETURNS TIMESTAMPTZ AS $$
BEGIN
    CASE interval_type
        WHEN 'hours' THEN
            RETURN last_date + (interval_value || ' hours')::INTERVAL;
        WHEN 'days' THEN
            RETURN last_date + (interval_value || ' days')::INTERVAL;
        WHEN 'weeks' THEN
            RETURN last_date + (interval_value || ' weeks')::INTERVAL;
        WHEN 'months' THEN
            RETURN last_date + (interval_value || ' months')::INTERVAL;
        ELSE
            RETURN last_date + (interval_value || ' days')::INTERVAL;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update maintenance schedule status based on due date
CREATE OR REPLACE FUNCTION update_maintenance_status() RETURNS VOID AS $$
BEGIN
    -- Update to 'due' status
    UPDATE maintenance_schedules 
    SET status = 'due', updated_at = NOW()
    WHERE status = 'scheduled' 
    AND next_due_date <= NOW() + INTERVAL '1 day'
    AND next_due_date > NOW() - INTERVAL '1 day';
    
    -- Update to 'overdue' status
    UPDATE maintenance_schedules 
    SET status = 'overdue', updated_at = NOW()
    WHERE status IN ('scheduled', 'due')
    AND next_due_date < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function to generate maintenance notifications
CREATE OR REPLACE FUNCTION generate_maintenance_notifications() RETURNS VOID AS $$
DECLARE
    schedule_record RECORD;
    notification_title TEXT;
    notification_message TEXT;
    hours_until_due INTEGER;
BEGIN
    -- Process schedules that are due soon or overdue
    FOR schedule_record IN 
        SELECT ms.*, a.name as asset_name
        FROM maintenance_schedules ms
        JOIN assets a ON ms.asset_id = a.id
        WHERE ms.status IN ('scheduled', 'due', 'overdue')
        AND (ms.last_alert_sent IS NULL OR ms.last_alert_sent < NOW() - INTERVAL '6 hours')
    LOOP
        hours_until_due := EXTRACT(EPOCH FROM (schedule_record.next_due_date - NOW())) / 3600;
        
        -- Generate appropriate notification based on timing
        IF hours_until_due < 0 THEN
            -- Overdue
            notification_title := 'OVERDUE: ' || schedule_record.title;
            notification_message := 'Maintenance for ' || schedule_record.asset_name || ' is ' || 
                                  ABS(hours_until_due)::INTEGER || ' hours overdue. Please complete as soon as possible.';
        ELSIF hours_until_due <= 1 THEN
            -- Due within 1 hour
            notification_title := 'URGENT: ' || schedule_record.title;
            notification_message := 'Maintenance for ' || schedule_record.asset_name || ' is due within 1 hour.';
        ELSIF hours_until_due <= 24 THEN
            -- Due within 24 hours
            notification_title := 'Due Soon: ' || schedule_record.title;
            notification_message := 'Maintenance for ' || schedule_record.asset_name || ' is due in ' || 
                                  hours_until_due::INTEGER || ' hours.';
        ELSIF hours_until_due <= 48 THEN
            -- Due within 48 hours
            notification_title := 'Reminder: ' || schedule_record.title;
            notification_message := 'Maintenance for ' || schedule_record.asset_name || ' is due in ' || 
                                  (hours_until_due/24)::INTEGER || ' days.';
        ELSE
            CONTINUE; -- Skip if not within alert window
        END IF;
        
        -- Insert notification
        INSERT INTO maintenance_notifications (
            schedule_id, asset_id, notification_type, priority, title, message,
            delivery_channels, recipients, scheduled_send_time
        ) VALUES (
            schedule_record.id, 
            schedule_record.asset_id,
            CASE 
                WHEN hours_until_due < 0 THEN 'overdue'
                ELSE 'due_soon'
            END,
            schedule_record.priority,
            notification_title,
            notification_message,
            ARRAY['in_app', 'email'],
            ARRAY[COALESCE(schedule_record.assigned_technician, 'maintenance@farm.com')],
            NOW()
        );
        
        -- Update last alert sent
        UPDATE maintenance_schedules 
        SET last_alert_sent = NOW(), updated_at = NOW()
        WHERE id = schedule_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to complete maintenance and reschedule
CREATE OR REPLACE FUNCTION complete_maintenance_schedule(
    schedule_id UUID,
    performed_by VARCHAR,
    work_performed TEXT,
    parts_used JSONB DEFAULT '[]',
    labor_cost DECIMAL DEFAULT 0,
    parts_cost DECIMAL DEFAULT 0,
    quality_rating INTEGER DEFAULT NULL,
    findings TEXT DEFAULT NULL,
    recommendations TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    schedule_record RECORD;
    history_id UUID;
    new_due_date TIMESTAMPTZ;
BEGIN
    -- Get schedule details
    SELECT * INTO schedule_record FROM maintenance_schedules WHERE id = schedule_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Maintenance schedule not found';
    END IF;
    
    -- Create history record
    INSERT INTO maintenance_history (
        schedule_id, asset_id, template_id, maintenance_type, title, description,
        scheduled_date, completed_at, performed_by, work_performed, parts_used,
        completion_status, findings, recommendations, labor_cost, parts_cost,
        quality_rating, hours_at_maintenance
    ) VALUES (
        schedule_id, schedule_record.asset_id, schedule_record.template_id,
        schedule_record.maintenance_type, schedule_record.title, schedule_record.description,
        schedule_record.next_due_date, NOW(), performed_by, work_performed, parts_used,
        'completed', findings, recommendations, labor_cost, parts_cost,
        quality_rating, schedule_record.current_hours
    ) RETURNING id INTO history_id;
    
    -- Calculate next due date
    new_due_date := calculate_next_due_date(
        NOW(), 
        schedule_record.interval_type, 
        schedule_record.interval_value
    );
    
    -- Update schedule for next occurrence
    UPDATE maintenance_schedules SET
        status = 'scheduled',
        next_due_date = new_due_date,
        last_completed_date = NOW(),
        hours_at_last_service = schedule_record.current_hours,
        last_alert_sent = NULL,
        updated_at = NOW()
    WHERE id = schedule_id;
    
    -- Create calendar event for next maintenance
    INSERT INTO maintenance_calendar_events (
        schedule_id, asset_id, title, description, start_time, end_time,
        assigned_to, status, color
    ) VALUES (
        schedule_id, schedule_record.asset_id, schedule_record.title, 
        schedule_record.description, new_due_date, 
        new_due_date + (schedule_record.estimated_duration || ' hours')::INTERVAL,
        schedule_record.assigned_technician, 'scheduled', 
        CASE schedule_record.priority
            WHEN 'critical' THEN '#DC2626'
            WHEN 'high' THEN '#EA580C'
            WHEN 'medium' THEN '#2563EB'
            ELSE '#059669'
        END
    );
    
    RETURN history_id;
END;
$$ LANGUAGE plpgsql;

-- Create a view for maintenance dashboard
CREATE OR REPLACE VIEW maintenance_dashboard_view AS
SELECT 
    ms.id as schedule_id,
    ms.title,
    ms.maintenance_type,
    ms.status,
    ms.priority,
    ms.next_due_date,
    ms.assigned_technician,
    ms.estimated_duration,
    a.name as asset_name,
    a.type as asset_type,
    a.location as asset_location,
    EXTRACT(EPOCH FROM (ms.next_due_date - NOW())) / 3600 as hours_until_due,
    CASE 
        WHEN ms.next_due_date < NOW() THEN 'overdue'
        WHEN ms.next_due_date < NOW() + INTERVAL '24 hours' THEN 'due_soon'
        WHEN ms.next_due_date < NOW() + INTERVAL '7 days' THEN 'upcoming'
        ELSE 'scheduled'
    END as urgency_status,
    mt.instructions,
    mt.safety_notes,
    mt.required_parts,
    mt.required_tools
FROM maintenance_schedules ms
JOIN assets a ON ms.asset_id = a.id
LEFT JOIN maintenance_templates mt ON ms.template_id = mt.id
WHERE ms.status IN ('scheduled', 'due', 'overdue', 'in_progress')
ORDER BY 
    CASE ms.status
        WHEN 'overdue' THEN 1
        WHEN 'due' THEN 2
        WHEN 'in_progress' THEN 3
        ELSE 4
    END,
    ms.next_due_date ASC;

-- Add comments for documentation
COMMENT ON TABLE maintenance_templates IS 'Reusable maintenance task templates with scheduling and resource requirements';
COMMENT ON TABLE maintenance_schedules IS 'Active maintenance schedules with automated status tracking and alerts';
COMMENT ON TABLE maintenance_history IS 'Detailed logs of completed maintenance activities with cost and performance tracking';
COMMENT ON TABLE maintenance_notifications IS 'Multi-channel notification system for maintenance alerts and reminders';
COMMENT ON TABLE maintenance_calendar_events IS 'Calendar integration for maintenance scheduling and visualization';
COMMENT ON VIEW maintenance_dashboard_view IS 'Consolidated view for maintenance dashboard with urgency indicators';
