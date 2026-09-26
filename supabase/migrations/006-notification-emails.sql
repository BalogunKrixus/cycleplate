-- Email notifications, and the consent that has to come with them.
--
-- Safe to run more than once. Run it whole.
--
-- WHAT THE EXISTING SETUP CAN AND CANNOT DO
-- Supabase's SMTP settings send Supabase's own auth mail: confirmations and
-- password resets. There is no interface for sending anything else through it,
-- so this cannot be an extension of that. It goes to Resend's API directly,
-- using the domain already verified for the auth mail, so no new provider and
-- no new DNS.
--
-- WHY CONSENT IS PART OF THE SAME MIGRATION
-- This is a women's health community. Mail about someone's cycle, arriving
-- without a way to stop it, is the kind of thing that ends up on a screenshot,
-- and in most jurisdictions it is also unlawful. The column and the token are
-- here so that no send can be built without them: the query that finds
-- recipients filters on opt-in, and every message carries a link that turns it
-- off without signing in.

-- ------------------------------------------------------------- consent
alter table public.profiles
  add column if not exists email_opt_in boolean not null default true,
  -- Unguessable, and per person, so an unsubscribe link cannot be walked.
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists profiles_unsubscribe_token_key
  on public.profiles (unsubscribe_token);

-- Turning it off needs no session: the link in the mail is the credential, and
-- asking somebody to sign in before they can stop being emailed is the pattern
-- this is meant to avoid. It can only ever set the flag to false.
create or replace function public.unsubscribe(token uuid)
returns table (display_name text)
language sql volatile security definer set search_path = public as $$
  update public.profiles
     set email_opt_in = false
   where unsubscribe_token = token
  returning display_name;
$$;

grant execute on function public.unsubscribe(uuid) to anon, authenticated;

-- --------------------------------------------------------- who gets it
-- Addresses live in auth.users and never reach public.profiles, which the feed
-- can read. This is the only way to see one, it returns nothing to anybody who
-- is not a moderator, and it already excludes anyone who has opted out.
create or replace function public.notification_recipients()
returns table (id uuid, email text, display_name text, unsubscribe_token uuid)
language sql stable security definer set search_path = public as $$
  select p.id, u.email::text, p.display_name, p.unsubscribe_token
    from public.profiles p
    join auth.users u on u.id = p.id
   where public.is_admin()
     and p.email_opt_in
     and u.email is not null
     and u.email_confirmed_at is not null;
$$;

revoke execute on function public.notification_recipients() from anon;
grant execute on function public.notification_recipients() to authenticated;

-- ------------------------------------------------------------- history
-- What was sent, to how many, by whom. Partly so nobody sends the same thing
-- twice on a bad morning, and partly because "did we email about that?" is a
-- question that gets asked and currently has no answer.
create table if not exists public.notifications_sent (
  id          uuid primary key default gen_random_uuid(),
  subject     text not null,
  body        text not null,
  post_id     uuid references public.posts on delete set null,
  sent_by     uuid references public.profiles on delete set null,
  recipients  integer not null default 0,
  failed      integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_sent_idx
  on public.notifications_sent (created_at desc);

alter table public.notifications_sent enable row level security;

drop policy if exists notifications_admin on public.notifications_sent;
create policy notifications_admin on public.notifications_sent for all
  using (public.is_admin()) with check (public.is_admin());

-- Check it took.
select 'email_opt_in' as thing,
       (select count(*)::text from information_schema.columns
         where table_schema='public' and table_name='profiles'
           and column_name='email_opt_in') as present
union all
select 'unsubscribe_token',
       (select count(*)::text from information_schema.columns
         where table_schema='public' and table_name='profiles'
           and column_name='unsubscribe_token')
union all
select 'notifications_sent',
       (select count(*)::text from information_schema.tables
         where table_schema='public' and table_name='notifications_sent')
union all
select 'unsubscribe()',
       (select count(*)::text from pg_proc where proname='unsubscribe');
