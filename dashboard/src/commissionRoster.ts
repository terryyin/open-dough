// The agent roster: every agent of the shared rotation with the published
// profiles that commission it at the snapshot's revision. It is derived from
// the same profile read as the cards' assignments, never read on its own. A
// commission is what a published profile records, never a sign that the agent
// is working now.

import {
  agentNames,
  profileAgentName,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type {
  Commission,
  ProfileAssignments,
  UnreadableProfile,
} from "./agentAssignments.ts";
import type { PublishedWork } from "./publishedWork.ts";

// A commission on the roster, with the title the snapshot's backlog records
// for its identity; undefined when the backlog read lists no such entry.
export type RosterCommission = Commission & {
  readonly title: string | undefined;
};

// One agent of the shared rotation, by its rotation name, with the published
// profiles that name it: none means not commissioned, since members exist only
// once the profile directory was read. An unreadable profile leaves the agent
// uncertain.
export type RosterMember = {
  readonly name: string;
  readonly commissions: readonly RosterCommission[];
  readonly unreadable: readonly UnreadableProfile[];
};

// Every agent of the rotation as the snapshot's profiles commission it, or
// why no agent's commission is known.
export type AgentRoster =
  | { readonly status: "loading" }
  | { readonly status: "unavailable"; readonly problem: string }
  | { readonly status: "read"; readonly members: readonly RosterMember[] };

// Each agent of the rotation with the commissions naming it, titled from the
// same snapshot's backlog. Profiles are read only at rotation names' paths,
// so every unreadable profile belongs to one member.
export function rosterMembers(
  work: PublishedWork,
  { commissions, unreadable }: ProfileAssignments,
): readonly RosterMember[] {
  const entries = [...work.taken, ...work.backlog];
  return agentNames.map((name) => ({
    name,
    commissions: commissions
      .filter((commission) => commission.name === name)
      .map((commission) => ({
        ...commission,
        title: entries.find((entry) => entry.identity === commission.identity)
          ?.title,
      })),
    unreadable: unreadable.filter(
      ({ file }) => profileAgentName(file) === name,
    ),
  }));
}
