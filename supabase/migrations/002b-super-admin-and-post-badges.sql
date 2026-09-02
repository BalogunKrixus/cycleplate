-- Step 2 of 2. Run 002a first, in its own query, or this fails on the enum.
--
-- Safe to run more than once.
--
-- Two things change.
--
-- First, "admin" splits in two. A moderator needs to remove a post and clear a
-- flag; they do not need to be able to hand somebody else the power to do that,
-- and until now every admin could. Granting privileges is now a super admin's
-- job alone, and it is enforced by policy rather than by which buttons happen to
-- be on screen.
--
-- Second, posts gain the same role snapshot replies already had. A dietitian
-- replying carried a badge; the same dietitian starting a thread did not, which
-- is the wrong way round, since a post is the more visible of the two.

-- ----------------------------------------------------------------- posts
-- Snapshotted at the time of writing, exactly as on replies: revoking somebody's
-- Professional status later should not silently strip the badge from advice
-- already given under it.
alter table public.posts
  add column if not exists author_role public.user_role not null default 'member',
  add column if not exists professional_category public.professional_category,
  add column if not exists professional_category_other text;

-- ---------------------------------------------------------------- helpers
-- is_admin stays the question "can this person moderate", so a super admin
-- answers yes to it and every existing moderation policy keeps working.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and role = 'super_admin'
  );
$$;

-- --------------------------------------------------------------------- RLS
-- The old policy let any admin update any profile, which included the role
-- column. Moderation does not touch profiles at all, so the whole permission
-- moves to super admins rather than being narrowed field by field.
drop policy if exists profiles_admin_update on public.profiles;

drop policy if exists profiles_super_admin_update on public.profiles;
create policy profiles_super_admin_update on public.profiles for update
  using (public.is_super_admin()) with check (public.is_super_admin());

-- ------------------------------------------------- last super admin standing
-- A super admin who demotes the only other super admin, or themselves, locks
-- the role out of the product for good: there is no interface left that can
-- grant it back, only a hand written SQL statement. The trigger refuses the
-- edit that would empty the set.
create or replace function public.keep_one_super_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'super_admin' and new.role <> 'super_admin' then
    if (select count(*) from public.profiles where role = 'super_admin') <= 1 then
      raise exception 'there has to be at least one super admin'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists profiles_super_admin_guard on public.profiles;
create trigger profiles_super_admin_guard before update on public.profiles
  for each row execute function public.keep_one_super_admin();

-- ------------------------------------------------------- the first two
-- Everything above is machinery; this is the part that does something. Both
-- accounts have to exist already, so sign up first if either does not.
update public.profiles set role = 'super_admin'
 where id in (
   select id from auth.users
    where email in ('balogunkrixus@gmail.com', 'edoyugbomercy@gmail.com')
 );

-- Check it took. Anyone missing here has not signed up yet.
select u.email, p.display_name, p.role
  from public.profiles p
  join auth.users u on u.id = p.id
 where p.role in ('admin', 'super_admin')
 order by p.role, u.email;
