// Cheap Project Intent refusal/absence and configured-trunk variants. The
// integrated journey owns real collection; these routes exercise only the UI.
import { makeMe } from "../../tests/support/makeMe.mjs";
import { shortSha } from "../src/baseCiWording.ts";
import { parts } from "../tests/dashboardPage.ts";
import { openSummary } from "../tests/intentSummaryCiProofFixtures.ts";
import { expectNoSidewaysScrollIn } from "../tests/pageLayout.ts";
import {
  openUntilRead,
  untilPageReadsAnswered,
} from "../tests/pageRequestNotes.ts";
import { expect, test } from "../tests/support/frontendApp.ts";
import { frontendRevision } from "../tests/support/frontendServiceState.ts";

test("configured trunk keeps its observed endpoint through failed and empty local reads while scope Proof stays usable", async ({
  page,
  frontendServices,
}) => {
  Object.assign(frontendServices, {
    projects: [
      makeMe.aPublishedSource
        .with({
          id: "open-dough",
          label: "Open Dough",
          repository: "terryyin/open-dough",
          ref: "trunk",
        })
        .please(),
    ],
  });
  const empty = makeMe.aCiScopeHistory
    .with({
      path: "dashboard/tests",
      selectedRevision: frontendRevision,
      availability: "empty",
      entries: [],
    })
    .please();
  const status = makeMe.anIntentCiStatus
    .with({
      branch: "trunk",
      revision: "a".repeat(40),
      subject: "Older CI observation",
      state: "unread",
      reason: "Live proof unavailable",
      laterWithoutResult: 1,
      runBranch: "trunk",
      checkedAt: "2026-11-11T07:00:00Z",
      freshness: "fresh",
    })
    .please();
  await page.route(/intent=ci-status/, (route) =>
    route.fulfill({
      json: new URL(route.request().url()).searchParams.has("kept")
        ? { none: true }
        : status,
    }),
  );
  let failed = true;
  const endpoints: string[] = [];
  await page.route(/intent=ci-history.*scope=/, async (route) => {
    endpoints.push(
      new URL(route.request().url()).searchParams.get("revision") ?? "",
    );
    await route.fulfill(
      failed
        ? { status: 502, json: { error: "Local history unavailable" } }
        : { json: empty },
    );
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const summary = await openSummary(intent, "dashboard/tests");
  const history = summary.getByRole("region", {
    name: "Test execution time history",
    exact: true,
  });
  await expect(history.getByRole("alert")).toContainText(
    "Local history unavailable",
  );
  await expect(history).toContainText(
    `Observed trunk endpoint trunk ${shortSha(frontendRevision)}`,
  );
  await expect(summary.getByRole("table")).toBeVisible();
  failed = false;
  await history.getByRole("button", { name: "Retry history" }).click();
  await untilPageReadsAnswered(page);
  await expect(history.getByRole("alert")).toHaveCount(0);
  await expect(history).toContainText(
    "No dashboard-recorded landing history has been collected.",
  );
  await expect(history).toContainText("0 measured builds");
  await expect(history.getByRole("img")).toHaveCount(0);
  expect(endpoints).toEqual([frontendRevision, frontendRevision]);
  await expect(summary.getByRole("table")).toBeVisible();
  await expectNoSidewaysScrollIn(page, history);
});

test("project endpoint words mark a measured zero and explain partial-unit gaps without joining them", async ({
  page,
  frontendServices,
}) => {
  const revision = frontendServices.revision;
  const history = makeMe.aCiScopeHistory
    .with({
      path: "dashboard/tests",
      selectedRevision: revision,
      availability: "retained",
      entries: [
        {
          key: "run/31/1",
          kind: "point",
          date: "2026-11-07T10:00:00Z",
          selected: true,
          landings: [
            {
              revision,
              receivedAt: "2026-11-07T10:10:00Z",
              selected: true,
              provenance: "exact",
            },
          ],
          build: {
            revision,
            runId: 31,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/31",
            provenance: "exact",
          },
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 0,
              entry: "dashboard/tests",
              segment: "case/0",
            },
            { kind: "gap", unit: "file", reason: "Partial · missing part 2" },
          ],
        },
      ],
    })
    .please();
  await page.route(/intent=ci-status/, (route) =>
    route.fulfill({ status: 502, json: { error: "Live proof unavailable" } }),
  );
  await page.route(/intent=ci-history.*scope=/, (route) =>
    route.fulfill({ json: history }),
  );
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const summary = await openSummary(parts(page).intent, "dashboard/tests");
  const shown = summary.getByRole("region", {
    name: "Test execution time history",
    exact: true,
  });
  await expect(shown.getByRole("listitem")).toHaveText(
    `Nov 7 · 0 ms · test cases · entry dashboard/tests · test files · Partial · missing part 2 · Observed trunk endpoint · Exact build ${shortSha(revision)} · Run 31 · attempt 1 · Represents ${shortSha(revision)} (observed trunk endpoint) (exact build)`,
  );
  const chart = shown.getByRole("img", {
    name: "Test execution time for test cases by build date; observed trunk endpoint marked",
  });
  await expect(chart).toBeVisible();
  await expect(chart.locator(".intent-ci-history-selected")).toHaveText(
    "Endpoint",
  );
  await expect(chart.locator("path.intent-ci-history-point title")).toHaveText(
    "Nov 7 · 0 ms · test cases · Exact build · Observed trunk endpoint",
  );
  await expect(shown).toContainText(
    "No complete test execution times are available for test files.",
  );
  await expect(shown.getByRole("img")).toHaveCount(1);
});
