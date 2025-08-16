/*
  # Create race management system

  1. New Tables
    - `race_bibs`
      - `id` (uuid, primary key)
      - `registration_id` (uuid, references registrations)
      - `bib_number` (integer, unique)
      - `status` (text: available, assigned, collected)
      - `assigned_at` (timestamp)
      - `collected_at` (timestamp)
      - `staff_id` (uuid, references admin_users)
      - `created_at` (timestamp)

    - `race_results`
      - `id` (uuid, primary key)
      - `registration_id` (uuid, references registrations)
      - `bib_number` (integer)
      - `start_time` (timestamp)
      - `finish_time` (timestamp)
      - `race_duration` (interval)
      - `position` (integer)
      - `category_position` (integer)
      - `status` (text: registered, started, finished, dnf, dsq)
      - `recorded_by` (uuid, references admin_users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on new tables
    - Add policies for admin and staff access
    - Add policies for participant read access

  3. Functions
    - Function to assign bib numbers
    - Function to collect bibs via QR scan
    - Function to record race start/finish
    - Function to generate race statistics
*/

-- Create race_bibs table
CREATE TABLE IF NOT EXISTS race_bibs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  bib_number integer UNIQUE NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'collected')),
  assigned_at timestamptz,
  collected_at timestamptz,
  staff_id uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now()
);

-- Create race_results table
CREATE TABLE IF NOT EXISTS race_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  bib_number integer,
  start_time timestamptz,
  finish_time timestamptz,
  race_duration interval GENERATED ALWAYS AS (finish_time - start_time) STORED,
  position integer,
  category_position integer,
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'started', 'finished', 'dnf', 'dsq')),
  recorded_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE race_bibs ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for race_bibs
