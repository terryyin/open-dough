// Which branch Intent's CI status homepage judges (`./IntentCiStatus.tsx`): the
// source's configured trunk while no story is selected, or, for the page's
// selected story (`./pageStorySelection.tsx`), the branch the story-branch
// rule finds for its Taken entry (`./storyBranch.ts`). A selected done story
// is a comparison target (`./IntentCiComparison.tsx`): its endpoints come from
// published history, not a live branch judgment. Any other selected story is
// named with why it has no branch to judge, and nothing is judged in its
// place. A judged branch carries its head as the page last observed it.

import { watchedBranchHeads } from "./progressSource.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork, WorkEntry } from "./publishedWork.ts";
import { storyBranchOf } from "./storyBranch.ts";

export type CiTarget =
  // `branch` is judged; `story` names the selected story whose branch it is;
  // `head` is the branch's head as the page last observed it, undefined
  // while it observes none.
  | {
      readonly kind: "judged";
      readonly branch: string;
      readonly story?: string;
      readonly head: string | undefined;
    }
  // A selected done story: compare its published CI endpoints.
  | {
      readonly kind: "comparison";
      readonly story: string;
      readonly identity: string;
    }
  // The selected story `story` has no branch to judge, for `why`.
  | { readonly kind: "gap"; readonly story: string; readonly why: string };

const noBranch = (story: string, because: string): CiTarget => ({
  kind: "gap",
  story,
  why: `${story} ${because}, so it has no published story branch and no CI status is shown.`,
});

const unknownBranch = (story: string, because: string): CiTarget => ({
  kind: "gap",
  story,
  why: `The story branch of ${story} is unknown: ${because}. No CI status is shown.`,
});

function takenTarget(work: PublishedWork, entry: WorkEntry): CiTarget {
  const story = entry.title;
  const branch = storyBranchOf(entry.owner);
  switch (branch.kind) {
    case "branch":
      return {
        kind: "judged",
        branch: branch.branch,
        story,
        head: watchedBranchHeads(work).get(branch.branch),
      };
    case "unknown":
      return unknownBranch(story, "its agent profile is still being read");
    case "profiles-unreadable":
      return unknownBranch(
        story,
        entry.owner?.status === "unavailable"
          ? `the agent profiles could not be read (${entry.owner.problem.replace(/\.$/, "")})`
          : "the agent profiles could not be read",
      );
    case "conflicting":
      return unknownBranch(
        story,
        "more than one agent profile names it, so it has no single branch",
      );
    case "not-recorded":
      return noBranch(story, "is recorded by no agent profile");
    case "trunk":
      return noBranch(story, "is taken in Trunk Mode");
    case "unsafe":
      return {
        kind: "gap",
        story,
        why: `The recorded branch ${branch.branch} of ${story} has a name this dashboard cannot use, so its CI status cannot be read.`,
      };
  }
}

function isDone(work: PublishedWork, identity: string): boolean {
  return (
    work.done?.status === "catalogued" &&
    work.done.records.some((record) => record.identity === identity)
  );
}

export function ciTargetOf(
  source: PublishedSource,
  work: PublishedWork | undefined,
  selectedIdentity: string | undefined,
): CiTarget {
  if (selectedIdentity === undefined)
    return { kind: "judged", branch: source.ref, head: work?.revision };
  const taken = work?.taken.find(
    (entry) => entry.identity === selectedIdentity,
  );
  if (work !== undefined && taken !== undefined)
    return takenTarget(work, taken);
  const queued = work?.backlog.find(
    (entry) => entry.identity === selectedIdentity,
  );
  if (queued !== undefined) {
    return noBranch(
      queued.title,
      queued.preparing?.status === "recorded"
        ? "is being prepared, not taken"
        : "is queued, not taken",
    );
  }
  if (work !== undefined && isDone(work, selectedIdentity))
    return {
      kind: "comparison",
      story: selectedIdentity,
      identity: selectedIdentity,
    };
  return noBranch(selectedIdentity, "is not taken at this revision");
}
