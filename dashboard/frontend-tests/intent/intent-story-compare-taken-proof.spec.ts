import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewQuery } from "../../src/reviewSource.ts";
import type { CiComparisonRange } from "../../src/selectedCiComparison.ts";
import { judgedStatus } from "./intent-ci-status-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { openStoryAComparison } from "./intent-story-compare-stories.ts";

const startOfStory = "a".repeat(40);
const measuredBaseline = "b".repeat(40);
const first = makeMe.aReviewCommit
  .numbered(1, "first change")
  .afterRevision(startOfStory)
  .please();
const second = makeMe.aReviewCommit
  .numbered(2, "second change")
  .afterRevision(first.revision)
  .please();
const third = makeMe.aReviewCommit
  .numbered(3, "third change")
  .afterRevision(second.revision)
  .please();
const entryPath = "dashboard/tests";
const path = `${entryPath}/a.spec.ts`;
const branch = "claude/story-a";
const baseline = { revision: measuredBaseline, runId: 81, runAttempt: 2 };
const result = { revision: third.revision, runId: 82, runAttempt: 3 };
const defaultComparison = makeMe.aComparedStory
  .takenOnStoryBranch(branch)
  .withAnswer({ storyStart: startOfStory })
  .please().answer;
const selectedComparison = makeMe.aComparedStory
  .withBaseline({ ...baseline, selection: "ancestor", laterWithoutResult: 1 })
  .withBranch(result)
  .please().answer;

const snapshot = () =>
  makeMe.aStoryReview.modifying(path).onCommits(third, second, first).please();

const ciPanel = () => page.getByRole("tabpanel", { name: "CI comparison" });

function entryFor(passed: number) {
  return makeMe.aCiProofEntry
    .at(entryPath)
    .counting(passed, "case")
    .withFile(path, { passed, durationMs: passed * 100 })
    .please();
}

test("a later Taken range reads CI from its first parent and last commit across the selected views", async () => {
  const rangeQueries: ReviewQuery[] = [];
  const ciQueries: CiComparisonRange[] = [];
  await openStoryAComparison(
    {
      review: () => Promise.resolve(snapshot()),
      range(query) {
        rangeQueries.push(query);
        return Promise.resolve(
          makeMe.aStoryReview
            .modifying(path)
            .pleaseRange(
              query.fromTree === second.fromTree ? second : third,
              third,
            ),
        );
      },
    },
    {
      readStatus: () =>
        Promise.resolve(
          judgedStatus(branch, "pass", third.revision, third.subject),
        ),
      readComparison: (...[, identity]) =>
        Promise.resolve({ ...defaultComparison, identity }),
      readSelectedComparison(source, identity, range) {
        ciQueries.push(range);
        return Promise.resolve(
          makeMe.aSelectedCiComparison
            .with({
              source: source.id,
              identity,
              phase: "taken",
              range,
              baseline: selectedComparison.baseline,
              selection: selectedComparison.branch,
            })
            .please(),
        );
      },
      readProof(source, subject) {
        if ("attemptId" in subject)
          throw new Error("Expected a GitHub attempt");
        const count =
          subject.runId === baseline.runId &&
          subject.runAttempt === baseline.runAttempt &&
          subject.revision === baseline.revision
            ? 1
            : subject.runId === result.runId &&
                subject.runAttempt === result.runAttempt &&
                subject.revision === result.revision
              ? 9
              : 4;
        return Promise.resolve(
          makeMe.aCiProof
            .summaryFor(subject, [entryFor(count)], source.repository)
            .please(),
        );
      },
    },
  );
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  const file = story.file(`Modified ${path}`);
  await expect.element(file).toHaveAccessibleName(/4 test cases \(no change\)/);

  await story.choose("Commits");
  await story.commit(second.subject).click();
  await expect.poll(story.range).toContain("Changes in 2 commits");
  const count = /1 → 9 test cases \(\+8\)/;
  await expect.element(file).toHaveAccessibleName(count);
  await expect
    .poll(() => ciQueries.at(-1))
    .toEqual({
      start: first.revision,
      end: third.revision,
    });
  expect(rangeQueries.at(-1)).toMatchObject({
    fromTree: second.fromTree,
    tree: third.tree,
    fromBaseline: second.fromBaseline,
  });

  await story.chooseTab("CI comparison");
  const tab = ciPanel();
  const baselineRow = tab.getByRole("row", { name: /^Baseline / });
  const selectionRow = tab.getByRole("row", { name: /^Selection / });
  await expect
    .poll(() => baselineRow.query()?.textContent)
    .toMatch(
      /bbbbbbb.*ancestor.*1 later revision without a build.*Run 81 · attempt 2/,
    );
  await expect
    .poll(() => selectionRow.query()?.textContent)
    .toMatch(/0000000.*exact revision.*Run 82 · attempt 3/);
  await expect
    .element(tab.getByRole("heading", { name: `CI status of ${branch}` }))
    .toBeVisible();
  await expect
    .element(tab.getByRole("rowheader", { name: "Branch" }))
    .not.toBeInTheDocument();

  await story.chooseTab("Changes");
  await file.click();
  await story.chooseProof();
  const proof = page.getByRole("table", {
    name: `CI proof of ${path}`,
    exact: true,
  });
  await expect.element(proof.getByRole("cell", { name: count })).toBeVisible();
  const labels = page.getByRole("list", {
    name: "CI timing comparison of Story A",
  });
  await expect
    .poll(() => labels.query()?.textContent)
    .toMatch(/Run 81 · attempt 2.*Run 82 · attempt 3/);

  await story.choose("All changes");
  await expect.element(file).toHaveAccessibleName(/4 test cases \(no change\)/);
  await story.chooseTab("CI comparison");
  await expect
    .element(tab.getByRole("rowheader", { name: "Branch" }))
    .toBeVisible();
});

test("an unreadable Taken range stays on whole-story CI even when its commit IDs are known", async () => {
  let requests = 0;
  await openStoryAComparison(
    {
      review: () => Promise.resolve(snapshot()),
      range: () =>
        Promise.reject(new Error("Selected range could not be read.")),
    },
    {
      readComparison: (...[, identity]) =>
        Promise.resolve({ ...defaultComparison, identity }),
      readSelectedComparison() {
        requests += 1;
        return Promise.reject(
          new Error("Unreadable ranges have no selected comparison"),
        );
      },
    },
  );
  const story = intentStoryCompare();
  await story.choose("Commits");
  await expect.element(story.retryControl).toBeVisible();
  await expect.element(story.choice("All changes")).toBeEnabled();
  await story.chooseTab("CI comparison");
  await expect
    .poll(() => story.noteIn("CI comparison"))
    .toContain("Describes the whole story");
  await expect
    .element(ciPanel().getByRole("rowheader", { name: "Branch" }))
    .toBeVisible();
  await expect
    .element(ciPanel().getByRole("rowheader", { name: "Selection" }))
    .not.toBeInTheDocument();
  expect(requests).toBe(0);
});
