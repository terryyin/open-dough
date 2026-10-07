// The agent roster: every agent of the collection the project selected with
// the published profiles that assign it at the snapshot's revision. It is
// derived from
// the same profile read as the cards' assignments, never read on its own. An
// assignment is what a published profile records, never a sign that the agent
// is working now.

import {
  agentCollections,
  profileAgentName,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type {
  ProfileAssignment,
  ProfileAssignments,
  UnreadableProfile,
} from "./agentAssignments.ts";
import type { PublishedWork } from "./publishedWork.ts";
import type { UnavailableGap } from "./readWaitBound.ts";

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

// Every agent of the selected collection as the snapshot's profiles assign it,
// or why no agent's assignment is known, or that the project's setting does not
// say which collection it selected.
export type AgentRoster =
  | { readonly status: "loading" }
  | UnavailableGap
  | { readonly status: "collection-unknown"; readonly problem: string }
  | { readonly status: "read"; readonly members: readonly RosterMember[] };

// Each agent of the project's selected collection with its profile's
// assignment, titled from the same snapshot's backlog, and then any agent of
// another collection whose profile is published, so existing work stays
// visible. Profiles are read only at known names' paths, and a readable one
// names the agent its file belongs to, so each agent has at most one. A
// setting that cannot be read leaves the collection unknown, never guessed.
export function rosterOf(
  work: PublishedWork,
  { rotation, assignments, unreadable }: ProfileAssignments,
): AgentRoster {
  if (!rotation.ok) {
    return { status: "collection-unknown", problem: rotation.error };
  }
  const entries = [...work.taken, ...work.backlog];
  const profileOf = (name: string) => {
    const assignment = assignments.find((each) => each.name === name);
    return assignment
      ? {
          ...assignment,
          title: entries.find((entry) => entry.identity === assignment.identity)
            ?.title,
        }
      : unreadable.find(({ file }) => profileAgentName(file) === name);
  };
  const selected = rotation.names.map((name) => ({
    name,
    profile: profileOf(name),
  }));
  const holding = agentCollections
    .flat()
    .filter((name) => !rotation.names.includes(name))
    .map((name) => ({ name, profile: profileOf(name) }))
    .filter(({ profile }) => profile !== undefined);
  return { status: "read", members: [...selected, ...holding] };
}
