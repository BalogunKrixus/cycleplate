"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient as createAuthClient } from "@supabase/supabase-js";
import { createClient, getViewer } from "@/lib/supabase/server";
import { isModerator, isSuperAdmin } from "@/lib/roles";
import { RESERVED_ARTICLE_SLUGS, slugify } from "@/lib/config";
import { emailConfigured, sendBatch, type Envelope } from "@/lib/email";
import { notificationHtml, notificationText } from "@/lib/notificationEmail";
import { supabaseEnv } from "@/lib/supabase/env";
import { POST_MAX_LENGTH, REPLY_MAX_LENGTH } from "@/lib/config";
import { validateDisplayName } from "@/lib/displayName";
import type { ProfessionalCategory } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/* Asking for a password reset link.
 *
 * This runs on the server, and that is the whole point of it.
 *
 * It used to run in the browser, through the client in lib/supabase/client.ts.
 * That client speaks PKCE, as it should for everything else, and a PKCE reset
 * makes Supabase mint a token hash prefixed "pkce_". The emailed link then
 * carries token_hash=pkce_… and verifyOtp cannot redeem it: a PKCE token is
 * meant to be traded through Supabase's own verify endpoint for a code, and
 * that code can only be exchanged by the browser holding the other half of the
 * pair. Which is the cross-device problem the token hash link existed to solve,
 * arriving back through the front door.
 *
 * A plain client on the implicit flow sends no code challenge, so the token
 * hash comes back unprefixed and the link works wherever it is opened.
 *
 * The second reason is duller and nearly as useful: a failure here is now a
 * line in the server logs rather than something only visible in the browser
 * console of whoever it happened to.
 *
 * No session is involved, so this client is deliberately cookie free.
 */
export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const address = email.trim().toLowerCase();
  if (!address.includes("@")) {
    return { ok: false, error: "That does not look like an email address." };
  }

  const { url, key } = supabaseEnv();
  const supabase = createAuthClient(url, key, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false },
  });

  /* Only reached if the email template still sends {{ .ConfirmationURL }}. The
     template in docs/email-templates builds its own link from the Site URL and
     ignores this. Kept so a project whose template has not been updated still
     lands somewhere that can finish the job. */
  const head = await headers();
  const host = head.get("x-forwarded-host") ?? head.get("host");
  const proto = head.get("x-forwarded-proto") ?? "https";

  const { error } = await supabase.auth.resetPasswordForEmail(
    address,
    host
      ? { redirectTo: `${proto}://${host}/auth/callback?next=%2Fauth%2Freset-password` }
      : {},
  );

  if (error) {
    console.error("requestPasswordReset failed:", error.status, error.message);
    return { ok: false, error: describeSendFailure(error) };
  }

  /* Supabase answers the same whether or not the address has an account, and so
     does this. A form that says "no account with that email" is a way to find
     out who is a member, and in a community about PCOS and endometriosis that
     is not a small thing to leak. */
  return { ok: true };
}

/* Turns a Supabase error into something worth reading, without ever answering
   the question of whether the address has an account. Rate limits say nothing
   about that: they are counted per project, not per address. */
function describeSendFailure(error: { message: string; status?: number }): string {
  const message = error.message.toLowerCase();

  const wait = message.match(/after (\d+) seconds?/);
  if (wait) return `Too many requests just now. Try again in ${wait[1]} seconds.`;

  if (error.status === 429 || message.includes("rate limit")) {
    return "Too many reset emails have been sent recently. Wait a few minutes and try again.";
  }
  if (message.includes("invalid") && message.includes("email")) {
    return "That does not look like an email address.";
  }
  return "We could not send the email just now. Please try again in a few minutes.";
}

/* Row level security is the real gate. These checks exist so a member gets a
   sentence explaining what went wrong rather than an opaque database error. */

