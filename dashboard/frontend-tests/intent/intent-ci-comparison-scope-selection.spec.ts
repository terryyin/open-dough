// The Summary follows the page's selected story: a queued story clears the
// previous story's comparison, and a Taken story's Summary keeps its
// provisional endpoint words beside its actual live judgment.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountCiScope, scopeReadsOf } from "./intent-ci-scope-page.tsx";

test("selecting a queued story clears the previous Summary comparison and Baseline column", async () => {
  const story = makeMe.aComparedStory.inSummaryScope();
  const facts = story.please();
  const ci = scopeReadsOf(facts);
  const scope = await mountCiScope(facts, ci.source);
  await expect
    .element(scope.summary.figure("dashboard/tests", "Branch"))
    .toHaveTextContent("+9.5 s");
  scope.selects(story.ofQueuedStory().please());
  await expect.poll(() => scope.summary.frames()).toEqual([]);
  expect(scope.summary.labels(facts.identity)).toEqual([]);
  await expect
    .element(
      scope.summary.region.getByRole("columnheader", { name: "Baseline" }),
    )
    .not.toBeInTheDocument();
  expect(scope.summary.region.element().textContent).not.toContain(
    facts.identity,
  );
  expect(ci.asked.comparisons).toHaveLength(1);
  expect(ci.asked.proofs).toHaveLength(3);
});

test("a Taken Story Branch Summary labels its provisional comparison and not-yet-landed endpoint", async () => {
  const facts = makeMe.aComparedStory
    .inSummaryScope()
    .takenOnStoryBranch()
    .please();
  const ci = scopeReadsOf(facts);
  ci.answers.status = () =>
    makeMe.anIntentCiStatus
      .with({
        branch: "feature/a",
        revision: facts.work.revision,
        subject: "branch",
        state: "unread",
        laterWithoutResult: 0,
        reason: "Live branch judgment unavailable",
        checkedAt: facts.answer.checkedAt,
        freshness: "fresh",
      })
      .please();
  const scope = await mountCiScope(facts, ci.source);
  await expect
    .poll(() => scope.summary.labels("Story A"))
    .toEqual([
      "Provisional",
      "Baseline No build aaaaaaa",
      "Branch bbbbbbb",
      "Landed Not landed yet",
    ]);
  expect(scope.summary.region.element().textContent).toMatch(
    /has not landed yet/,
  );
  expect(scope.summary.framing()).toEqual([
    "Observed builds; differences are not attributed to the story",
  ]);
  await expect
    .element(
      scope.summary.region.getByRole("table", {
        name: "CI proof of the immediate folders and files of dashboard/tests",
      }),
    )
    .toBeVisible();
  expect(ci.asked.comparisons).toHaveLength(1);
  expect(ci.asked.proofs).toHaveLength(2);
  await expect.poll(() => ci.asked.statuses).toBe(1);
});
