// Where what a read of the revision's agent profiles established
// (`./agentAssignments.ts`) is shown on the published work: each Taken
// entry's owner, each queued entry's preparers, the unreadable profiles, and
// the roster (`./assignmentRoster.ts`); a gap on each, never an empty set of
// assignments, when the profiles could not be read.

import {
  profilesUnread,
  type EntryAssignments,
  type ProfileAssignment,
  type ProfilesRead,
} from "./agentAssignments.ts";
import { rosterOf } from "./assignmentRoster.ts";
import type { PublishedWork } from "./publishedWork.ts";

// The assignments of one activity naming an entry, or the gap when none is
// recorded or the profiles could not be read.
function assignmentsOf<A extends ProfileAssignment["activity"]>(
  identity: string,
  activity: A,
  profiles: ProfilesRead,
): EntryAssignments<Extract<ProfileAssignment, { readonly activity: A }>> {
  if (profilesUnread(profiles)) {
    return { status: "unavailable", problem: profiles.unread };
  }
  const named = profiles.assignments.filter(
    (
      assignment,
    ): assignment is Extract<ProfileAssignment, { readonly activity: A }> =>
      assignment.activity === activity && assignment.identity === identity,
  );
  return named.length === 0
    ? { status: "not-recorded" }
    : { status: "recorded", assignments: named };
}

// Every Taken entry waits for its owner, and the roster for every agent's
// assignment, while profiles are read.
export function awaitingOwners(work: PublishedWork): PublishedWork {
  return {
    ...work,
    roster: { status: "loading" },
    taken: work.taken.map((entry) => ({
      ...entry,
      owner: { status: "loading" },
    })),
  };
}

export function withAssignments(
  work: PublishedWork,
  profiles: ProfilesRead,
): PublishedWork {
  const unread = profilesUnread(profiles);
  return {
    ...work,
    taken: work.taken.map((entry) => ({
      ...entry,
      owner: assignmentsOf(entry.identity, "execution", profiles),
    })),
    backlog: work.backlog.map((entry) => ({
      ...entry,
      preparing: assignmentsOf(entry.identity, "preparation", profiles),
    })),
    unreadableProfiles: unread ? [] : profiles.unreadable,
    roster: unread
      ? { status: "unavailable", problem: profiles.unread }
      : rosterOf(work, profiles),
  };
}