export async function createPost(
  body: string,
  categorySlug: string | null,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Please sign in to post." };

  const text = body.trim();
  if (!text) return { ok: false, error: "Write something first." };
  if (text.length > POST_MAX_LENGTH) {
    return { ok: false, error: `Posts are up to ${POST_MAX_LENGTH} characters.` };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("posts").insert({
    author_id: viewer.id,
    // snapshotted, so a later rename does not rewrite what people already read
    display_name: viewer.display_name,
    body: text,
    category_slug: categorySlug,
    /* Same reasoning as on replies. A dietitian who starts a thread should
       carry the badge the moment it is read, and should keep it there even if
       the status is revoked afterwards. */
    author_role: viewer.role,
    professional_category: viewer.professional_category,
    professional_category_other: viewer.professional_category_other,
  });

  if (error) return { ok: false, error: "That did not save. Please try again." };

  revalidatePath("/app");
  return { ok: true };
}

export async function createReply(
  postId: string,
  body: string,
  professionalCategory: ProfessionalCategory | null,
  professionalCategoryOther: string | null,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Please sign in to reply." };

  const text = body.trim();
  if (!text) return { ok: false, error: "Write something first." };
  if (text.length > REPLY_MAX_LENGTH) {
    return { ok: false, error: `Replies are up to ${REPLY_MAX_LENGTH} characters.` };
  }

  /* A professional has to say what they are answering as before the badge is
     attached, because the badge is what gives the answer its weight. */
  let category = viewer.professional_category;
  let categoryOther = viewer.professional_category_other;

  if (viewer.role === "professional") {
    category = professionalCategory ?? category;
    categoryOther = professionalCategoryOther ?? categoryOther;

    if (!category) {
      return { ok: false, error: "Choose what you are replying as." };
    }
    if (category === "other" && !categoryOther?.trim()) {
      return { ok: false, error: "Add the title you are replying as." };
    }

    const supabase = await createClient();
    // remembered, so they are not asked on every reply
    await supabase
      .from("profiles")
      .update({
        professional_category: category,
        professional_category_other: categoryOther,
      })
      .eq("id", viewer.id);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("replies").insert({
    post_id: postId,
    author_id: viewer.id,
    display_name: viewer.display_name,
    body: text,
    // snapshotted, so revoking Professional later does not strip the badge from
    // advice that was given under it
    author_role: viewer.role,
    professional_category: viewer.role === "professional" ? category : null,
    professional_category_other:
      viewer.role === "professional" && category === "other" ? categoryOther : null,
  });

  if (error) return { ok: false, error: "That did not save. Please try again." };

  revalidatePath("/app");
  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

export async function flagContent(
  targetType: "post" | "reply",
  targetId: string,
  reason: string | null,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Please sign in to flag." };

  const supabase = await createClient();
  const { error } = await supabase.from("flags").insert({
    target_type: targetType,
    target_id: targetId,
    flagged_by: viewer.id,
    reason: reason?.trim() || null,
  });

  // one flag per person per item, so flagging twice is a no op rather than an error
  if (error && !error.message.includes("duplicate")) {
    return { ok: false, error: "That did not send. Please try again." };
  }

  return { ok: true };
}

export async function updateDisplayName(name: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Please sign in." };
  if (viewer.display_name_changed) {
    return { ok: false, error: "You have already changed your name once." };
  }

  const problem = validateDisplayName(name);
  if (problem) return { ok: false, error: problem };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name.trim(), display_name_changed: true })
    .eq("id", viewer.id);

  if (error) {
    return { ok: false, error: "That name is taken. Try another." };
  }

  revalidatePath("/account");
  return { ok: true };
}

export async function updateProfessionalCategory(
  category: ProfessionalCategory,
  other: string | null,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Please sign in." };
  if (viewer.role !== "professional") {
    return { ok: false, error: "Only professionals can set a category." };
  }
  if (category === "other" && !other?.trim()) {
    return { ok: false, error: "Add the title you reply as." };
  }

  const supabase = await createClient();

  /* Selecting the row back is the point, not a convenience.
   *
   * Row level security decides this, and an update it refuses does not raise:
   * it matches no rows and returns success, so the old code told a dietitian
   * her qualification had been saved when nothing had been written. Asking for
   * the row back is the only way to tell "saved" from "silently refused". */
  const { data, error } = await supabase
    .from("profiles")
    .update({
      professional_category: category,
      professional_category_other: category === "other" ? other!.trim() : null,
    })
    .eq("id", viewer.id)
    .select("id");

  if (error) return { ok: false, error: "That did not save. Please try again." };
  if (!data || data.length === 0) {
    return {
      ok: false,
      error:
        "That did not save. Ask an admin to set your category, or try again shortly.",
    };
  }

  revalidatePath("/account");
  return { ok: true };
}

/* ------------------------------------------------------------------ admin */

export async function softDelete(
  targetType: "post" | "reply",
  targetId: string,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer || !isModerator(viewer)) {
    return { ok: false, error: "Not allowed." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from(targetType === "post" ? "posts" : "replies")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: viewer.id,
    })
    .eq("id", targetId);

  if (error) return { ok: false, error: "That did not save." };

  revalidatePath("/app");
  revalidatePath("/admin");
  return { ok: true };
}

