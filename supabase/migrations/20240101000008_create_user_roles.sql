-- Create user_roles table for role-based access control
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own role
CREATE POLICY "Users can view their own role" 
    ON user_roles FOR SELECT 
    USING (auth.uid() = user_id);

-- Only admins can insert/update/delete roles (will need admin check)
CREATE POLICY "Admins can manage all roles" 
    ON user_roles FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Insert default admin user (replace with your actual admin email)
-- This is a placeholder - you should update it with your actual admin email
INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'ADMIN';

-- All other users default to USER role when they sign up
-- This can be handled by a trigger or in the application code
