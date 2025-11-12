# Applying User Roles Migration

This guide explains how to apply the new user_roles table migration to fix the authentication errors.

## Option 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed and configured:

```bash
# Apply the migration
supabase db push

# Or if using migrations manually:
supabase migration up
```

## Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `/supabase/migrations/20240101000008_create_user_roles.sql`
5. Click **Run** to execute the migration

## Option 3: Direct SQL Execution

Connect to your Supabase database and run:

```sql
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
CREATE POLICY "Users can view their own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
    ON user_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );
```

## Setting Up Your First Admin User

After creating the table, you need to assign admin role to at least one user:

```sql
-- Replace 'your-email@example.com' with your actual admin email
INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'ADMIN';
```

## Automatic Role Assignment for New Users

To automatically assign the 'USER' role to new signups, you can create a trigger:

```sql
-- Create function to auto-assign USER role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'USER');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## Verification

After applying the migration, verify it worked:

```sql
-- Check if table exists
SELECT * FROM user_roles;

-- Check your user's role
SELECT ur.role, u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'your-email@example.com';
```

## Troubleshooting

### Error: "Could not find the table 'public.user_roles'"

- The migration hasn't been applied yet. Follow one of the options above.

### Error: "Permission denied"

- Make sure Row Level Security policies are set up correctly
- Verify your Supabase service role key has proper permissions

### No role returned for user

- Check if the user exists in the `user_roles` table
- If not, manually insert their role using the SQL above

## What Changed in the Code

The following files were updated to fix the TypeScript errors and improve code organization:

1. **New Migration**: `/supabase/migrations/20240101000008_create_user_roles.sql`

   - Creates the `user_roles` table
   - Sets up Row Level Security policies
   - Adds indexes and triggers

2. **New Hook**: `/src/hooks/usePermissions.ts`

   - Extracted `usePermissions` hook to separate file
   - Fixes React Fast Refresh warning

3. **Updated**: `/src/components/auth/RoleGuard.tsx`

   - Removed `usePermissions` hook (moved to separate file)
   - Now only exports the RoleGuard component

4. **Updated**: `/src/components/Layout.tsx`
   - Import `usePermissions` from new location

All TypeScript errors have been resolved! ✅