export async function restoreContent(
  targetType: "post" | "reply",
  targetId: string,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer || !isModerator(viewer)) {
    return { ok: false, error: "Not allowed." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from(targetType === "post" ? "posts" : "replies")
    .update({ is_deleted: false, deleted_at: null, deleted_by: null })
    .eq("id", targetId);

  if (error) return { ok: false, error: "That did not save." };

  revalidatePath("/app");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setPinned(
  postId: string,
  pinned: boolean,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer || !isModerator(viewer)) {
    return { ok: false, error: "Not allowed." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ is_pinned: pinned })
    .eq("id", postId);

  if (error) return { ok: false, error: "That did not save." };

  revalidatePath("/app");
  revalidatePath("/admin");
  return { ok: true };
}

export async function resolveFlag(flagId: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer || !isModerator(viewer)) {
    return { ok: false, error: "Not allowed." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("flags")
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: viewer.id,
    })
    .eq("id", flagId);

  if (error) return { ok: false, error: "That did not save." };

  revalidatePath("/admin");
  return { ok: true };
}

export async function setMemberRole(
  memberId: string,
  role: "member" | "professional" | "admin",
  category: ProfessionalCategory | null,
  categoryOther: string | null,
): Promise<ActionResult> {
  const viewer = await getViewer();

  /* Moderating and granting privileges are different jobs. An admin can remove
     a post; only a super admin decides who else gets to. Row level security
     says the same thing, so this is here to produce a sentence rather than a
     database error. */
  if (!viewer || !isSuperAdmin(viewer)) {
    return { ok: false, error: "Only a super admin can change roles." };
  }
  if (memberId === viewer.id) {
    return { ok: false, error: "You cannot change your own role here." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      role,
      professional_category: role === "professional" ? category : null,
      professional_category_other:
        role === "professional" && category === "other" ? categoryOther : null,
    })
    .eq("id", memberId);

  if (error) return { ok: false, error: "That did not save." };

  revalidatePath("/admin/members");
  return { ok: true };
}

/* ---------------------------------------------------------------- insights */

export interface ArticleInput {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  featured_image: string;
  category: string;
  tags: string;
  seo_title: string;
  seo_description: string;
  status: "draft" | "published";
}

export async function saveArticle(
  input: ArticleInput,
): Promise<ActionResult & { id?: string; slug?: string }> {
  const viewer = await getViewer();
  if (!viewer || !isModerator(viewer)) {
    return { ok: false, error: "Not allowed." };
  }

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Give it a title." };

  const slug = slugify(input.slug.trim() || title);
  if (!slug) return { ok: false, error: "That title makes an empty address." };

  /* The four original articles are files, and a static route wins over a
     dynamic one. A row with one of their slugs would save happily and then be
     unreachable for ever, which is worse than being told no. */
  if ((RESERVED_ARTICLE_SLUGS as readonly string[]).includes(slug)) {
    return {
      ok: false,
      error: `"${slug}" is one of the original articles. Choose another address.`,
    };
  }

  if (input.status === "published" && !input.body.trim()) {
    return { ok: false, error: "There is nothing to publish yet." };
  }

  const supabase = await createClient();

  const row = {
    slug,
    title,
    excerpt: input.excerpt.trim() || null,
    body: input.body,
    featured_image: input.featured_image.trim() || null,
    category: input.category.trim() || null,
    tags: input.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    seo_title: input.seo_title.trim() || null,
    seo_description: input.seo_description.trim() || null,
    status: input.status,
  };

  const { data, error } = input.id
    ? await supabase
        .from("articles")
        .update(row)
        .eq("id", input.id)
        .select("id, slug")
        .maybeSingle()
    : await supabase
        .from("articles")
        .insert({ ...row, author_id: viewer.id })
        .select("id, slug")
        .maybeSingle();

  if (error) {
    /* 23505 is the unique index on slug. Everything else is a surprise and is
       worth saying out loud rather than flattening into "that did not save". */
    if (error.code === "23505") {
      return { ok: false, error: `Something already lives at /insights/${slug}.` };
    }
    console.error("saveArticle failed:", error.code, error.message);
    return { ok: false, error: "That did not save. Please try again." };
  }

  /* Selecting the row back is the check, not a convenience: row level security
     refuses without raising, so no row means the write was declined. */
  if (!data) return { ok: false, error: "Not allowed." };

  revalidatePath("/insights");
  revalidatePath(`/insights/${slug}`);
  revalidatePath("/admin/insights");
  return { ok: true, id: data.id as string, slug: data.slug as string };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer || !isModerator(viewer)) {
    return { ok: false, error: "Not allowed." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error) return { ok: false, error: "That did not delete." };
  if (!data) return { ok: false, error: "Not allowed." };

  revalidatePath("/insights");
  revalidatePath(`/insights/${data.slug as string}`);
  revalidatePath("/admin/insights");
  return { ok: true };
}

