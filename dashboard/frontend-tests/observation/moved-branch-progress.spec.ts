// Startup detail and moved-head progress refresh use typed branch head,
// branch-file, and commit-time observation reads. A trunk sibling keeps its
// observed progress; a vanished branch shows only its own gap.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ObservationOutcomes } from "../../src/observationOutcomes.ts";
import { readMovedProgress } from "../../src/movedBranchProgress.ts";
import { readPublishedWork } from "../../src/publishedWorkRead.ts";
import { watchedBranchHeads } from "../../src/progressSource.ts";
import {
  akihoProfile,
  branchHead,
  movedHead,
  observationSupplying,
  onBranchIdentity,
  onBranchPlanPath,
  onTrunkIdentity,
  onTrunkPlanPath,
  planCommittedAt,
  revision,
  storyBranch,
  vanishedBranch,
  vanishedIdentity,
  vanishedPlanPath,
} from "./moved-branch-progress-supply.ts";

test("startup detail places branch plan and clock, keeps the trunk sibling, and gaps a vanished branch", async () => {
  const { reads, asks } = observationSupplying();
  const work = await readPublishedWork(
    makeMe.aPublishedSource.openDough.please(),
    new AbortController().signal,
    new ObservationOutcomes(),
    undefined,
    undefined,
    undefined,
    reads,
  );

  expect(work.revision).toBe(revision);
  expect([...asks.heads].sort()).toEqual([storyBranch, vanishedBranch].sort());
  expect(asks.files).toEqual([{ path: onBranchPlanPath, head: branchHead }]);

  const branched = work.taken.find(
    (entry) => entry.identity === onBranchIdentity,
  );
  expect(branched?.progressSource).toEqual({
    kind: "branch",
    branch: storyBranch,
    head: branchHead,
    profilePath: akihoProfile,
  });
  expect(branched?.planSlices).toMatchObject({
    status: "interpreted",
    slices: [
      { index: 1, status: "done" },
      { index: 2, status: "planned" },
    ],
  });
  expect(branched?.sliceClock).toEqual({
    status: "started",
    at: planCommittedAt,
    takeRecorded: true,
  });
  expect(asks.commitTimes).toContainEqual({
    path: onBranchPlanPath,
    head: branchHead,
  });

  const trunkSibling = work.taken.find(
    (entry) => entry.identity === onTrunkIdentity,
  );
  expect(trunkSibling?.progressSource?.kind).toBe("trunk");
  expect(
    trunkSibling?.progressSource?.kind === "trunk"
      ? trunkSibling.progressSource.profilePath
      : undefined,
  ).toContain("yuma-chan.json");
  expect(trunkSibling?.planSlices).toMatchObject({
    status: "interpreted",
    slices: [
      { index: 1, status: "planned" },
      { index: 2, status: "planned" },
    ],
  });
  expect(asks.commitTimes).toContainEqual({ path: onTrunkPlanPath });

  const gone = work.taken.find((entry) => entry.identity === vanishedIdentity);
  expect(gone?.progressSource).toBeUndefined();
  expect(gone?.planSlices?.status).toBe("unavailable");
  expect(
    gone?.planSlices?.status === "unavailable"
      ? gone.planSlices.problem
      : undefined,
  ).toContain(`The recorded branch ${vanishedBranch} is no longer published`);
  expect(asks.files.some((ask) => ask.path === vanishedPlanPath)).toBe(false);

  expect(watchedBranchHeads(work).get(storyBranch)).toBe(branchHead);
  expect(watchedBranchHeads(work).get(vanishedBranch)).toBeUndefined();
});

test("a moved head rereads only the affected branch and clock", async () => {
  const startup = observationSupplying();
  const shown = await readPublishedWork(
    makeMe.aPublishedSource.openDough.please(),
    new AbortController().signal,
    new ObservationOutcomes(),
    undefined,
    undefined,
    undefined,
    startup.reads,
  );
  const trunkBefore = shown.taken.find(
    (entry) => entry.identity === onTrunkIdentity,
  );
  const vanishedBefore = shown.taken.find(
    (entry) => entry.identity === vanishedIdentity,
  );

  const moved = observationSupplying({
    branchHeads: new Map([[storyBranch, movedHead]]),
  });
  const refreshed = await readMovedProgress(
    shown,
    new Map([[storyBranch, movedHead]]),
    new AbortController().signal,
    new ObservationOutcomes(),
    moved.reads,
  );

  expect(moved.asks.heads).toEqual([]);
  expect(moved.asks.files).toEqual([
    { path: onBranchPlanPath, head: movedHead },
  ]);
  expect(moved.asks.commitTimes).toEqual([
    { path: onBranchPlanPath, head: movedHead },
  ]);

  const branched = refreshed.taken.find(
    (entry) => entry.identity === onBranchIdentity,
  );
  expect(branched?.progressSource).toEqual({
    kind: "branch",
    branch: storyBranch,
    head: movedHead,
    profilePath: akihoProfile,
  });
  expect(branched?.planSlices).toMatchObject({
    status: "interpreted",
    slices: [
      { index: 1, status: "done" },
      { index: 2, status: "done" },
    ],
  });
  expect(branched?.sliceClock).toEqual({
    status: "started",
    at: planCommittedAt,
    takeRecorded: true,
  });

  const trunkAfter = refreshed.taken.find(
    (entry) => entry.identity === onTrunkIdentity,
  );
  expect(trunkAfter).toBe(trunkBefore);
  const vanishedAfter = refreshed.taken.find(
    (entry) => entry.identity === vanishedIdentity,
  );
  expect(vanishedAfter).toBe(vanishedBefore);
});
