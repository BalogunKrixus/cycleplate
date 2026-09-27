"use client";

import { useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMemberRole } from "@/lib/actions";
import { Avatar, Button, Card, timeAgo } from "@/components/ui/Primitives";
import { PROFESSIONAL_CATEGORIES } from "@/lib/config";
import type { MemberRow } from "@/app/admin/members/page";
import type { ProfessionalCategory } from "@/lib/types";

type Tab = "members" | "professionals";

export function MemberManager({
  query,
  results,
  professionals,
  needsMigration007,
  currentAdminId,
  canGrantRoles,
}: {
  query: string;
  results: MemberRow[];
  professionals: MemberRow[];
  needsMigration007: boolean;
  currentAdminId: string;
  /* Moderating and handing out privileges are different jobs, so an ordinary
     admin sees the same list read only. Row level security says the same thing;
     this only decides whether the controls are worth drawing. */
  canGrantRoles: boolean;
}) {
  const [term, setTerm] = useState(query);
  const [tab, setTab] = useState<Tab>("members");
  const router = useRouter();

  /* A professional in both lists would be two rows for one person, each with
     its own controls, which is how somebody grants a role twice and wonders why
     nothing changed. She belongs to her own tab. */
  const members = useMemo(
    () => results.filter((m) => m.role !== "professional"),
    [results],
  );

  /* The search box drives the server query, which searches everybody. Narrowing
     the professionals here too means a search for one of them finds her in her
     own tab rather than appearing to match nothing. */
  const shownPros = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return professionals;
    return professionals.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q),
    );
  }, [professionals, query]);

  return (
    <div className="flex flex-col gap-6">
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

      {/* Counts on the tabs, so a search that matched in the other tab is
          visible from this one rather than reading as no results at all. */}
      <div role="tablist" aria-label="Which people to show" className="flex gap-2">
        <TabButton
          id="tab-members"
          panelId="panel-members"
          selected={tab === "members"}
          onSelect={() => setTab("members")}
          label="Members"
          count={members.length}
        />
        <TabButton
          id="tab-professionals"
          panelId="panel-professionals"
          selected={tab === "professionals"}
          onSelect={() => setTab("professionals")}
          label="Professionals"
          count={shownPros.length}
        />
      </div>

      {tab === "members" ? (
        <section id="panel-members" role="tabpanel" aria-labelledby="tab-members">
          <p className="text-[14px] text-muted">
            {query
              ? `Matching "${query}". Handles and pictures are left off here on purpose — an address identifies somebody without putting a face to every row.`
              : "Newest first. Handles and pictures are left off on purpose — an address identifies somebody without putting a face to every row."}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {members.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-[15px] text-muted">No members found.</p>
              </Card>
            ) : (
              members.map((member) => (
                <PersonRow
                  key={member.id}
                  person={member}
                  showIdentity={false}
                  isSelf={member.id === currentAdminId}
                  canGrantRoles={canGrantRoles}
                />
              ))
            )}
          </div>
        </section>
      ) : (
        <section
          id="panel-professionals"
          role="tabpanel"
          aria-labelledby="tab-professionals"
        >
          <p className="text-[14px] text-muted">
            Everyone whose posts and replies carry a professional badge.
          </p>

          {needsMigration007 ? (
            <div className="mt-4 rounded-card bg-surface p-5 shadow-card">
              <p className="text-[14px]">
                Email addresses are not showing on this tab yet.
              </p>
              <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-muted">
                They live in a part of the database the site cannot read
                directly, and the function that reads them safely arrives with{" "}
                <code className="text-ink">
                  supabase/migrations/007-others-category-and-professional-list.sql
                </code>
                . Run it in the Supabase SQL editor and reload. Everything else
                on this tab, and every address on the Members tab, works without
                it.
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2">
            {shownPros.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-[15px] text-muted">
                  {query
                    ? "No professionals match that."
                    : "Nobody has Professional status yet."}
                </p>
              </Card>
            ) : (
              shownPros.map((pro) => (
                <PersonRow
                  key={pro.id}
                  person={pro}
                  showIdentity
                  isSelf={pro.id === currentAdminId}
                  canGrantRoles={canGrantRoles}
                />
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function TabButton({
  id,
  panelId,
  selected,
  onSelect,
  label,
  count,
}: {
  id: string;
  panelId: string;
  selected: boolean;
  onSelect: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      id={id}
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      onClick={onSelect}
      className={
        selected
          ? "rounded-chip bg-ink px-4 py-2 text-[14px] font-medium text-cream"
          : "chip-idle rounded-chip px-4 py-2 text-[14px] font-medium"
      }
    >
      {label}
      <span className={selected ? "ml-2 opacity-70" : "ml-2 text-faint"}>{count}</span>
    </button>
  );
}

/* One person, shut by default.
 *
 * Every row used to carry its own open dropdown, a text field and two buttons,
 * so a list of twenty members was a page of controls to scroll past to read the
 * twenty-first. The controls are the rare thing here -- the common act is
 * looking down the list -- so the row is a summary you can scan, and the
 * controls are one click away behind it.
 *
 * A real button rather than a clickable div: it takes focus, answers the
 * keyboard, and tells a screen reader whether it is open.
 */
function PersonRow({
  person,
  showIdentity,
  isSelf,
  canGrantRoles,
}: {
  person: MemberRow;
  /* Members are listed by address alone, at the admin's request. Professionals
     keep their name and picture, because the point of that tab is knowing who
     is carrying a badge in front of the community. */
  showIdentity: boolean;
  isSelf: boolean;
  canGrantRoles: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-bg2"
      >
        {showIdentity ? <Avatar displayName={person.display_name} size={36} /> : null}

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {showIdentity ? (
              <span className="text-[15px] font-medium">{person.display_name}</span>
            ) : null}
            {/* No placeholder where an address would go. On this tab the name
                is already the identifier, so an absent address is better said
                once in the note above than repeated down every row. On the
                members tab, where the address is the identifier, the handle
                stands in rather than leaving the row unidentifiable. */}
            {person.email ? (
              <span
                className={
                  showIdentity
                    ? "truncate text-[13px] text-muted"
                    : "truncate text-[15px] font-medium"
                }
              >
                {person.email}
              </span>
            ) : !showIdentity ? (
              <span className="truncate text-[15px] font-medium">
                {person.display_name}
              </span>
            ) : null}
            {/* Member is the default and says nothing worth the ink. A role
                that changes what somebody can do is worth a chip. */}
            {person.role !== "member" ? (
              <span className="rounded-chip bg-bg2 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {ROLE_LABELS[person.role]}
              </span>
            ) : null}
            {showIdentity && person.professional_category ? (
              <span className="text-[13px] text-faint">{categoryLabel(person)}</span>
            ) : null}
            {/* Only when there is something to see. A quiet member and a
                reported one look identical without this. */}
            {person.flag_count ? (
              <span className="rounded-chip bg-menstrual/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-menstrual-ink">
                {person.flag_count} reported
              </span>
            ) : null}
          </span>

          {/* Joined, last seen, and how much she has written. Undefined rather
              than zero means migration 003 has not run, and the line is left
              off entirely rather than claiming she has never posted. */}
          <span className="mt-1 block text-[13px] text-faint">
            Joined {formatDate(person.created_at)}
            {person.last_seen_at !== undefined
              ? ` · ${person.last_seen_at ? `last seen ${timeAgo(person.last_seen_at)}` : "not seen since this was added"}`
              : ""}
            {person.post_count !== undefined
              ? ` · ${person.post_count} post${person.post_count === 1 ? "" : "s"}, ${person.reply_count ?? 0} comment${person.reply_count === 1 ? "" : "s"}`
              : ""}
          </span>
        </span>

        <Chevron open={open} />
      </button>

      {open ? (
        <div id={panelId} className="border-t border-line px-4 pb-4 pt-4">
          <RoleControls
            person={person}
            isSelf={isSelf}
            canGrantRoles={canGrantRoles}
          />
        </div>
      ) : null}
    </Card>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function RoleControls({
  person,
  isSelf,
  canGrantRoles,
}: {
  person: MemberRow;
  isSelf: boolean;
  canGrantRoles: boolean;
}) {
  const [category, setCategory] = useState<ProfessionalCategory | "">(
    person.professional_category ?? "",
  );
  const [other, setOther] = useState(person.professional_category_other ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function apply(role: "member" | "professional" | "admin") {
    setError(null);
    startTransition(async () => {
      const result = await setMemberRole(
        person.id,
        role,
        role === "professional" ? ((category || null) as ProfessionalCategory | null) : null,
        role === "professional" && category === "other" ? other : null,
      );
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  const isProfessional = person.role === "professional";
  const isAdmin = person.role === "admin";

  /* One sentence explaining why there are no buttons, or null if there are.
     Written in order of how surprising it would be to hit each case. */
  const locked = !canGrantRoles
    ? "Only a super admin can change roles."
    : isSelf
      ? "This is you. Your own role is not editable here."
      : person.role === "super_admin"
        ? "Super admins are set in the database."
        : null;

  if (locked) return <p className="text-[13px] text-muted">{locked}</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* Professional status and its category are one decision, so they are
          granted together rather than as a role now and a category later that
          somebody forgets to set. */}
      <div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[180px] flex-1">
            <label
              htmlFor={`category-${person.id}`}
              className="mb-1.5 block text-[13px] font-medium"
            >
              Posts and replies as
            </label>
            {/* The label was here all along but was not tied to the control, so
                a screen reader announced an unnamed combo box. One id per
                person, because this repeats down the page. */}
            <select
              id={`category-${person.id}`}
              value={category}
              onChange={(e) => setCategory(e.target.value as ProfessionalCategory | "")}
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
            <Button variant="quiet" disabled={pending} onClick={() => apply("member")}>
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

      {/* Moderator rights are a separate line, with their own sentence, because
          handing somebody the ability to delete other people's posts should not
          look like picking an item from a dropdown. */}
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
  );
}

const ROLE_LABELS: Record<MemberRow["role"], string> = {
  member: "Member",
  professional: "Professional",
  admin: "Moderator",
  super_admin: "Super admin",
};

function categoryLabel(person: MemberRow) {
  if (person.professional_category === "other") {
    return person.professional_category_other || "Other";
  }
  return (
    PROFESSIONAL_CATEGORIES.find((c) => c.value === person.professional_category)
      ?.label ?? person.professional_category
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