CREATE POLICY "Admin can manage all bibs"
  ON race_bibs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can read own bib"
  ON race_bibs
  FOR SELECT
  TO authenticated
  USING (
    registration_id IN (
      SELECT id FROM registrations WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for race_results
CREATE POLICY "Admin can manage all results"
  ON race_results
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can read own results"
  ON race_results
  FOR SELECT
  TO authenticated
  USING (
    registration_id IN (
      SELECT id FROM registrations WHERE user_id = auth.uid()
    )
  );

-- Function to assign bib number
CREATE OR REPLACE FUNCTION assign_bib_number(
  p_registration_id uuid,
  p_staff_id uuid DEFAULT NULL
)
RETURNS TABLE(
  bib_id uuid,
  bib_number integer,
  success boolean,
  message text
) AS $$
DECLARE
  v_bib_number integer;
  v_bib_id uuid;
  v_jenis_tiket text;
  v_bib_range_start integer;
  v_bib_range_end integer;
BEGIN
  -- Get ticket type to determine bib number range
  SELECT jenis_tiket INTO v_jenis_tiket
  FROM registrations 
  WHERE id = p_registration_id;
  
  -- Set bib number ranges based on ticket type
  CASE v_jenis_tiket
    WHEN 'fun-run' THEN
      v_bib_range_start := 1;
      v_bib_range_end := 2000;
    WHEN 'half-marathon' THEN
      v_bib_range_start := 2001;
      v_bib_range_end := 4000;
    WHEN 'full-marathon' THEN
      v_bib_range_start := 4001;
      v_bib_range_end := 6000;
    ELSE
      RETURN QUERY SELECT NULL::uuid, NULL::integer, false, 'Invalid ticket type';
      RETURN;
  END CASE;
  
  -- Find next available bib number in range
  SELECT MIN(n) INTO v_bib_number
  FROM generate_series(v_bib_range_start, v_bib_range_end) n
  WHERE n NOT IN (SELECT bib_number FROM race_bibs WHERE bib_number IS NOT NULL);
  
  IF v_bib_number IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, NULL::integer, false, 'No available bib numbers in range';
    RETURN;
  END IF;
  
  -- Insert bib assignment
  INSERT INTO race_bibs (registration_id, bib_number, status, assigned_at, staff_id)
  VALUES (p_registration_id, v_bib_number, 'assigned', now(), p_staff_id)
  RETURNING id INTO v_bib_id;
  
  -- Create initial race result record
  INSERT INTO race_results (registration_id, bib_number, status)
  VALUES (p_registration_id, v_bib_number, 'registered');
  
  RETURN QUERY SELECT v_bib_id, v_bib_number, true, 'Bib number assigned successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark bib as collected via QR scan
CREATE OR REPLACE FUNCTION collect_bib(
  p_ticket_number text,
  p_staff_id uuid DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  message text,
  bib_number integer,
  participant_name text
) AS $$
DECLARE
  v_registration_id uuid;
  v_bib_number integer;
  v_participant_name text;
BEGIN
  -- Find registration by ticket number
  SELECT id, nama INTO v_registration_id, v_participant_name
  FROM registrations 
  WHERE ticket_number = p_ticket_number;
  
  IF v_registration_id IS NULL THEN
    RETURN QUERY SELECT false, 'Ticket number not found', NULL::integer, NULL::text;
    RETURN;
  END IF;
  
  -- Update bib status to collected
  UPDATE race_bibs 
  SET status = 'collected', collected_at = now(), staff_id = p_staff_id
  WHERE registration_id = v_registration_id
  RETURNING bib_number INTO v_bib_number;
  
  IF v_bib_number IS NULL THEN
    RETURN QUERY SELECT false, 'Bib not assigned yet', NULL::integer, NULL::text;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, 'Bib collected successfully', v_bib_number, v_participant_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record race start
CREATE OR REPLACE FUNCTION record_race_start(
  p_bib_number integer,
  p_staff_id uuid DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  message text
) AS $$
BEGIN
  UPDATE race_results 
  SET 
    start_time = now(),
    status = 'started',
    recorded_by = p_staff_id,
    updated_at = now()
  WHERE bib_number = p_bib_number AND status = 'registered';
  
  IF FOUND THEN
    RETURN QUERY SELECT true, 'Race start recorded';
  ELSE
    RETURN QUERY SELECT false, 'Bib number not found or already started';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record race finish
CREATE OR REPLACE FUNCTION record_race_finish(
  p_bib_number integer,
  p_staff_id uuid DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  message text,
  finish_time timestamptz,
  duration interval,
  position integer
) AS $$
DECLARE
  v_finish_time timestamptz := now();
  v_duration interval;
  v_position integer;
  v_jenis_tiket text;
  v_category_position integer;
BEGIN
  -- Get race info
  SELECT 
    rr.race_duration,
    r.jenis_tiket
  INTO v_duration, v_jenis_tiket
  FROM race_results rr
  JOIN registrations r ON rr.registration_id = r.id
  WHERE rr.bib_number = p_bib_number;
  
  -- Calculate overall position
  SELECT COUNT(*) + 1 INTO v_position
  FROM race_results 
  WHERE status = 'finished' AND finish_time < v_finish_time;
  
  -- Calculate category position
  SELECT COUNT(*) + 1 INTO v_category_position
  FROM race_results rr
  JOIN registrations r ON rr.registration_id = r.id
  WHERE rr.status = 'finished' 
    AND rr.finish_time < v_finish_time
    AND r.jenis_tiket = v_jenis_tiket;
  
  -- Update race result
  UPDATE race_results 
  SET 
    finish_time = v_finish_time,
    status = 'finished',
    position = v_position,
    category_position = v_category_position,
    recorded_by = p_staff_id,
    updated_at = now()
  WHERE bib_number = p_bib_number AND status = 'started';
  
  IF FOUND THEN
    -- Recalculate duration
    SELECT finish_time - start_time INTO v_duration
    FROM race_results 
    WHERE bib_number = p_bib_number;
    
    RETURN QUERY SELECT true, 'Race finish recorded', v_finish_time, v_duration, v_position;
  ELSE
    RETURN QUERY SELECT false, 'Bib number not found or not started', NULL::timestamptz, NULL::interval, NULL::integer;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get race statistics
CREATE OR REPLACE FUNCTION get_race_statistics()
RETURNS TABLE(
  total_registered integer,
  total_started integer,
  total_finished integer,
  fun_run_finished integer,
  half_marathon_finished integer,
  full_marathon_finished integer,
  average_time_fun_run interval,
  average_time_half_marathon interval,
  average_time_full_marathon interval
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::integer FROM race_results WHERE status != 'registered'),
    (SELECT COUNT(*)::integer FROM race_results WHERE status IN ('started', 'finished')),
    (SELECT COUNT(*)::integer FROM race_results WHERE status = 'finished'),
    (SELECT COUNT(*)::integer FROM race_results rr JOIN registrations r ON rr.registration_id = r.id WHERE rr.status = 'finished' AND r.jenis_tiket = 'fun-run'),
    (SELECT COUNT(*)::integer FROM race_results rr JOIN registrations r ON rr.registration_id = r.id WHERE rr.status = 'finished' AND r.jenis_tiket = 'half-marathon'),
    (SELECT COUNT(*)::integer FROM race_results rr JOIN registrations r ON rr.registration_id = r.id WHERE rr.status = 'finished' AND r.jenis_tiket = 'full-marathon'),
    (SELECT AVG(race_duration) FROM race_results rr JOIN registrations r ON rr.registration_id = r.id WHERE rr.status = 'finished' AND r.jenis_tiket = 'fun-run'),
    (SELECT AVG(race_duration) FROM race_results rr JOIN registrations r ON rr.registration_id = r.id WHERE rr.status = 'finished' AND r.jenis_tiket = 'half-marathon'),
    (SELECT AVG(race_duration) FROM race_results rr JOIN registrations r ON rr.registration_id = r.id WHERE rr.status = 'finished' AND r.jenis_tiket = 'full-marathon');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_race_bibs_registration_id ON race_bibs(registration_id);
CREATE INDEX IF NOT EXISTS idx_race_bibs_bib_number ON race_bibs(bib_number);
CREATE INDEX IF NOT EXISTS idx_race_results_registration_id ON race_results(registration_id);
CREATE INDEX IF NOT EXISTS idx_race_results_bib_number ON race_results(bib_number);
CREATE INDEX IF NOT EXISTS idx_race_results_finish_time ON race_results(finish_time);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket_number ON registrations(ticket_number);