
-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create inventory_items table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    max_stock INTEGER NOT NULL DEFAULT 100,
    unit VARCHAR(50) NOT NULL DEFAULT 'pieces',
    location VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create repair_items table
CREATE TABLE repair_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_name VARCHAR(255) NOT NULL,
    defect_tag VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    description TEXT NOT NULL,
    estimated_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    assigned_technician VARCHAR(255) NOT NULL,
    photo_urls TEXT[] DEFAULT '{}',
    warranty_status VARCHAR(20) NOT NULL DEFAULT 'out_of_warranty' CHECK (warranty_status IN ('in_warranty', 'out_of_warranty', 'extended')),
    estimated_completion TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create job_cards table
CREATE TABLE job_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed')),
    assigned_to VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    estimated_hours INTEGER NOT NULL DEFAULT 1,
    due_date TIMESTAMPTZ NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create inspections table
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('safety', 'pre_season', 'compliance', 'maintenance')),
    inspector VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    scheduled_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    checklist_items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create maintenance_schedules table
CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_name VARCHAR(255) NOT NULL,
    maintenance_type VARCHAR(255) NOT NULL,
    interval_type VARCHAR(20) NOT NULL CHECK (interval_type IN ('hours', 'calendar')),
    interval_value INTEGER NOT NULL,
    current_hours INTEGER,
    next_due_date TIMESTAMPTZ NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_technician VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'overdue', 'in_progress', 'completed')),
    failure_probability DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (failure_probability >= 0 AND failure_probability <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create stock_items table (inferred from TABLES constant)
CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    supplier VARCHAR(255),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 10,
    reorder_quantity INTEGER NOT NULL DEFAULT 50,
    last_order_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    batch_number VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_location ON inventory_items(location);

CREATE INDEX idx_repair_items_status ON repair_items(status);
CREATE INDEX idx_repair_items_priority ON repair_items(priority);
CREATE INDEX idx_repair_items_assigned_technician ON repair_items(assigned_technician);
CREATE INDEX idx_repair_items_estimated_completion ON repair_items(estimated_completion);

CREATE INDEX idx_job_cards_status ON job_cards(status);
CREATE INDEX idx_job_cards_priority ON job_cards(priority);
CREATE INDEX idx_job_cards_assigned_to ON job_cards(assigned_to);
CREATE INDEX idx_job_cards_due_date ON job_cards(due_date);

CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_type ON inspections(type);
CREATE INDEX idx_inspections_inspector ON inspections(inspector);
CREATE INDEX idx_inspections_scheduled_date ON inspections(scheduled_date);

CREATE INDEX idx_maintenance_schedules_status ON maintenance_schedules(status);
CREATE INDEX idx_maintenance_schedules_next_due_date ON maintenance_schedules(next_due_date);
CREATE INDEX idx_maintenance_schedules_assigned_technician ON maintenance_schedules(assigned_technician);

CREATE INDEX idx_stock_items_category ON stock_items(category);
CREATE INDEX idx_stock_items_reorder_level ON stock_items(reorder_level);
CREATE INDEX idx_stock_items_expiry_date ON stock_items(expiry_date);

-- Create functions to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamps
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repair_items_updated_at BEFORE UPDATE ON repair_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_cards_updated_at BEFORE UPDATE ON job_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_schedules_updated_at BEFORE UPDATE ON maintenance_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON stock_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for authenticated users)
-- You can customize these policies based on your specific security requirements

CREATE POLICY "Allow all operations for authenticated users" ON inventory_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON repair_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON job_cards
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON inspections
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON maintenance_schedules
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON stock_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Enable real-time subscriptions for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE repair_items;
ALTER PUBLICATION supabase_realtime ADD TABLE job_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE inspections;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_items;
