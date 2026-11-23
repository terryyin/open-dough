import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import type { CiComparisonRange } from "../../src/selectedCiComparison.ts";
import type { StoryCiComparisonSlot } from "../../src/storyCiComparison.ts";
import type { TakenStoryReview } from "../../src/storyReviewContract.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import {
  activateComparisonControl,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import { openStoryAComparison } from "./intent-story-compare-stories.ts";

const path = "dashboard/tests/a.spec.ts";
const modified = "Modified dashboard/tests/a.spec.ts";
const noticeWords = "Uncommitted changes were not measured by CI.";
const ciPanel = () => page.getByRole("tabpanel", { name: "CI comparison" });
const proofPane = () =>
  page.getByRole("region", { name: "Proof", exact: true });
const branch = "claude/story-a";
const olderBuild = { revision: "f".repeat(40), runId: 70, runAttempt: 1 };

function dirtySnapshot(): TakenStoryReview {
  const snapshot = makeMe.aStoryReview
    .modifying(path)
    .modifying("dashboard/tests/landing.spec.ts")
    .onCommits(makeMe.aReviewCommit.numbered(2, "Committed change").please())
    .committedAs(makeMe.aStoryReview.modifying(path))
    .please();
  if (snapshot.kind !== "snapshot") throw new Error("Expected a snapshot");
  return snapshot;
}

function comparisonAt(
  build: typeof olderBuild &
    Partial<Extract<StoryCiComparisonSlot, { kind: "build" }>>,
): IntentCiReadSource["readComparison"] {
  return (...[, identity]) =>
    Promise.resolve(
      makeMe.aComparedStory
        .takenOnStoryBranch(branch)
        .withAnswer({ identity })
        .withBranch(build)
        .please().answer,
    );
}

function headComparison(
  source: string,
  identity: string,
  range: CiComparisonRange,
  build: typeof olderBuild,
) {
  const baseline = makeMe.aComparedStory
    .withBaseline(
      range.start === build.revision
        ? build
        : { ...build, selection: "ancestor", laterWithoutResult: 1 },
    )
    .please().answer.baseline;
  return makeMe.aSelectedCiComparison
    .with({
      source,
      identity,
      phase: "taken",
      range,
      baseline,
      selection: makeMe.aStoryCiComparisonSlot
        .with({ kind: "none", explanation: "No selected changes." })
        .please(),
    })
    .please();
}

test("included uncommitted changes name the committed head's build across CI comparison, Summary, and file Proof", async () => {
  const snapshot = dirtySnapshot();
  const headBuild = { revision: snapshot.head, runId: 71, runAttempt: 2 };
  const queries: CiComparisonRange[] = [];
  await openStoryAComparison(
    { review: () => Promise.resolve(snapshot) },
    {
      readComparison: comparisonAt(olderBuild),
      readSelectedComparison(source, identity, range) {
        queries.push(range);
        return Promise.resolve(
          headComparison(source.id, identity, range, headBuild),
        );
      },
    },
  );
  const story = intentStoryCompare();
  const measured =
    /Uncommitted changes were not measured by CI\..*Last committed build.*Run 71 · attempt 2/;
  await story.chooseTab("CI comparison");
  await expect.element(ciPanel().getByText(measured)).toBeVisible();
  expect(snapshot.head).not.toBe(snapshot.tree);
  expect(queries).toEqual([{ start: snapshot.head, end: snapshot.head }]);
  await expect
    .element(ciPanel().getByRole("row", { name: /Branch fffffff/ }))
    .toBeVisible();

  await story.chooseTab("Changes");
  const changes = page.getByRole("tabpanel", { name: "Changes", exact: true });
  await activateComparisonControl(
    changes.getByRole("button", { name: /^dashboard\/tests(?:[ ,]|$)/ }),
  );
  await expect.element(changes.getByText(measured)).toBeVisible();
  await activateComparisonControl(story.file(modified));
  await story.chooseProof();
  await expect.element(proofPane().getByText(measured)).toBeVisible();
  expect(queries).toHaveLength(1);

  await story.includeUncommitted.click();
  await expect
    .element(proofPane().getByText(noticeWords))
    .not.toBeInTheDocument();
  await story.chooseTab("CI comparison");
  await expect
    .element(ciPanel().getByText(noticeWords))
    .not.toBeInTheDocument();
  await expect
    .element(ciPanel().getByRole("row", { name: /Branch fffffff/ }))
    .toBeVisible();
});

test("the uncommitted notice reuses the current comparison when its build measured the workspace head", async () => {
  const snapshot = dirtySnapshot();
  const headBuild = { revision: snapshot.head, runId: 72, runAttempt: 3 };
  let reads = 0;
  await openStoryAComparison(
    { review: () => Promise.resolve(snapshot) },
    {
      readComparison: comparisonAt({
        ...headBuild,
        selection: "ancestor",
        laterWithoutResult: 1,
      }),
      readSelectedComparison(source, identity, range) {
        reads += 1;
        return Promise.resolve(
          headComparison(source.id, identity, range, olderBuild),
        );
      },
    },
  );
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  const notice = ciPanel().getByText(
    /Uncommitted changes were not measured by CI\..*Run 72 · attempt 3/,
  );
  await expect.element(notice).toBeVisible();
  expect(notice.element().textContent).not.toContain("ancestor");
  await expect
    .element(ciPanel().getByRole("row", { name: /Branch.*ancestor/ }))
    .toBeVisible();
  expect(reads).toBe(0);
});

test("an ancestor build cannot stand in for the committed head, and leaving All changes aborts a fresh lookup", async () => {
  const snapshot = dirtySnapshot();
  const signals: AbortSignal[] = [];
  await openStoryAComparison(
    { review: () => Promise.resolve(snapshot) },
    {
      readComparison: comparisonAt(olderBuild),
      readSelectedComparison(source, identity, range, signal) {
        signals.push(signal);
        return signals.length === 1
          ? Promise.resolve(
              headComparison(source.id, identity, range, olderBuild),
            )
          : unanswered();
      },
    },
  );
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  const missing = ciPanel().getByText(
    /Uncommitted changes were not measured by CI\..*No completed CI build was found/,
  );
  await expect.element(missing).toBeVisible();
  expect(missing.element().textContent).not.toContain("Run 70");
  await story.includeUncommitted.click();
  await expect.element(missing).not.toBeInTheDocument();
  await story.includeUncommitted.click();
  await expect.poll(() => signals.length).toBe(2);
  await story.choose("Commits");
  await expect.poll(() => signals[1]?.aborted).toBe(true);
  await expect
    .element(ciPanel().getByText(noticeWords))
    .not.toBeInTheDocument();
});
