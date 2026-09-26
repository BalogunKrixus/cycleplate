-- Let a professional set her own qualification. Nothing else changes.
--
-- Safe to run more than once. Run it whole; there is no enum here.
--
-- THE BUG
-- profiles_self_update pinned both role and professional_category to their
-- current values for anyone editing her own row. Pinning role is the whole
-- point of that policy and stays. Pinning category was collateral: the account
-- page offers a dietitian a dropdown to say whether she replies as a dietitian
-- or a nutritionist, the server action allows it, and the policy then refused
-- the write. A refused update matches no rows and does not raise, so the page
-- said "Saved" and nothing had been.
--
-- WHAT THIS DOES NOT OPEN
-- Only somebody who is already a professional may change it, and only her own.
-- An ordinary member editing her own row still cannot set a category, so she
-- cannot give herself a clinical title; and role is still pinned for everyone,
-- so nobody can promote herself into being a professional in the first place.
-- Granting that role remains a super admin's job.

drop policy if exists profiles_self_update on public.profiles;

create policy profiles_self_update on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- Role is pinned, always, for everyone. This is the line that stops a
    -- member making herself an admin.
    and role = (select role from public.profiles where id = auth.uid())
    and (
      -- Either the category is untouched...
      professional_category is not distinct from
        (select professional_category from public.profiles where id = auth.uid())
      -- ...or the person changing it is already a professional.
      or (select role from public.profiles where id = auth.uid()) = 'professional'
    )
  );

-- Check it took.
select polname as policy, pg_get_expr(polwithcheck, polrelid) as with_check
  from pg_policy
 where polname = 'profiles_self_update';
