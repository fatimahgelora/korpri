/*
  # Create admin system

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `name` (text)
      - `role` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `admin_users` table
    - Add policies for admin access
    - Create admin user with specified credentials

  3. Functions
    - Function to verify admin credentials
    - Function to hash passwords
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin users
CREATE POLICY "Admin users can read own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Insert default admin user (password: 1618@Password.)
-- Note: In production, this should be properly hashed
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@admin.com',
  crypt('1618@Password.', gen_salt('bf')),
  'Administrator',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- Create function to verify admin login
CREATE OR REPLACE FUNCTION verify_admin_login(input_email text, input_password text)
RETURNS TABLE(
  user_id uuid,
  user_email text,
  user_name text,
  user_role text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.email,
    a.name,
    a.role
  FROM admin_users a
  WHERE a.email = input_email 
    AND a.password_hash = crypt(input_password, a.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update registrations table to allow admin access
CREATE POLICY "Admin can read all registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Admin can update all registrations"
  ON registrations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Admin can delete all registrations"
  ON registrations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );