# Email: making it arrive, and arrive from CyclePlate

Everything in this file is Supabase dashboard configuration. None of it can be
done from the codebase, and until it is done two things are true no matter what
the templates say:

1. **Most reset emails are never sent.** Supabase's built in mailer allows about
   **2 emails per hour for the whole project**, shared across sign ups and
   password resets. It is meant for development. The third person to ask for a
   reset in an hour gets nothing, and until recently the app told them to check
   their inbox anyway. It now says a rate limit was hit — but saying it clearly
   is not the same as fixing it, and this is the fix.
2. **The ones that do arrive come from Supabase.** The sender address and name
   are not editable while the built in mailer is in use.

Both are the same setting.

---

## 1. Custom SMTP

Dashboard → **Project Settings → Authentication → SMTP Settings** → enable
*Custom SMTP*.

| Field | Value |
| --- | --- |
| Sender email | `info@hellocycleplate.com` |
| Sender name | `CyclePlate` |
| Host / Port / Username / Password | from the provider below |
| Minimum interval between emails | `10` seconds is fine once SMTP is on |

**Sender name is the answer to "it looks like it came from a generic auth
provider".** It is this field and nothing else that puts *CyclePlate* in the
inbox list instead of *Supabase Auth*.

`info@hellocycleplate.com` is used because it is already the address on the site
footer, so a reply lands somewhere a person reads. It has to be an address on a
domain you control — `hellocycleplate.com` — not the gmail.com one, or the
authentication in step 2 cannot be set up and the mail goes to spam.

### Picking a provider

Any SMTP provider works. [Resend](https://resend.com) is the least work:
free for 3,000 emails a month, and its whole setup is adding DNS records.

- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: the API key it gives you (starts `re_`)

Amazon SES, Postmark, Mailgun and SendGrid are all equally fine; the fields are
the same.

---

## 2. Domain authentication (this is what keeps it out of spam)

The provider will ask you to add DNS records to `hellocycleplate.com` — an SPF
record, a DKIM record, usually a DMARC record. Add them wherever the domain's
DNS lives.

Skipping this does not stop the mail sending. It sends, and lands in spam,
which looks exactly like not sending and is harder to diagnose. Do not skip it.

Wait for the provider to show the domain as verified before testing.

---

## 3. URL configuration

Dashboard → **Authentication → URL Configuration**.

- **Site URL:** `https://hellocycleplate.com`

  The reset email builds its link on this. If it still says `localhost:3000` or
  a `vercel.app` address, every reset link in every email points there.

- **Redirect URLs**, one per line:

  ```
  https://hellocycleplate.com/**
  https://cycleplate.vercel.app/**
  http://localhost:3000/**
  ```

---

## 4. The templates

Dashboard → **Authentication → Emails**.

| Template | Paste in | Subject |
| --- | --- | --- |
| Reset password | `docs/email-templates/reset-password.html` | Reset your CyclePlate password |
| Confirm signup | `docs/email-templates/confirm-signup.html` | Confirm your email and join the CyclePlate community |

The reset template deliberately does not use `{{ .ConfirmationURL }}`; the
comment at the top of the file explains why, and it matters — that is the
difference between a link that works only in the browser that asked for it and
one that works wherever the mail is opened.

The signup template still uses `{{ .ConfirmationURL }}`. It has the same
same-browser limitation, but signing up and confirming usually happen minutes
apart on one device, so it has been left alone rather than changed alongside a
password reset fix. `app/auth/callback/route.ts` already accepts either shape,
so switching it later is a one line edit to that template.

---

## 5. Checking it worked

1. Sign in as nobody. Go to `/auth/forgot-password`, enter a real address that
   has an account, submit.
2. The email should arrive within a minute, **from CyclePlate**, not Supabase.
3. Open it on a different device from the one you asked on. The link should
   still work — that is the whole point of the token hash link.
4. It should land on `/auth/reset-password` with the form ready, not on the sign
   in page.
5. Set a password, land in the feed signed in.
6. Sign out, sign in with the new password.
7. Open the same link from the email a second time. It should now say the link
   has expired and offer a fresh one.

If step 2 does not happen, it is almost always one of: SMTP not actually
enabled, the domain not verified yet, or the rate limit on the built in mailer
because SMTP is not enabled. The Supabase **Logs → Auth** view says which.
