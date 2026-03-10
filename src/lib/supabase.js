import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─────────────────────────────────────────────
// SUPABASE SQL SCHEMA (run in Supabase SQL editor)
// ─────────────────────────────────────────────
/*
-- Enable realtime
-- Go to Database > Replication and enable all tables below

create table if not exists sales_metrics (
  id uuid default gen_random_uuid() primary key,
  revenue numeric not null,
  orders int not null,
  conversion_rate numeric not null,
  avg_order_value numeric not null,
  created_at timestamptz default now()
);

create table if not exists inventory_metrics (
  id uuid default gen_random_uuid() primary key,
  stock_level numeric not null,       -- 0-100 (%)
  low_stock_items int not null,
  stockout_items int not null,
  turnover_rate numeric not null,
  created_at timestamptz default now()
);

create table if not exists support_metrics (
  id uuid default gen_random_uuid() primary key,
  open_tickets int not null,
  avg_response_time numeric not null, -- hours
  csat_score numeric not null,        -- 0-100
  escalated_tickets int not null,
  created_at timestamptz default now()
);

create table if not exists cashflow_metrics (
  id uuid default gen_random_uuid() primary key,
  cash_balance numeric not null,
  burn_rate numeric not null,
  runway_days int not null,
  receivables numeric not null,
  created_at timestamptz default now()
);

create table if not exists alerts (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('crisis', 'opportunity', 'anomaly')),
  vertical text not null,
  message text not null,
  detail text,
  resolved boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security (optional, adjust as needed)
alter table sales_metrics enable row level security;
alter table inventory_metrics enable row level security;
alter table support_metrics enable row level security;
alter table cashflow_metrics enable row level security;
alter table alerts enable row level security;

-- Allow anon reads (for demo)
create policy "allow_read" on sales_metrics for select using (true);
create policy "allow_read" on inventory_metrics for select using (true);
create policy "allow_read" on support_metrics for select using (true);
create policy "allow_read" on cashflow_metrics for select using (true);
create policy "allow_read" on alerts for select using (true);
create policy "allow_insert" on sales_metrics for insert with check (true);
create policy "allow_insert" on inventory_metrics for insert with check (true);
create policy "allow_insert" on support_metrics for insert with check (true);
create policy "allow_insert" on cashflow_metrics for insert with check (true);
create policy "allow_insert" on alerts for insert with check (true);
create policy "allow_update" on alerts for update using (true);
*/
