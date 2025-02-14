/*
  # Water Subscription System Schema

  1. New Tables
    - `customers`
      - Basic customer information
      - Tracks customer details and status
    - `meters`
      - Water meter information
      - Links to customer and tracks meter details
    - `readings`
      - Monthly meter readings
      - Tracks usage and billing data
    - `bills`
      - Monthly bills
      - Tracks payment status and amounts

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users
*/

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  full_name text NOT NULL,
  address text NOT NULL,
  phone_number text,
  email text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meters table
CREATE TABLE IF NOT EXISTS meters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  meter_number text UNIQUE NOT NULL,
  installation_date date NOT NULL,
  last_reading numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Readings table
CREATE TABLE IF NOT EXISTS readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id uuid REFERENCES meters(id),
  reading_date date NOT NULL,
  current_reading numeric(10,2) NOT NULL,
  usage numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id uuid REFERENCES readings(id),
  customer_id uuid REFERENCES customers(id),
  bill_date date NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'overdue')),
  due_date date NOT NULL,
  paid_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own customer data"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own meters"
  ON meters FOR SELECT
  TO authenticated
  USING (customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own readings"
  ON readings FOR SELECT
  TO authenticated
  USING (meter_id IN (
    SELECT id FROM meters WHERE customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can view their own bills"
  ON bills FOR SELECT
  TO authenticated
  USING (customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  ));