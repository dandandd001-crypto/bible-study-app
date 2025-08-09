/**
Supabase schema (SQL) reference:

-- auth.users managed by Supabase

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user','admin')),
  display_name text,
  created_at timestamptz default now()
);

create table public.mains (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  order_index int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  main_id uuid references public.mains(id) on delete cascade,
  parent_class_id uuid references public.classes(id) on delete cascade,
  title text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (
    (main_id is not null and parent_class_id is null) or
    (main_id is null and parent_class_id is not null)
  )
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  main_id uuid references public.mains(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  title text not null,
  body text not null,
  bible_reference text,
  image_url text,
  order_index int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (
    (main_id is not null and class_id is null) or
    (main_id is null and class_id is not null)
  )
);

-- Storage: create bucket "images" (public or with RLS as needed)

-- RLS examples:
alter table public.profiles enable row level security;
create policy if not exists "profiles_select" on public.profiles for select using (true);
create policy if not exists "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
create policy if not exists "profiles_update_self" on public.profiles for update using (auth.uid() = id);

alter table public.mains enable row level security;
create policy if not exists "mains_select" on public.mains for select using (true);

alter table public.classes enable row level security;
create policy if not exists "classes_select" on public.classes for select using (true);

alter table public.notes enable row level security;
create policy if not exists "notes_select" on public.notes for select using (true);

-- Optional: admin writes
create policy if not exists "mains_admin_write" on public.mains
for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy if not exists "classes_admin_write" on public.classes
for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy if not exists "notes_admin_write" on public.notes
for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
*/

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error('Supabase env missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url ?? '', anon ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
