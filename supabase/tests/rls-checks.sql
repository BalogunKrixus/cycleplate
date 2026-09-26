-- Does the database actually stop a member doing an admin's job?
--
-- Paste the whole file into the Supabase SQL editor and run it. It writes
-- nothing that survives: everything happens inside one transaction that is
-- rolled back at the end. Every check raises an exception the moment it fails,
-- so a clean run to the final notice is the pass.
--
-- WHY THIS EXISTS AS SQL RATHER THAN A TEST IN THE REPO
-- The protection being tested is row level security, which lives in Postgres
-- and is invisible to anything mocking the database. A test that ran against a
-- stub would pass whatever the policies said, which is worse than no test: it
-- would be evidence of something that had never been checked. This runs against
-- the real database with a real member's identity, which is the only place the
-- question can honestly be asked.
--
-- WHAT IT DOES NOT COVER
-- The server actions in lib/actions.ts check roles too. Those checks decide
-- what sentence to show; these decide what is allowed. If a check here fails,
-- the product has a hole whatever the interface does.

begin;

do $$
declare
  member_id  uuid;
  admin_id   uuid;
  pro_id     uuid;
  victim_post uuid;
  n integer;
begin
  -- A plain member and somebody else's post to aim at.
  select id into member_id from public.profiles where role = 'member' limit 1;
  select id into admin_id  from public.profiles where role in ('admin','super_admin') limit 1;

  if member_id is null then
    raise exception 'no ordinary member exists to test with. Sign up a normal account first.';
  end if;
  if admin_id is null then
    raise exception 'no admin exists. Run 002a and 002b first.';
  end if;

  insert into public.posts (author_id, display_name, body, author_role)
  values (admin_id, 'Bait', 'A post an ordinary member must not be able to touch.', 'admin')
  returning id into victim_post;

  -- Become that member: the role and the claims together are what auth.uid()
  -- and the policies read.
  perform set_config('request.jwt.claims',
                     json_build_object('sub', member_id, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  ---------------------------------------------------------------- roles
  if public.is_admin() then
    raise exception 'FAIL: an ordinary member passes is_admin()';
  end if;
  if public.is_super_admin() then
    raise exception 'FAIL: an ordinary member passes is_super_admin()';
  end if;

  -- Cannot make herself an admin.
  update public.profiles set role = 'admin' where id = member_id;
  if (select role from public.profiles where id = member_id) = 'admin' then
    raise exception 'FAIL: a member promoted herself to admin';
  end if;

  -- Cannot promote anybody else either.
  update public.profiles set role = 'admin'
   where id in (select id from public.profiles where id <> member_id limit 1);
  get diagnostics n = row_count;
  if n > 0 then
    raise exception 'FAIL: a member changed another account''s role';
  end if;

  -- Cannot give herself a professional badge. This is the one an ordinary
  -- member would actually try: the role is what draws the badge, but a
  -- category on a member row is still a clinical title she did not earn.
  update public.profiles set professional_category = 'doctor' where id = member_id;
  if (select professional_category from public.profiles where id = member_id) is not null then
    raise exception 'FAIL: a member awarded herself a professional category';
  end if;

  ---------------------------------------------------- other people's content
  update public.posts set is_deleted = true where id = victim_post;
  get diagnostics n = row_count;
  if n > 0 then
    raise exception 'FAIL: a member deleted somebody else''s post';
  end if;

  update public.posts set is_pinned = true where id = victim_post;
  get diagnostics n = row_count;
  if n > 0 then
    raise exception 'FAIL: a member pinned a post';
  end if;

  update public.replies set is_deleted = true
   where id in (select id from public.replies limit 1);
  get diagnostics n = row_count;
  if n > 0 then
    raise exception 'FAIL: a member deleted a comment';
  end if;

  -- Cannot post as somebody else.
  begin
    insert into public.posts (author_id, display_name, body, author_role)
    values (admin_id, 'Not me', 'Posted under another account.', 'member');
    raise exception 'FAIL: a member posted as another account';
  exception when insufficient_privilege or check_violation then null;
  end;

  ------------------------------------------------------------- admin reads
  -- Reports are invisible to members: a queue everyone can read tells a bad
  -- actor exactly what has been noticed.
  select count(*) into n from public.flags;
  if n > 0 then
    raise exception 'FAIL: a member can read the moderation queue (% rows)', n;
  end if;

  -- Removed content stays removed for her.
  select count(*) into n from public.posts where is_deleted = true;
  if n > 0 then
    raise exception 'FAIL: a member can read removed posts';
  end if;

  -- Email addresses are not reachable, by the search function or otherwise.
  select count(*) into n from public.search_members('');
  if n > 0 then
    raise exception 'FAIL: a member got rows out of search_members()';
  end if;

  -- And neither are the admin metrics.
  if public.admin_overview() is not null then
    raise exception 'FAIL: a member can read admin_overview()';
  end if;

  ------------------------------------- a professional may set her own category
  -- The mirror of the check above, and the one that was silently broken:
  -- pinning the category for everybody meant a real dietitian could not say
  -- which title she replies under, and the page claimed success anyway.
  select id into pro_id from public.profiles where role = 'professional' limit 1;

  if pro_id is not null then
    perform set_config('request.jwt.claims',
                       json_build_object('sub', pro_id, 'role', 'authenticated')::text, true);

    update public.profiles set professional_category = 'nutritionist' where id = pro_id;
    get diagnostics n = row_count;
    if n = 0 then
      raise exception 'FAIL: a professional cannot set her own category (migration 004 not run?)';
    end if;

    -- ...but still cannot promote herself.
    update public.profiles set role = 'admin' where id = pro_id;
    if (select role from public.profiles where id = pro_id) = 'admin' then
      raise exception 'FAIL: a professional promoted herself to admin';
    end if;
  end if;

  ------------------------------------------------------- the admin can, still
  perform set_config('request.jwt.claims',
                     json_build_object('sub', admin_id, 'role', 'authenticated')::text, true);

  if not public.is_admin() then
    raise exception 'FAIL: an admin does not pass is_admin()';
  end if;
  if public.admin_overview() is null then
    raise exception 'FAIL: an admin cannot read admin_overview()';
  end if;

  update public.posts set is_pinned = true where id = victim_post;
  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'FAIL: an admin cannot pin a post';
  end if;

  raise notice 'PASS: every check held. A member cannot moderate, promote, read reports, read removed content, read email addresses or read the metrics; an admin can.';
end $$;

rollback;
