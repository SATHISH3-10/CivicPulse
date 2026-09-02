-- Run this once in Supabase SQL Editor.
-- Application documents remain flexible in JSONB while each collection has its own table.
create table if not exists users (id uuid primary key, data jsonb not null);
create table if not exists departments (id uuid primary key, data jsonb not null);
create table if not exists officers (id uuid primary key, data jsonb not null);
create table if not exists complaints (id uuid primary key, data jsonb not null);
create table if not exists evidence (id uuid primary key, data jsonb not null);
create table if not exists timeline_events (id uuid primary key, data jsonb not null);
create table if not exists feedback (id uuid primary key, data jsonb not null);
create table if not exists notifications (id uuid primary key, data jsonb not null);
create table if not exists complaint_support (id uuid primary key, data jsonb not null);

-- The Node server uses the service-role key, so these tables are not exposed directly to browsers.
alter table users enable row level security;
alter table departments enable row level security;
alter table officers enable row level security;
alter table complaints enable row level security;
alter table evidence enable row level security;
alter table timeline_events enable row level security;
alter table feedback enable row level security;
alter table notifications enable row level security;
alter table complaint_support enable row level security;
