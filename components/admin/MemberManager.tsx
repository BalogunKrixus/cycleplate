"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMemberRole } from "@/lib/actions";
import { Avatar, Button, Card, timeAgo } from "@/components/ui/Primitives";
import { PROFESSIONAL_CATEGORIES } from "@/lib/config";
import type { MemberRow } from "@/app/admin/members/page";
import type { Profile, ProfessionalCategory } from "@/lib/types";

export function MemberManager({
  query,
  results,
  professionals,
  currentAdminId,
  canGrantRoles,
}: {
  query: string;
  results: MemberRow[];
  professionals: Profile[];
  currentAdminId: string;
  /* Moderating and handing out privileges are different jobs, so an ordinary
     admin sees the same list read only. Row level security says the same thing;
     this only decides whether the controls are worth drawing. */
  canGrantRoles: boolean;
}) {
  const [term, setTerm] = useState(query);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(
            `/admin/members${term.trim() ? `?q=${encodeURIComponent(term.trim())}` : ""}`,
          );
        }}
      >
        <label htmlFor="member-search" className="mb-1.5 block text-[14px] font-medium">
          Find a member
        </label>
        <input
          id="member-search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Display name or email"
          className="input"
        />
      </form>

      <section>
        <h2 className="text-[20px]">
          {query ? `Results for "${query}"` : "Recent members"}
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {results.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[15px] text-muted">No members found.</p>
            </Card>
          ) : (
            results.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isSelf={member.id === currentAdminId}
                canGrantRoles={canGrantRoles}
              />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-[20px]">Professionals</h2>
        <p className="mt-1 text-[14px] text-muted">
          Everyone whose posts and replies carry a professional badge.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {professionals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[15px] text-muted">
                Nobody has Professional status yet.
              </p>
            </Card>
          ) : (
            professionals.map((pro) => (
              <Card key={pro.id} className="flex items-center gap-3 p-4">
                <Avatar displayName={pro.display_name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium">{pro.display_name}</p>
                  <p className="text-[13px] capitalize text-muted">
                    {pro.professional_category === "other"
                      ? pro.professional_category_other || "Other"
                      : pro.professional_category || "No category set"}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function MemberCard({
  member,
  isSelf,
  canGrantRoles,
}: {
  member: MemberRow;
  isSelf: boolean;
  canGrantRoles: boolean;
}) {
  const [category, setCategory] = useState<ProfessionalCategory | "">(
    member.professional_category ?? "",
  );
  const [other, setOther] = useState(member.professional_category_other ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function apply(role: "member" | "professional" | "admin") {
    setError(null);
    startTransition(async () => {
      const result = await setMemberRole(
        member.id,
        role,
        role === "professional" ? ((category || null) as ProfessionalCategory | null) : null,
        role === "professional" && category === "other" ? other : null,
      );
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  const isProfessional = member.role === "professional";
  const isAdmin = member.role === "admin";

  /* One sentence explaining why there are no buttons, or null if there are.
     Written in order of how surprising it would be to hit each case. */
  const locked = !canGrantRoles
    ? "Only a super admin can change roles."
    : isSelf
      ? "This is you. Your own role is not editable here."
      : member.role === "super_admin"
        ? "Super admins are set in the database."
        : null;

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <Avatar displayName={member.display_name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[15px] font-medium">{member.display_name}</p>
            <span className="rounded-chip bg-bg2 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {ROLE_LABELS[member.role]}
            </span>
            {isProfessional && member.professional_category ? (
              <span className="text-[13px] text-faint">{categoryLabel(member)}</span>
            ) : null}
            {/* Only when there is something to see. A quiet member and a
                reported one look identical without this. */}
            {member.flag_count ? (
              <span className="rounded-chip bg-menstrual/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-menstrual-ink">
                {member.flag_count} reported
              </span>
            ) : null}
          </div>

          <p className="truncate text-[13px] text-muted">{member.email}</p>

          {/* Joined, last seen, and how much she has written. Undefined rather
              than zero means migration 003 has not run, and the line is left
              off entirely rather than claiming she has never posted. */}
          <p className="mt-1 text-[13px] text-faint">
            Joined {formatDate(member.created_at)}
            {member.last_seen_at !== undefined
              ? ` · ${member.last_seen_at ? `last seen ${timeAgo(member.last_seen_at)}` : "not seen since this was added"}`
              : ""}
            {member.post_count !== undefined
              ? ` · ${member.post_count} post${member.post_count === 1 ? "" : "s"}, ${member.reply_count ?? 0} comment${member.reply_count === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>
      </div>

      {locked ? (
        <p className="mt-4 text-[13px] text-muted">{locked}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {/* Professional status and its category are one decision, so they are
              granted together rather than as a role now and a category later
              that somebody forgets to set. */}
          <div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[180px] flex-1">
                <label
                  htmlFor={`category-${member.id}`}
                  className="mb-1.5 block text-[13px] font-medium"
                >
                  Posts and replies as
                </label>
                {/* The label was here all along but was not tied to the control,
                    so a screen reader announced an unnamed combo box. One id per
                    member, because this card repeats down the page. */}
                <select
                  id={`category-${member.id}`}
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ProfessionalCategory | "")
                  }
                  className="input"
                  disabled={isAdmin}
                >
                  <option value="">Choose one</option>
                  {PROFESSIONAL_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {isProfessional ? (
                <Button
                  variant="quiet"
                  disabled={pending}
                  onClick={() => apply("member")}
                >
                  Revoke
                </Button>
              ) : null}

              <Button
                disabled={pending || !category || isAdmin}
                onClick={() => apply("professional")}
              >
                {isProfessional ? "Update" : "Make professional"}
              </Button>
            </div>

            {category === "other" ? (
              <input
                value={other}
                onChange={(e) => setOther(e.target.value)}
                aria-label="Their professional title"
                placeholder="Their title"
                maxLength={40}
                className="input mt-2"
                disabled={isAdmin}
              />
            ) : null}
          </div>

          {/* Moderator rights are a separate line, with their own sentence,
              because handing somebody the ability to delete other people's
              posts should not look like picking an item from a dropdown. */}
          <div className="rounded-card bg-bg2 p-4">
            <p className="text-[13px] font-medium">Moderator</p>
            <p className="mt-1 text-[13px] text-muted">
              {isAdmin
                ? "Can remove posts and clear flags. Cannot change anyone's role."
                : "Lets them remove posts and clear flags across the community."}
            </p>
            <Button
              variant="quiet"
              className="mt-3"
              disabled={pending}
              onClick={() => apply(isAdmin ? "member" : "admin")}
            >
              {isAdmin ? "Remove moderator rights" : "Make moderator"}
            </Button>
          </div>

          {error ? (
            <p role="alert" className="text-[13px] text-menstrual">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </Card>
  );
}

const ROLE_LABELS: Record<MemberRow["role"], string> = {
  member: "Member",
  professional: "Professional",
  admin: "Moderator",
  super_admin: "Super admin",
};

function categoryLabel(member: MemberRow) {
  if (member.professional_category === "other") {
    return member.professional_category_other || "Other";
  }
  return (
    PROFESSIONAL_CATEGORIES.find((c) => c.value === member.professional_category)
      ?.label ?? member.professional_category
  );
}

/* Short and unambiguous. toLocaleDateString with no locale renders differently
   depending on where the server thinks it is, which is how a join date ends up
   reading as a different month to the person who typed it. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
