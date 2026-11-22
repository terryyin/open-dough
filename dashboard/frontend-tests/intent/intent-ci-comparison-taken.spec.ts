// Taken stories keep their actual live judgment, read through a typed CI
// status reply, and their provisional endpoint words.
import { expect, test } from "vitest";
import type { Locator } from "vitest/browser";
import type { IntentCiStatus as Judgment } from "../../src/authenticatedIntentCiStatusRead.ts";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type {
  ComparedStory,
  ComparedStoryBuilder,
} from "../../../Distribution/tests/support/comparedStoryTestData.mjs";
import { ciReadsOf, mountCiEvidence } from "./intent-ci-evidence-page.tsx";
import type { shownComparison } from "./intent-ci-comparison-page.ts";

type Comparison = Awaited<ReturnType<typeof shownComparison>>;

const storyBranch = "story/a";

const text = (region: Locator, selector: string) =>
  [...region.element().querySelectorAll(selector)].map((node) =>
    node.textContent.trim(),
  );

// Baseline and Branch builds whose wall and runner-wait-free times are measured.
const measured = () =>
  makeMe.aComparedStory
    .withBaseline({
      completedAt: "2026-11-09T00:04:59Z",
      startedAt: "2026-11-09T00:00:00Z",
      timeWithoutRunnerWaits: { milliseconds: 295_000 },
    })
    .withBranch({
      completedAt: "2026-11-09T00:13:27Z",
      timeWithoutRunnerWaits: { milliseconds: 287_000 },
    })
    .withMixedEntries();

// An adapter Baseline attempt without times, and a completed ancestor Branch
// attempt on `branch` while a later attempt still runs; no proof is kept.
function adapterAncestor(branch: string) {
  const noProof = makeMe.aCiProof.unavailable("none", "no proof kept").please();
  return makeMe.aComparedStory
    .withAdapterAttemptAt(
      "baseline",
      { runId: "baseline", attemptId: "before" },
      {
        completedAt: undefined,
        startedAt: undefined,
        timeWithoutRunnerWaits: { milliseconds: 295_000 },
      },
    )
    .withAdapterAttemptAt(
      "branch",
      { attemptId: "complete" },
      {
        completedAt: "2026-11-09T00:06:30Z",
        timeWithoutRunnerWaits: { milliseconds: 287_000 },
        selection: "ancestor",
        laterRunning: true,
        runBranch: branch,
      },
    )
    .withProofs(noProof, noProof, undefined);
}

// In Trunk Mode the Branch build becomes the provisional one.
const takenOnTrunk = (story: ComparedStoryBuilder) =>
  story
    .takenOnTrunk()
    .withAnswer({
      branch: {
        kind: "not-applicable",
        explanation:
          "Branch comparison is not applicable for a Trunk Mode story.",
      },
    })
    .please();

const passingLiveStatus = (taken: ComparedStory): Judgment =>
  makeMe.anIntentCiStatus
    .with({
      branch: storyBranch,
      revision: taken.work.revision,
      subject: "live published work",
      state: "pass",
      laterWithoutResult: 0,
      checkedAt: taken.answer.checkedAt,
      freshness: "fresh",
    })
    .please();

async function showTaken(taken: ComparedStory, liveStatus?: Judgment) {
  const reads = ciReadsOf(taken);
  if (liveStatus) reads.answers.status = () => liveStatus;
  const evidence = await mountCiEvidence(taken, reads.source);
  return { reads, evidence, comparison: await evidence.comparison() };
}

// The words every Taken comparison shows: Baseline against the provisional
// build, with Landed named as not landed yet. Returns each Build cell's words.
async function provisionalComparison(
  comparison: Comparison,
  active: "Branch" | "Provisional",
) {
  await expect
    .poll(comparison.activeComparison)
    .toEqual([`Baseline compared with ${active}`]);
  expect(comparison.fallbackReason()).toEqual([
    "Landed is not used: The story has not landed yet.",
  ]);
  const identities = comparison.identities().map(({ text }) => text);
  expect(identities[0]).toContain("aaaaaaa");
  expect(identities.at(-1)).toBe("The story has not landed yet.");
  const provisional = identities.at(-2);
  expect(provisional).toContain("bbbbbbb");
  expect(provisional).toContain("provisional");
  return identities;
}

test("Taken story-branch keeps its live status and provisional measured comparison", async () => {
  const taken = measured().takenOnStoryBranch(storyBranch).please();
  const { evidence, comparison } = await showTaken(
    taken,
    passingLiveStatus(taken),
  );
  const live = evidence.liveStatus;
  await expect
    .element(live.getByRole("heading", { level: 4 }))
    .toHaveTextContent("Proof");
  await expect
    .element(live.getByRole("heading", { level: 3 }))
    .toHaveTextContent("CI status of story/a");
  expect(text(live, ".intent-ci-story")).toEqual(["Story branch."]);
  expect(live.element().textContent).not.toContain("Story A");
  expect(text(live, ".intent-ci-state").join(" ")).toContain("bbbbbbb");
  await provisionalComparison(comparison, "Branch");
  await expect
    .poll(comparison.wallTimes)
    .toEqual(["4 min 59 s", "13 min 27 s", "—"]);
  await expect
    .poll(comparison.timesWithoutWaits)
    .toEqual(["4 min 55 s", "4 min 47 s", "—"]);
  expect(comparison.overallTiming()).toEqual(["−8 s"]);
  expect(comparison.overallWallTime()).toEqual(["+8 min 28 s"]);
});

test("Taken story-branch keeps a completed adapter ancestor while a later attempt runs", async () => {
  const taken = adapterAncestor(storyBranch)
    .takenOnStoryBranch(storyBranch)
    .please();
  const { comparison } = await showTaken(taken);
  const identities = await provisionalComparison(comparison, "Branch");
  expect(identities[1]).toContain("ancestor");
  expect(identities[1]).toContain("a later attempt is still running");
  await expect
    .poll(comparison.wallTimes)
    .toEqual(["Not recorded", "6 min 30 s", "—"]);
});

test("Taken trunk keeps its live status and provisional measured comparison", async () => {
  const { reads, comparison } = await showTaken(takenOnTrunk(measured()));
  expect(reads.asked.statuses).toBe(0);
  const identities = await provisionalComparison(comparison, "Provisional");
  expect(identities[1]).toContain("not applicable");
  await expect
    .poll(comparison.wallTimes)
    .toEqual(["4 min 59 s", "—", "13 min 27 s", "—"]);
  await expect
    .poll(comparison.timesWithoutWaits)
    .toEqual(["4 min 55 s", "—", "4 min 47 s", "—"]);
  expect(comparison.overallTiming()).toEqual(["−8 s"]);
  expect(comparison.overallWallTime()).toEqual(["+8 min 28 s"]);
});

test("Taken trunk keeps a completed adapter ancestor while a later attempt runs", async () => {
  const { comparison } = await showTaken(takenOnTrunk(adapterAncestor("main")));
  const identities = await provisionalComparison(comparison, "Provisional");
  expect(identities[1]).toContain("not applicable");
  expect(identities[2]).toContain("ancestor");
  expect(identities[2]).toContain("a later attempt is still running");
  await expect
    .poll(comparison.wallTimes)
    .toEqual(["Not recorded", "—", "6 min 30 s", "—"]);
});