/* ----------------------------------------------------------- notifications */

interface Recipient {
  id: string;
  email: string;
  display_name: string;
  unsubscribe_token: string;
}

/* How many people a send would actually reach, for the screen that is about
   to ask somebody to press a button they cannot take back. */
export async function countRecipients(): Promise<
  ActionResult & { count?: number; configured?: boolean }
> {
  const viewer = await getViewer();
  if (!viewer || !isModerator(viewer)) return { ok: false, error: "Not allowed." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("notification_recipients");
  if (error) {
    return {
      ok: false,
      error:
        error.code === "42883"
          ? "Run migration 006 first: notifications are not set up yet."
          : "Could not read the member list.",
    };
  }

  return {
    ok: true,
    count: (data as Recipient[] | null)?.length ?? 0,
    configured: emailConfigured(),
  };
}

export async function sendNotification(input: {
  subject: string;
  body: string;
  postId: string | null;
}): Promise<ActionResult & { sent?: number; failed?: number }> {
  const viewer = await getViewer();
  if (!viewer || !isModerator(viewer)) return { ok: false, error: "Not allowed." };

  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!subject) return { ok: false, error: "Give it a subject." };
  if (!body) return { ok: false, error: "Write something to send." };
  if (!emailConfigured()) {
    return {
      ok: false,
      error:
        "No RESEND_API_KEY is set on the deployment, so nothing can be sent yet.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("notification_recipients");
  if (error) return { ok: false, error: "Could not read the member list." };

  const recipients = (data as Recipient[] | null) ?? [];
  if (recipients.length === 0) {
    return { ok: false, error: "Nobody is opted in to receive these." };
  }

  /* Absolute, because this is going into an inbox. Taken from the request so a
     preview deployment mails links back to itself rather than to production. */
  const head = await headers();
  const host = head.get("x-forwarded-host") ?? head.get("host") ?? "hellocycleplate.com";
  const proto = head.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;

  const link = input.postId ? `${origin}/app?post=${input.postId}` : undefined;

  const envelopes: Envelope[] = recipients.map((r) => {
    const unsubscribeUrl = `${origin}/unsubscribe/${r.unsubscribe_token}`;
    return {
      to: r.email,
      subject,
      html: notificationHtml({
        body,
        link,
        linkLabel: "Read it in the community",
        unsubscribeUrl,
      }),
      text: notificationText({ body, link, unsubscribeUrl }),
    };
  });

  const report = await sendBatch(envelopes);

  /* Recorded whatever happened, including a total failure, because "did we
     email about that?" is the question this table exists to answer. */
  await supabase.from("notifications_sent").insert({
    subject,
    body,
    post_id: input.postId,
    sent_by: viewer.id,
    recipients: report.sent,
    failed: report.failed,
  });

  revalidatePath("/admin/notifications");

  if (report.sent === 0) {
    return {
      ok: false,
      error: `Nothing was sent. ${report.firstError ?? "The mail provider refused every message."}`,
    };
  }

  return { ok: true, sent: report.sent, failed: report.failed };
}

/* A member turning notification email on or off from her account.
 *
 * The unsubscribe link in the mail is the path most people will use, but
 * somebody who has decided in advance should not have to wait to be emailed
 * before she can say no. Only ever her own row; role and category are pinned
 * by policy regardless. */
export async function setEmailOptIn(optIn: boolean): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Please sign in." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ email_opt_in: optIn })
    .eq("id", viewer.id)
    .select("id");

  if (error) {
    return {
      ok: false,
      error:
        error.code === "42703"
          ? "Email preferences are not set up yet. Run migration 006."
          : "That did not save. Please try again.",
    };
  }
  if (!data || data.length === 0) return { ok: false, error: "That did not save." };

  revalidatePath("/account");
  return { ok: true };
}
