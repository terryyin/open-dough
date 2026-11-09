// Project Intent's CI wall time history in CI status
// (../../src/IntentCiHistory.tsx), on a real bare origin
// (../support/startOrigin.ts) whose dashboard collects recorded landings'
// CI: once a landing is collected, CI status shows its measured build beside
// the trunk's current judgment and Proof as a point in an image of CI wall
// time by build date, under a heading with the measured count and date span,
// and lists it under Builds and evidence with its date, wall time, exact
// revision and run link, reachable by keyboard on a phone without widening
// the page; a project with no measured landing says so in words and draws no
// chart (SEED-285#see-landed-ci-wall-time-history examples 1 and 9).
// Collection and the history read's variants are in
// ../../backend-tests/intent/landed-ci-history-collection.spec.ts.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import {
  evidenceLabels,
  expectEvidenceLabels,
} from "../ciEvidenceLabelsPage.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { chooseCiStatus } from "../intentCiStatusPage.ts";
import { proofOf } from "../intentCiProofPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import { actionsForRuns } from "../support/baseCiActions.ts";
import {
  collectingLandedCi,
  landedCiHistory,
  resultToLand,
} from "../support/landedCiHistory.ts";
import { expect, test } from "../support/preparationPage.ts";
import { originMain } from "../support/sessionDialog.ts";
import type { StartOrigin } from "../support/startOrigin.ts";
import { land } from "../support/startSessionLandingContext.ts";
import type { Locator, Page } from "@playwright/test";

test.use({ extraEnv: collectingLandedCi });

const historyOf = (panel: Locator) =>
  panel.getByRole("region", { name: "CI wall time history", exact: true });

// Open Dough's trunk as published, its main followed as it moves, with
// `runs` as the selected workflow's push runs.
async function publishTrunk(
  page: Page,
  origin: StartOrigin,
  runs: Parameters<typeof actionsForRuns>[0],
) {
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: await originMain(origin),
    repository: "terryyin/open-dough",
    follows: true,
  });
  committed.serveActions(actionsForRuns(runs));
}

// Project Intent's CI status, with nothing selected.
async function openProjectCiStatus(page: Page) {
  await openUntilRead(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  return chooseCiStatus(intent);
}

test("a collected landing's exact build is a point of CI wall time beside the trunk's judgment and Proof, listed with its date, wall time, exact revision and run, by keyboard on a phone", async ({
  page,
  dashboard,
  origin,
}) => {
  const { record, revision } = await resultToLand(dashboard, "landed.txt");
  await publishTrunk(page, origin, [
    makeMe.aCiRun
      .with({
        headSha: revision,
        id: 41,
        attempt: 1,
        conclusion: "success",
        url: "https://ci.invalid/runs/41",
        createdAt: "2026-11-05T10:00:00Z",
        startedAt: "2026-11-05T10:00:00Z",
        completedAt: "2026-11-05T10:06:05Z",
      })
      .please(),
  ]);
  land(record, origin, dashboard.home);
  // Collected without Intent, or any page, open.
  await expect
    .poll(() => landedCiHistory(dashboard))
    .toMatchObject({ body: { points: [{ revision }] } });

  await page.setViewportSize({ width: 390, height: 844 });
  const panel = await openProjectCiStatus(page);

  // The current judgment and its Proof are the trunk's, unchanged.
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    `Passed at ${shortSha(revision)} (Result landed.txt)`,
  );
  await expectEvidenceLabels(evidenceLabels(proofOf(panel)), [
    "Run 41 · attempt 1",
    `Revision ${shortSha(revision)}`,
    "CI wall time 6 min",
  ]);

  const history = historyOf(panel);
  await expect(history.getByRole("heading")).toHaveText(
    "CI wall time history 1 measured build · Nov 5",
  );
  await expect(history).toContainText(
    "Collected from dashboard-recorded landings",
  );
  await expect(history.getByRole("term")).toHaveText("Latest measured build");
  await expect(history.getByRole("definition")).toHaveText("6 min 5 s");
  await expect(
    history.getByRole("img", { name: "CI wall time by build date" }),
  ).toBeVisible();

  // Builds and evidence, between Proof and Check again by keyboard.
  const evidence = history.locator("summary");
  await expect(evidence).toHaveText("Builds and evidence");
  await panel.getByRole("button", { name: "Check again", exact: true }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(evidence).toBeFocused();
  await page.keyboard.press("Enter");
  const builds = history.getByRole("list", { name: "Builds and evidence" });
  await expect(builds.getByRole("listitem")).toHaveText([
    `Nov 5 · 6 min 5 s · exact revision ${shortSha(revision)} · Run 41 · attempt 1`,
  ]);
  await page.keyboard.press("Tab");
  const run = builds.getByRole("link", { name: "Run 41 · attempt 1" });
  await expect(run).toBeFocused();
  await expect(run).toHaveAttribute("href", "https://ci.invalid/runs/41");
  await expectNoSidewaysScrollIn(page, history);
});

test("a project with no recorded landing says no landing has been measured yet, draws no chart, and keeps its judgment and Proof", async ({
  page,
  origin,
}) => {
  const head = await originMain(origin);
  const subject = (
    await origin.originGit("log", "-1", "--format=%s", "main")
  ).trim();
  await publishTrunk(page, origin, [
    makeMe.aCiRun
      .with({
        headSha: head,
        id: 7,
        attempt: 1,
        conclusion: "success",
        url: "https://ci.invalid/runs/7",
        createdAt: "2026-11-05T09:00:00Z",
        startedAt: "2026-11-05T09:00:00Z",
        completedAt: "2026-11-05T09:03:00Z",
      })
      .please(),
  ]);

  const panel = await openProjectCiStatus(page);

  await expect(panel.locator(".intent-ci-state")).toHaveText(
    `Passed at ${shortSha(head)} (${subject})`,
  );
  await expectEvidenceLabels(evidenceLabels(proofOf(panel)), [
    "Run 7 · attempt 1",
    `Revision ${shortSha(head)}`,
    "CI wall time 3 min",
  ]);
  const history = historyOf(panel);
  await expect(history.getByRole("heading")).toHaveText("CI wall time history");
  await expect(history).toContainText(
    "No dashboard-recorded landings have been measured yet.",
  );
  await expect(history.getByRole("img")).toHaveCount(0);
  await expect(history.locator("summary")).toHaveCount(0);
});
