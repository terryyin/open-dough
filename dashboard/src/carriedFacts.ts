// While a new revision of the shown project is read, each part that revision
// has not answered yet keeps what the shown snapshot says for the same story
// identity, so unchanged work stays as it was until its own answer replaces
// it (`./publishedWorkDetails.ts` applies this to every snapshot the read
// shows). Membership and order are always the new revision's. Only a part
// still loading takes a carried fact; an answered part, a part recorded as
// absent, and a gap are never replaced. Nothing carried outlives the read:
// the snapshot a read lands with, and the one a read that fails or is let go
// of leaves shown (`./requestedRead.ts`), hold only what the read answered.

import type { AgentAssignment, EntryAssignments } from "./agentAssignments.ts";
import type { AgentRoster } from "./assignmentRoster.ts";
import type { PublishedWork, WorkEntry } from "./publishedWork.ts";

const loading = (part: { readonly status: string } | undefined) =>
  part?.status === "loading";

// The shown entry's value for each key, absent where the shown entry has
// none.
function carry(
  entry: WorkEntry,
  shown: WorkEntry,
  keys: readonly (keyof WorkEntry)[],
): WorkEntry {
  const kept = Object.entries(entry).filter(
    ([key]) => !(keys as readonly string[]).includes(key),
  );
  const lent = keys.flatMap((key) =>
    shown[key] === undefined ? [] : [[key, shown[key]] as const],
  );
  return Object.fromEntries([...kept, ...lent]) as WorkEntry;
}

// Assignments the new revision has named keep the human credit shown for the
// same agent until the new revision's own credit answers.
function withShownHumans<T extends AgentAssignment>(
  assignments: EntryAssignments<T>,
  shown: EntryAssignments<T> | { readonly status: "loading" } | undefined,
): EntryAssignments<T> {
  if (assignments.status !== "recorded" || shown?.status !== "recorded") {
    return assignments;
  }
  return {
    ...assignments,
    assignments: assignments.assignments.map((assignment) => {
      const before = shown.assignments.find(
        ({ agent }) => agent === assignment.agent,
      );
      return loading(assignment.human) && before !== undefined
        ? { ...assignment, human: before.human }
        : assignment;
    }),
  };
}

function carriedEntry(
  entry: WorkEntry,
  inSameList: WorkEntry | undefined,
  inOtherList: WorkEntry | undefined,
): WorkEntry {
  const shown = inSameList ?? inOtherList;
  if (shown === undefined) return entry;
  let next = entry;
  // Preparation facts are answered together from the canonical record.
  if (loading(entry.preparation) && shown.preparation !== undefined) {
    next = carry(next, shown, [
      "preparation",
      "dependencies",
      "associatedPlan",
      "planPath",
    ]);
  }
  if (loading(entry.purpose) && shown.purpose !== undefined) {
    next = { ...next, purpose: shown.purpose };
  }
  // Progress, owners, and preparers mean what they say only in the stage the
  // story was shown in; a story that changed stages shows its new stage's
  // presentation for them.
  if (inSameList === undefined) return next;
  // Slices, where they were read, and the current slice's clock are shown
  // together.
  const slicesCarried =
    loading(entry.planSlices) && inSameList.planSlices !== undefined;
  if (slicesCarried) {
    next = carry(next, inSameList, ["planSlices", "progressSource"]);
  }
  if (
    (loading(entry.sliceClock) ||
      (slicesCarried && entry.sliceClock === undefined)) &&
    inSameList.sliceClock !== undefined
  ) {
    next = { ...next, sliceClock: inSameList.sliceClock };
  }
  if (entry.owner !== undefined) {
    next = {
      ...next,
      owner:
        loading(entry.owner) && inSameList.owner !== undefined
          ? inSameList.owner
          : entry.owner.status === "loading"
            ? entry.owner
            : withShownHumans(entry.owner, inSameList.owner),
    };
  }
  if (entry.preparing === undefined) {
    if (inSameList.preparing !== undefined) {
      next = { ...next, preparing: inSameList.preparing };
    }
  } else {
    next = {
      ...next,
      preparing: withShownHumans(entry.preparing, inSameList.preparing),
    };
  }
  return next;
}

function carriedRoster(
  roster: AgentRoster | undefined,
  shown: AgentRoster | undefined,
): AgentRoster | undefined {
  if (shown === undefined) return roster;
  if (roster === undefined || loading(roster)) return shown;
  if (roster.status !== "read" || shown.status !== "read") return roster;
  return {
    ...roster,
    members: roster.members.map((member) => {
      const { profile } = member;
      if (profile === undefined || !("human" in profile)) return member;
      const before = shown.members.find(
        ({ name }) => name === member.name,
      )?.profile;
      return loading(profile.human) &&
        before !== undefined &&
        "human" in before &&
        before.agent === profile.agent
        ? { ...member, profile: { ...profile, human: before.human } }
        : member;
    }),
  };
}

const byIdentity = (entries: readonly WorkEntry[]) =>
  new Map(entries.map((entry) => [entry.identity, entry]));

// `work` as the read shows it, with `shown`'s facts for every part `work`
// has not answered yet; `work` itself when nothing is shown.
export function withCarriedFacts(
  work: PublishedWork,
  shown: PublishedWork | undefined,
): PublishedWork {
  if (shown === undefined) return work;
  const shownTaken = byIdentity(shown.taken);
  const shownBacklog = byIdentity(shown.backlog);
  const rosterLoading = work.roster === undefined || loading(work.roster);
  const roster = carriedRoster(work.roster, shown.roster);
  return {
    ...work,
    taken: work.taken.map((entry) =>
      carriedEntry(
        entry,
        shownTaken.get(entry.identity),
        shownBacklog.get(entry.identity),
      ),
    ),
    backlog: work.backlog.map((entry) =>
      carriedEntry(
        entry,
        shownBacklog.get(entry.identity),
        shownTaken.get(entry.identity),
      ),
    ),
    ...(roster !== undefined && { roster }),
    ...(rosterLoading &&
      work.unreadableProfiles === undefined &&
      shown.unreadableProfiles !== undefined && {
        unreadableProfiles: shown.unreadableProfiles,
      }),
    ...(loading(work.done) && shown.done !== undefined && { done: shown.done }),
  };
}
