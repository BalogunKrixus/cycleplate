-- Step 1 of 2. Adds the super_admin role to the enum, and nothing else.
--
-- Run this on its own, then run 002b in a second query. That is not fussiness:
-- Postgres will not let a new enum value be *used* in the same transaction that
-- adds it, and the SQL Editor runs whatever is in the box as one transaction.
-- Together in one go, 002b fails with "unsafe use of new value".
--
-- Safe to run more than once.

do $$ begin
  alter type public.user_role add value if not exists 'super_admin';
exception when duplicate_object then null; end $$;
