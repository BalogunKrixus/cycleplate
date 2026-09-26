-- Admin overview, member activity, and "when was she last here".
--
-- Safe to run more than once. Run it in one go; nothing here adds an enum
-- value, so the two-step dance 002 needed does not apply.
--
-- Two ideas.
--
-- First, last_seen_at. Every other metric the dashboard shows can be counted
-- from rows that already exist, but "active members" cannot: nothing in this
-- schema records that somebody visited, only that she wrote something. Reading
-- is most of what a health community is for, so counting only authors would
-- report a room of fifty women as a room of four.
--
-- Second, one function instead of twelve queries. The dashboard needs a dozen
-- numbers and the database is in Ireland while the app runs in Virginia. Twelve
-- counts is twelve crossings of the Atlantic; this is one.

-- --------------------------------------------------------------- last seen
alter table public.profiles
  add column if not exists last_seen_at timestamptz;

create index if not exists profiles_last_seen_idx
  on public.profiles (last_seen_at desc nulls last);

-- Called when a member opens the community. Writes at most once an hour per
-- person: the feed is reloaded constantly, and a write on every load would put
-- a transatlantic round trip in front of a page that is meant to feel instant,
-- to record something that is only ever read a day at a time.
create or replace function public.touch_last_seen() returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set last_seen_at = now()
   where id = auth.uid()
     and (last_seen_at is null or last_seen_at < now() - interval '1 hour');
end $$;

revoke execute on function public.touch_last_seen() from anon;
grant execute on function public.touch_last_seen() to authenticated;

-- ---------------------------------------------------------------- overview
-- Every number on the admin overview, in one round trip. Returns nothing at
-- all to somebody who is not a moderator: the guard is inside the function
-- rather than in the interface that calls it.
create or replace function public.admin_overview() returns json
language sql stable security definer set search_path = public as $$
  select case when not public.is_admin() then null else json_build_object(
    'members',            (select count(*) from public.profiles),
    'members_week',       (select count(*) from public.profiles
                            where created_at >= now() - interval '7 days'),
    'members_month',      (select count(*) from public.profiles
                            where created_at >= now() - interval '30 days'),
    'active_week',        (select count(*) from public.profiles
                            where last_seen_at >= now() - interval '7 days'),
    'professionals',      (select count(*) from public.profiles
                            where role = 'professional'),

    'posts',              (select count(*) from public.posts where is_deleted = false),
    'posts_week',         (select count(*) from public.posts
                            where is_deleted = false
                              and created_at >= now() - interval '7 days'),
    'posts_month',        (select count(*) from public.posts
                            where is_deleted = false
                              and created_at >= now() - interval '30 days'),

    'replies',            (select count(*) from public.replies where is_deleted = false),
    'replies_week',       (select count(*) from public.replies
                            where is_deleted = false
                              and created_at >= now() - interval '7 days'),
    'replies_month',      (select count(*) from public.replies
                            where is_deleted = false
                              and created_at >= now() - interval '30 days'),

    -- A question nobody answered is the one number here that is a job rather
    -- than a statistic, which is why it is on the dashboard at all.
    'unanswered',         (select count(*) from public.posts
                            where is_deleted = false and reply_count = 0),
    'open_flags',         (select count(*) from public.flags where resolved = false),
    'resolved_flags_week',(select count(*) from public.flags
                            where resolved = true
                              and resolved_at >= now() - interval '7 days'),
    'removed_week',       (select count(*) from public.posts
                            where is_deleted = true
                              and deleted_at >= now() - interval '7 days'),

    'top_categories',     (select coalesce(json_agg(c), '[]'::json) from (
                            select coalesce(p.category_slug, 'uncategorised') as slug,
                                   count(*) as posts
                              from public.posts p
                             where p.is_deleted = false
                               and p.created_at >= now() - interval '30 days'
                             group by 1 order by 2 desc limit 5
                          ) c),

    'top_members',        (select coalesce(json_agg(m), '[]'::json) from (
                            select pr.display_name,
                                   pr.role::text as role,
                                   count(*) as posts
                              from public.posts p
                              join public.profiles pr on pr.id = p.author_id
                             where p.is_deleted = false
                               and p.created_at >= now() - interval '30 days'
                             group by pr.display_name, pr.role
                             order by 3 desc limit 5
                          ) m),

    'top_posts',          (select coalesce(json_agg(t), '[]'::json) from (
                            select p.id, p.display_name, p.body,
                                   p.like_count, p.reply_count, p.created_at
                              from public.posts p
                             where p.is_deleted = false
                             order by (p.like_count + p.reply_count * 2) desc,
                                      p.created_at desc
                             limit 5
                          ) t),

    'recent',             (select coalesce(json_agg(r), '[]'::json) from (
                            select 'post' as kind, p.id::text, p.display_name,
                                   left(p.body, 140) as body, p.created_at
                              from public.posts p where p.is_deleted = false
                             union all
                            select 'reply', r.id::text, r.display_name,
                                   left(r.body, 140), r.created_at
                              from public.replies r where r.is_deleted = false
                             order by created_at desc limit 8
                          ) r)
  ) end;
$$;

revoke execute on function public.admin_overview() from anon;
grant execute on function public.admin_overview() to authenticated;

-- ----------------------------------------------------------- member search
-- Same function as before, with the columns the members screen was missing:
-- when she joined was already there, but not how much she has written or when
-- she was last here. Counts are per row over at most fifty rows, so a lateral
-- count is cheaper than the join-and-group it replaces.
create or replace function public.search_members(q text)
returns table (
  id uuid,
  display_name text,
  email text,
  role public.user_role,
  professional_category public.professional_category,
  professional_category_other text,
  created_at timestamptz,
  last_seen_at timestamptz,
  post_count bigint,
  reply_count bigint,
  flag_count bigint
)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, u.email::text, p.role,
         p.professional_category, p.professional_category_other,
         p.created_at, p.last_seen_at,
         (select count(*) from public.posts   x where x.author_id = p.id and x.is_deleted = false),
         (select count(*) from public.replies x where x.author_id = p.id and x.is_deleted = false),
         -- How many times this member's own writing has been reported. It is
         -- the difference between a quiet member and one worth looking at.
         (select count(*) from public.flags f
           where f.resolved = false
             and ((f.target_type = 'post'
                   and f.target_id in (select id from public.posts   where author_id = p.id))
               or (f.target_type = 'reply'
                   and f.target_id in (select id from public.replies where author_id = p.id))))
    from public.profiles p
    join auth.users u on u.id = p.id
   where public.is_admin()
     and (
       coalesce(q, '') = ''
       or p.display_name ilike '%' || q || '%'
       or u.email ilike '%' || q || '%'
     )
   order by p.created_at desc
   limit 50;
$$;

revoke execute on function public.search_members(text) from anon;
grant execute on function public.search_members(text) to authenticated;

-- Check it took.
select 'last_seen_at' as thing,
       (select count(*) from information_schema.columns
         where table_schema='public' and table_name='profiles'
           and column_name='last_seen_at')::text as present
union all
select 'admin_overview', (select count(*)::text from pg_proc
                           where proname='admin_overview')
union all
select 'touch_last_seen', (select count(*)::text from pg_proc
                            where proname='touch_last_seen');
