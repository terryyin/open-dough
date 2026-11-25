import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardWork, story as workStory } from "../navigation/board-work.ts";
import { intentCiProof } from "./intent-attempt-proof-page.ts";
import { scopeName } from "./intent-browser-page.ts";
import {
  inertCiReads,
  judgedStatus,
  mainPassed,
} from "./intent-ci-status-fixtures.ts";
import { intentReadsPublishing } from "./intent-revision-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import {
  changed,
  initialRevision,
  keptPath,
  openStoryChanges,
} from "./intent-story-changes-fixtures.ts";
import {
  activateComparisonControl,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";

const location = "dashboard/tests";
const story = intentStoryCompare();
const summary = page.getByRole("region", { name: "Summary", exact: true });

test("a fresh story opens CI beside its files, and selecting a location or changed file opens its reading directly", async () => {
  await openStoryChanges();
  await expect
    .element(story.viewTab("CI comparison"))
    .toHaveAttribute("aria-selected", "true");
  await expect.element(intentCiStatus().panel).toBeVisible();
  await expect.element(story.sidebar).toBeVisible();
  await activateComparisonControl(
    story.sidebar.getByRole("button", { name: /^dashboard\/tests(?:,|\s|$)/ }),
  );
  await expect
    .element(summary.getByText(location, { exact: true }))
    .toBeVisible();
  await activateComparisonControl(story.file(changed.modified));
  await expect.poll(story.diffName).toBe(changed.modified);
  await expect.poll(story.diffCode).toContain("more");
});

test("Intent coverage leaves the file sidebar usable for opening a folder's summary", async () => {
  await openStoryChanges();
  await story.chooseTab("Intent coverage");
  const coverage = page.getByRole("region", {
    name: "Intent coverage",
    exact: true,
  });
  await expect.element(coverage).toBeVisible();
  await activateComparisonControl(scopeName("boundary"));
  await expect
    .element(summary.getByText("dashboard/tests/boundary", { exact: true }))
    .toBeVisible();
});

test("Selected story only hides the unchanged failing file but keeps its result in the same CI build", async () => {
  const run = { revision: initialRevision, runId: 41, runAttempt: 1 };
  const entry = makeMe.aCiProofEntry
    .at(location)
    .withFile(keptPath, { passed: 0, failed: 1, durationMs: 100 })
    .please();
  await openStoryChanges({
    ci: {
      readStatus: (...[, branch]) =>
        Promise.resolve(
          judgedStatus(branch, "failed", run.revision, "Published tests", {
            ...run,
            runBranch: branch,
            runUrl: "https://ci.invalid/runs/41",
          }),
        ),
      readProof: (source) =>
        Promise.resolve(
          makeMe.aCiProof
            .forRun({ repository: source.repository, ...run })
            .entries([entry])
            .please(),
        ),
    },
  });
  const proof = intentCiProof();
  const failingEntry = proof.table.getByRole("row").filter({
    has: page.getByRole("rowheader", { name: location, exact: true }),
  });
  const showsFailingBuild = async () => {
    await expect
      .element(failingEntry.getByRole("cell", { name: "1 failed test case" }))
      .toBeVisible();
    await proof.showsAttemptAndRevision(
      `Run ${run.runId} · attempt ${run.runAttempt}`,
      run.revision.slice(0, 7),
    );
  };
  await expect.element(story.file(keptPath)).toBeVisible();
  await showsFailingBuild();

  await story.onlyChangedFiles.click();

  await expect.element(story.file(keptPath)).not.toBeInTheDocument();
  await showsFailingBuild();
});

test("reading keys move from the document to the visible Story Home or path reading", async () => {
  const locations = makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at(location)
        .ofKind("typescript", ["*.spec.ts"])
        .selecting(keptPath)
        .please(),
    )
    .please();
  const selected = workStory("Keep story reading reachable by keyboard", 566);
  const work = boardWork([], { taken: [selected] });
  await mountBoardFrame(
    work,
    { width: 1280, height: 800 },
    "stories",
    {},
    {
      intentReads: intentReadsPublishing(locations, {}),
      ci: inertCiReads({ readStatus: () => Promise.resolve(mainPassed) }),
    },
  );
  await page
    .getByRole("article", { name: selected.title })
    .getByRole("heading", { name: selected.title })
    .click();
  await page.getByRole("radio", { name: "Intent", exact: true }).click();
  await expect.element(story.viewTab("CI comparison")).toBeVisible();
  (document.activeElement as HTMLElement | null)?.blur();
  await userEvent.keyboard("{PageDown}");
  await expect
    .element(page.getByRole("tabpanel", { name: "CI comparison" }))
    .toHaveFocus();

  await activateComparisonControl(scopeName(location));
  (document.activeElement as HTMLElement | null)?.blur();
  await userEvent.keyboard("{PageDown}");
  await expect.element(story.pathReading).toHaveFocus();
});
