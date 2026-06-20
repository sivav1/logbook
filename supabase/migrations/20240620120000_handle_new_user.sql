create table users (
  id uuid primary key,
  email text not null,
  created_at timestamp default now()
);

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  timezone text default 'Pacific/Auckland',
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table profiles enable row level security;

create policy "Users can access own data" on users
  for all using (auth.uid() = id);

create policy "Profiles can access own data" on profiles
  for all using (auth.uid() = user_id);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into users (id, email, created_at)
  values (new.id, new.email, now());

  insert into profiles (user_id, timezone, created_at)
  values (new.id, 'Pacific/Auckland', now());

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
