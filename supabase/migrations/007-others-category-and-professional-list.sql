-- 007 · An "Others" category, and professionals with their addresses
--
-- Two small things the admin asked for, in one file so there is one more
-- migration to run rather than two.
--
-- Safe to run more than once.

-- ------------------------------------------------------------- the category
-- Categories are a table precisely so this does not need a deploy. There is no
-- screen for editing them yet, so for now it is a line of SQL.
--
-- Note it sits alongside the existing "General". They overlap, and that is a
-- judgement call rather than a mistake: retire whichever of the two gets less
-- use once there is some use to look at. Nothing here removes a category,
-- because posts already filed under one would be orphaned by that.
insert into public.categories (slug, label, sort_order) values
  ('others', 'Others', 8)
on conflict (slug) do nothing;

-- -------------------------------------------------------- the professionals
-- The members screen shows professionals in their own tab now, with the same
-- detail as everyone else: address, when they joined, how much they have
-- written. Addresses live in auth.users and must never become readable from
-- the feed, so this is a security definer function gated on is_admin(), the
-- same shape search_members already uses.
--
-- A separate function rather than a parameter on search_members: that one is
-- a search, capped at fifty rows and ordered by newest, which is right for
-- searching and wrong for a standing list. This one is the whole list, by
-- name, because a professional who joined two years ago must not fall off the
-- bottom of the screen that manages her.
create or replace function public.list_professionals()
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
         (select count(*) from public.flags f
           where f.resolved = false
             and ((f.target_type = 'post'
                   and f.target_id in (select id from public.posts   where author_id = p.id))
               or (f.target_type = 'reply'
                   and f.target_id in (select id from public.replies where author_id = p.id))))
    from public.profiles p
    join auth.users u on u.id = p.id
   where public.is_admin()
     and p.role = 'professional'
   order by p.display_name;
$$;

revoke execute on function public.list_professionals() from anon;
grant execute on function public.list_professionals() to authenticated;

-- Check it took.
select 'others category' as thing,
       (select count(*)::text from public.categories where slug = 'others')
union all
select 'list_professionals()',
       (select count(*)::text from pg_proc where proname = 'list_professionals');
