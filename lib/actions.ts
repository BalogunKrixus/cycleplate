"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient as createAuthClient } from "@supabase/supabase-js";
import { createClient, getViewer } from "@/lib/supabase/server";
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

  revalidatePath("/community");
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

  revalidatePath("/community");
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
  const { error } = await supabase
    .from("profiles")
    .update({
      professional_category: category,
      professional_category_other: category === "other" ? other!.trim() : null,
    })
    .eq("id", viewer.id);

  if (error) return { ok: false, error: "That did not save. Please try again." };

  revalidatePath("/account");
  return { ok: true };
}

/* ------------------------------------------------------------------ admin */

export async function softDelete(
  targetType: "post" | "reply",
  targetId: string,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (viewer?.role !== "admin") return { ok: false, error: "Not allowed." };

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

  revalidatePath("/community");
  revalidatePath("/admin");
  return { ok: true };
}

export async function restoreContent(
  targetType: "post" | "reply",
  targetId: string,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (viewer?.role !== "admin") return { ok: false, error: "Not allowed." };

  const supabase = await createClient();
  const { error } = await supabase
    .from(targetType === "post" ? "posts" : "replies")
    .update({ is_deleted: false, deleted_at: null, deleted_by: null })
    .eq("id", targetId);

  if (error) return { ok: false, error: "That did not save." };

  revalidatePath("/community");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setPinned(
  postId: string,
  pinned: boolean,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (viewer?.role !== "admin") return { ok: false, error: "Not allowed." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ is_pinned: pinned })
    .eq("id", postId);

  if (error) return { ok: false, error: "That did not save." };

  revalidatePath("/community");
  revalidatePath("/admin");
  return { ok: true };
}

export async function resolveFlag(flagId: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (viewer?.role !== "admin") return { ok: false, error: "Not allowed." };

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
  if (viewer?.role !== "super_admin") {
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
