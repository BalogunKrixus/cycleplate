-- Articles, so Insights can be published from the admin rather than from a
-- deploy. Safe to run more than once; run it whole.
--
-- WHY A TABLE AND NOT FILES
-- The four articles that exist are React files, which means publishing needs a
-- developer, a commit and a build. The point of this is that it does not. A row
-- appears on the public site the moment it is marked published.
--
-- The existing four stay exactly as they are. A static route wins over a
-- dynamic one in Next, so /insights/pcos keeps rendering its file and
-- /insights/<anything-else> falls through to the database. Nothing has to be
-- migrated, and the charts and citations in those four keep working.

create table if not exists public.articles (
  id               uuid primary key default gen_random_uuid(),
  -- The public address. Unique because it is the URL.
  slug             text not null unique
                     check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title            text not null check (char_length(title) between 1 and 200),
  -- Shown on the index and used as the meta description when no SEO one is set.
  excerpt          text,
  body             text not null default '',
  featured_image   text,
  category         text,
  tags             text[] not null default '{}',
  -- Only when they should differ from the title and excerpt. Falling back is
  -- better than making somebody type the same sentence three times.
  seo_title        text,
  seo_description  text,
  status           text not null default 'draft'
                     check (status in ('draft', 'published')),
  -- Set once, the first time it goes live, so editing a published piece does
  -- not keep pushing it to the top of the list.
  published_at     timestamptz,
  author_id        uuid references public.profiles on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists articles_public_idx
  on public.articles (status, published_at desc);

-- ------------------------------------------------------------- timestamps
create or replace function public.touch_article() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  -- First publish stamps the date; later edits leave it alone.
  if new.status = 'published' and old.published_at is null
     and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_article();

create or replace function public.stamp_new_article() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;

drop trigger if exists articles_stamp on public.articles;
create trigger articles_stamp before insert on public.articles
  for each row execute function public.stamp_new_article();

-- -------------------------------------------------------------------- RLS
alter table public.articles enable row level security;

-- A draft is not published. Anyone may read what is published, including
-- somebody with no account, because these are the pages search indexes; a
-- draft is visible only to the team.
drop policy if exists articles_read on public.articles;
create policy articles_read on public.articles for select
  using (status = 'published' or public.is_admin());

drop policy if exists articles_admin_write on public.articles;
create policy articles_admin_write on public.articles for all
  using (public.is_admin()) with check (public.is_admin());

-- Check it took.
select 'articles' as thing,
       (select count(*)::text from information_schema.tables
         where table_schema = 'public' and table_name = 'articles') as present,
       (select count(*)::text from pg_policy
         where polrelid = 'public.articles'::regclass) as policies;
