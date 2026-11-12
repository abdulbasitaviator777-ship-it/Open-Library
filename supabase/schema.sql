-- Run once in Supabase SQL Editor.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.archive_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  kind text not null check (kind in ('book','photo','video')),
  storage_path text not null,
  cover_path text,
  user_id uuid not null references auth.users(id) on delete cascade,
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_at timestamptz not null default now()
);
create index if not exists archive_items_kind_created_idx on public.archive_items(kind,created_at desc);
create table if not exists public.site_settings (
  id integer primary key default 1 check (id=1),
  site_name text not null default 'Verdant Archive',
  logo_text text not null default 'VA',
  logo_url text,
  accent_color text not null default '#4f8975',
  olive_color text not null default '#89945c',
  updated_at timestamptz not null default now()
);
insert into public.site_settings(id) values(1) on conflict(id) do nothing;

alter table public.profiles enable row level security;
alter table public.archive_items enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_archive_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;

drop policy if exists "Profiles readable by owner or admin" on public.profiles;
create policy "Profiles readable by owner or admin" on public.profiles for select using (auth.uid()=id or public.is_archive_admin());
drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile" on public.profiles for insert with check (auth.uid()=id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (auth.uid()=id or public.is_archive_admin()) with check (auth.uid()=id or public.is_archive_admin());

drop policy if exists "Public items visible" on public.archive_items;
create policy "Public items visible" on public.archive_items for select using (visibility='public' or auth.uid()=user_id or public.is_archive_admin());
drop policy if exists "Signed in users upload" on public.archive_items;
create policy "Signed in users upload" on public.archive_items for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists "Owner or admin update items" on public.archive_items;
create policy "Owner or admin update items" on public.archive_items for update to authenticated using (auth.uid()=user_id or public.is_archive_admin()) with check (auth.uid()=user_id or public.is_archive_admin());
drop policy if exists "Owner or admin delete items" on public.archive_items;
create policy "Owner or admin delete items" on public.archive_items for delete to authenticated using (auth.uid()=user_id or public.is_archive_admin());

drop policy if exists "Settings public read" on public.site_settings;
create policy "Settings public read" on public.site_settings for select using (true);
drop policy if exists "Admin manage settings" on public.site_settings;
create policy "Admin manage settings" on public.site_settings for all to authenticated using (public.is_archive_admin()) with check (public.is_archive_admin());

-- Create the three Storage buckets in Dashboard > Storage:
-- books (public), photos (public), videos (public).
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
 ('books','books',true,52428800,array['application/pdf','application/epub+zip','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
 ('photos','photos',true,10485760,array['image/jpeg','image/png','image/webp','image/gif']),
 ('videos','videos',true,524288000,array['video/mp4','video/webm','video/quicktime'])
on conflict(id) do nothing;

drop policy if exists "Public read archive buckets" on storage.objects;
create policy "Public read archive buckets" on storage.objects for select using (bucket_id in ('books','photos','videos'));
drop policy if exists "Authenticated upload own folder" on storage.objects;
create policy "Authenticated upload own folder" on storage.objects for insert to authenticated with check (bucket_id in ('books','photos','videos') and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Owner or admin delete storage" on storage.objects;
create policy "Owner or admin delete storage" on storage.objects for delete to authenticated using ((bucket_id in ('books','photos','videos')) and ((storage.foldername(name))[1]=auth.uid()::text or public.is_archive_admin()));

-- After registering your account, promote your account to admin in SQL Editor:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL');


-- Create a profile automatically for every new Supabase Auth user.
create or replace function public.handle_new_archive_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_archive on auth.users;
create trigger on_auth_user_created_archive
after insert on auth.users
for each row execute procedure public.handle_new_archive_user();
