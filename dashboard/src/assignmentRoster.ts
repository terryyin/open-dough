// The agent roster: every agent of the shared rotation with the published
// profiles that assign it at the snapshot's revision. It is derived from
// the same profile read as the cards' assignments, never read on its own. An
// assignment is what a published profile records, never a sign that the agent
// is working now.

import {
  agentNames,
  profileAgentName,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type {
  ProfileAssignment,
  ProfileAssignments,
  UnreadableProfile,
} from "./agentAssignments.ts";
import type { PublishedWork } from "./publishedWork.ts";

// An assignment on the roster, with the title the snapshot's backlog records
// for its identity; undefined when the backlog read lists no such entry.
export type RosterAssignment = ProfileAssignment & {
  readonly title: string | undefined;
};

// One agent of the shared rotation, by its rotation name, with what the one
// published profile filed under that name records: an assignment, an
// unreadable profile that leaves the agent uncertain, or nothing, which means
// no assignment is recorded, since members exist only once the profile
// directory was read.
export type RosterMember = {
  readonly name: string;
  readonly profile: RosterAssignment | UnreadableProfile | undefined;
};

// Every agent of the rotation as the snapshot's profiles assign it, or
// why no agent's assignment is known.
export type AgentRoster =
  | { readonly status: "loading" }
  | { readonly status: "unavailable"; readonly problem: string }
  | { readonly status: "read"; readonly members: readonly RosterMember[] };

// Each agent of the rotation with its profile's assignment, titled from the
// same snapshot's backlog. Profiles are read only at rotation names' paths,
// and a readable one names the agent its file belongs to, so each agent has
// at most one.
export function rosterMembers(
  work: PublishedWork,
  { assignments, unreadable }: ProfileAssignments,
): readonly RosterMember[] {
  const entries = [...work.taken, ...work.backlog];
  return agentNames.map((name) => {
    const assignment = assignments.find((each) => each.name === name);
    return {
      name,
      profile: assignment
        ? {
            ...assignment,
            title: entries.find(
              (entry) => entry.identity === assignment.identity,
            )?.title,
          }
        : unreadable.find(({ file }) => profileAgentName(file) === name),
    };
  });
}
