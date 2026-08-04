# CyclePlate

Cycle-aligned nutrition guidance and a community for women, grounded in
published research. One Next.js application serving both the marketing site and
the community, at [hellocycleplate.com](https://hellocycleplate.com).

## Running it

```bash
npm install
cp .env.local.example .env.local   # fill in the two Supabase values
npm run dev
```

`npm run typecheck` and `npm run build` are the two things worth running before
pushing. There is no test suite yet.

## Configuration

| Variable | Needed for | Where it comes from |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | the community | Supabase, Project Settings, API Keys |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the community | same page, the publishable key |
| `SHEET_WEBHOOK_URL` | partner enquiries | the Apps Script deployment in `docs/` |
| `BUTTONDOWN_API_KEY` | the newsletter | Buttondown account settings |

Both `NEXT_PUBLIC_` values are read at build time, so setting them is not enough
on its own: the project has to be redeployed afterwards.

The Supabase secret key is not used anywhere in this application. It bypasses
every row level security policy, so it should never appear in a `NEXT_PUBLIC_`
variable or in this repository.

`GET /api/subscribe?check=1` reports whether the spreadsheet webhook is reachable
without a Google session, which is the part of that setup that tends to break.

## Setting up Supabase

1. SQL Editor, run `supabase/schema.sql`. Tables, triggers, and the row level
   security policies. Safe to run more than once.
2. Run `supabase/seed.sql` for the starting categories.
3. Authentication, URL Configuration: set the Site URL to the deployed address
   and add it to Redirect URLs as `https://your-host/**`. Sign up asks for a
   link back to whichever host the browser is on, and Supabase refuses any
   address not on that list.
4. Sign up through the site, then grant yourself admin:

   ```sql
   update public.profiles set role = 'admin'
    where id = (select id from auth.users where email = 'you@example.com')
    returning display_name, role;
   ```

## How it is put together

```
app/
  page.tsx            home
  about, science, journal/, partners, privacy, terms
  community/          the feed, readable without an account
  join/               the single destination for every Join CTA
  auth/               sign in, and the confirmation callback
  account/            display name, professional category, sign out
  admin/              moderation queue and member management
  api/subscribe/      newsletter and partner enquiries
components/
  chrome/             header and footer, shared by everything
  brand/              the mark, wordmark and lockup
  marketing/          charts, article shell, forms, scroll reveal
  feed/ post/ interactions/ admin/ ui/
lib/
  actions.ts          every community write, re-checking permission server side
  supabase/           browser and server clients
supabase/             schema and seed
```

### Decisions worth knowing

**The stylesheet is the source of truth, not the Tailwind config.** `app/globals.css`
holds the design system as plain CSS with the tokens on `:root`. Tailwind's
colours point at those same custom properties, so the marketing pages and the
community cannot drift apart, and the dark theme works everywhere without a
single `dark:` prefix.

**The header reads the session on the server.** That is what makes this one
product rather than two: it can say "Go to community" to somebody who has
already joined. It also means `getViewer` runs on every page, so it degrades to
"signed out" rather than throwing when Supabase is unreachable. An article about
period pain should not go down because a database is having a bad afternoon.

**Roles are enforced in Postgres, not the interface.** Hiding an admin button is
not access control. Every table has row level security, and the policies are the
thing that actually stops a member deleting someone else's post. The checks in
`lib/actions.ts` exist so people get a readable sentence instead of a database
error.

**Email never reaches a table the feed can read.** `public.profiles` is world
readable, because the feed shows display names and badges. Email lives in
`auth.users`, and the only way to see one is `search_members`, a security
definer function that returns nothing unless the caller is an admin.

**A handle can be changed once, and that is a trigger.** Members hold the
publishable key in their browser, so anything enforced only in a server action
can be stepped around with a direct API call.

**Display names and roles are snapshotted onto posts.** A rename does not
rewrite what people already read, and revoking Professional status does not
silently strip the badge from advice given under it.

**Deletion is soft.** Removed content is hidden by policy and stays in the
database with who removed it and when.

**Old `.html` addresses redirect permanently.** The site was twelve static files
before it was an application, and those URLs are in search results and in
newsletters already sent.

## Deliberately not included

No mobile app references, no image or video upload, no direct messaging, no
notifications, no payment or subscription gating, no contribution badges, and no
public member directory. The last two were considered and dropped: this is a
community about health, and a leaderboard on disclosure or a browsable list of
who posts in Endometriosis both work against the anonymity the rest of the
design protects.
