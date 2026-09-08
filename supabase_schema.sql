-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Enum types
create type visibility_status as enum ('private', 'friends', 'public');
create type timeframe_type as enum ('day', 'week', 'month', 'year');
create type friendship_status as enum ('pending', 'accepted', 'declined', 'blocked');

-------------------------------------------------------------------------
-- PROFILES
-------------------------------------------------------------------------
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-------------------------------------------------------------------------
-- FRIENDSHIPS
-------------------------------------------------------------------------
create table friendships (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references profiles(id) on delete cascade not null,
  addressee_id uuid references profiles(id) on delete cascade not null,
  status friendship_status default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (requester_id, addressee_id)
);

alter table friendships enable row level security;

create policy "Users can see their own friendships" on friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can insert friendships where they are the requester" on friendships
  for insert with check (auth.uid() = requester_id);

create policy "Users can update friendships where they are involved" on friendships
  for update using (auth.uid() = requester_id or auth.uid() = addressee_id);


-------------------------------------------------------------------------
-- JOURNAL ENTRIES
-------------------------------------------------------------------------
create table journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  title text,
  content text,
  visibility visibility_status default 'private' not null,
  allow_comments boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table journal_entries enable row level security;

-- Users can view their own entries, public entries, and friends' entries if accepted
create policy "Journal entry visibility" on journal_entries
  for select using (
    auth.uid() = user_id
    or visibility = 'public'
    or (
      visibility = 'friends' and
      exists (
        select 1 from friendships
        where (
          (requester_id = auth.uid() and addressee_id = journal_entries.user_id) or
          (addressee_id = auth.uid() and requester_id = journal_entries.user_id)
        )
        and status = 'accepted'
      )
    )
  );

create policy "Users can insert their own entries" on journal_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own entries" on journal_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete their own entries" on journal_entries
  for delete using (auth.uid() = user_id);


-------------------------------------------------------------------------
-- TODOS
-------------------------------------------------------------------------
create table todos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  timeframe timeframe_type not null,
  target_date date,
  is_completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table todos enable row level security;

create policy "Users can view their own todos" on todos
  for select using (auth.uid() = user_id);

create policy "Users can insert their own todos" on todos
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own todos" on todos
  for update using (auth.uid() = user_id);

create policy "Users can delete their own todos" on todos
  for delete using (auth.uid() = user_id);


-------------------------------------------------------------------------
-- COMMENTS
-------------------------------------------------------------------------
create table comments (
  id uuid default uuid_generate_v4() primary key,
  entry_id uuid references journal_entries(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  parent_comment_id uuid references comments(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table comments enable row level security;

-- Comment visibility follows journal entry visibility
create policy "Comments are viewable if journal entry is viewable" on comments
  for select using (
    exists (
      select 1 from journal_entries
      where journal_entries.id = comments.entry_id
    )
  );

-- Users can insert comments if entry allows it and they have access
create policy "Users can insert comments on viewable entries that allow comments" on comments
  for insert with check (
    auth.uid() = author_id and
    exists (
      select 1 from journal_entries
      where journal_entries.id = comments.entry_id
      and allow_comments = true
      and (
        journal_entries.user_id = auth.uid()
        or journal_entries.visibility = 'public'
        or (
          journal_entries.visibility = 'friends' and
          exists (
            select 1 from friendships
            where (
              (requester_id = auth.uid() and addressee_id = journal_entries.user_id) or
              (addressee_id = auth.uid() and requester_id = journal_entries.user_id)
            )
            and status = 'accepted'
          )
        )
      )
    )
  );

-- Users can delete their own comments or comments on their own entries
create policy "Users can delete their own comments or comments on their own entries" on comments
  for delete using (
    auth.uid() = author_id or
    exists (
      select 1 from journal_entries
      where journal_entries.id = comments.entry_id
      and journal_entries.user_id = auth.uid()
    )
  );

create policy "Users can update their own comments" on comments
  for update using (auth.uid() = author_id);


-------------------------------------------------------------------------
-- BOOKMARKS
-------------------------------------------------------------------------
create table bookmarks (
  user_id uuid references profiles(id) on delete cascade not null,
  entry_id uuid references journal_entries(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, entry_id)
);

alter table bookmarks enable row level security;

create policy "Users can view their own bookmarks" on bookmarks
  for select using (auth.uid() = user_id);

create policy "Users can manage their own bookmarks" on bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks" on bookmarks
  for delete using (auth.uid() = user_id);


-------------------------------------------------------------------------
-- CONVERSATIONS & MESSAGES
-------------------------------------------------------------------------
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  user1_id uuid references profiles(id) on delete cascade not null,
  user2_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user1_id, user2_id)
);

alter table conversations enable row level security;

create policy "Users can view their conversations" on conversations
  for select using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Users can create conversations they are part of" on conversations
  for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);

create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table messages enable row level security;

create policy "Users can view messages in their conversations" on messages
  for select using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and (conversations.user1_id = auth.uid() or conversations.user2_id = auth.uid())
    )
  );

create policy "Users can send messages to their conversations" on messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and (conversations.user1_id = auth.uid() or conversations.user2_id = auth.uid())
    )
  );

-- Enable Realtime for relevant tables
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table friendships;
