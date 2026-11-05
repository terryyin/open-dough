// The CI proof of the run Intent's CI status tab shows a result of
// (../src/IntentCiProof.tsx): after the judgment, which reads as it always
// has, Proof names that run once -- revision, link and attempt -- then a
// table with one row per entry the run's CI declared, in its order, read
// cell by cell under the Entry, Counts, Test execution time and Parts
// headers (counts, unit and any gap). The summary is the collector's
// own, served as a real zip from the run's artifact download through the
// controlled `gh` (./support/ciProofArtifacts.ts). Each other reason no
// proof can be shown, a running result's ancestor proof and the per-attempt
// memory: ./intent-ci-proof-reasons.spec.ts. Query-shape refusals of
// `parseIntentCiProofRead`: ../../tests/support/dashboard-ci-proof-parse.test.mjs.

import { expect, test } from "./dashboardTest.ts";
import { judged, runUrl } from "./intentCiStatusPage.ts";
import {
  artifactId,
  expectProofRows,
  failedVerdict,
  openFailedRun,
  proofCalls,
  proofTable,
  run,
} from "./intentCiProofPage.ts";
import { twiceZoomedWindow, zoomedWindow } from "./accessibleReading.ts";
import { wordsBrokenApart } from "./wholeWords.ts";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import {
  counts,
  proofSummary,
  runArtifactsAnswer,
  summaryZipAnswer,
} from "./support/ciProofArtifacts.ts";

const notRecorded =
  "not recorded: this summary has no test execution durations";

test("a failed run with a summary shows Failed as before, then Proof of that run's revision, link and attempt with each entry's counts and parts", async ({
  page,
}) => {
  const summary = proofSummary(
    run,
    [
      ["dashboard/tests", 2],
      ["tests", 1],
    ],
    [
      ["dashboard/tests", 1, 2, "tests", counts(12)],
      ["dashboard/tests", 2, 2, "tests", counts(7, 1)],
      ["tests", 1, 1, "checks", counts(5)],
    ],
  );
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const { published, panel, proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    async () => {
      await held;
      return summaryZipAnswer(summary);
    },
  );

  await test.step("the verdict is shown while Proof is still being read", async () => {
    await expect(panel.locator(".intent-ci-state")).toHaveText(failedVerdict);
    await expect(proof).toContainText("Checking the CI proof of this run…");
    await expect(
      panel.locator(".intent-ci-state ~ .intent-ci-proof"),
    ).toBeVisible();
    release();
  });

  await test.step("Proof names the run once, then one row per declared entry", async () => {
    await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
      "Attempt 1 of run 41 at a1b2c3d.",
    );
    await expect(proof.getByRole("link", { name: "run 41" })).toHaveAttribute(
      "href",
      runUrl,
    );
    await expectProofRows(proof, [
      [
        "dashboard/tests",
        "19 passed and 1 failed tests",
        notRecorded,
        "2 of 2 parts present",
      ],
      ["tests", "5 passed checks", notRecorded, "1 of 1 part present"],
    ]);
    await expect(proof.locator(".intent-ci-proof-gap")).toHaveCount(0);
    await expect(panel.locator(".intent-ci-state")).toHaveText(failedVerdict);
  });

  await test.step("Proof was read for that run's attempt by its artifact name, then one download", () => {
    expect(proofCalls(published.requests)).toEqual([
      "artifacts of run 41: ci-proof-summary-attempt-1",
      `zip ${String(artifactId)}`,
    ]);
  });
});

test("a missing part is shown as a gap and its counts are not counted", async ({
  page,
}) => {
  const present = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12].map(
    (part) => ["dashboard/tests", part, 12, "tests", counts(10)] as const,
  );
  const summary = proofSummary(run, [["dashboard/tests", 12]], present);
  const { proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer(summary),
  );
  await expectProofRows(proof, [
    [
      "dashboard/tests",
      "110 passed tests",
      "partial: part 4 of 12 missing",
      "11 of 12 parts present; part 4 of 12 missing",
    ],
  ]);
  await expect(proof.locator(".intent-ci-proof-gap")).toHaveText([
    "part 4 of 12 missing",
  ]);
});

test("a CI proof query that omits the attempt is refused before asking GitHub", async ({
  page,
}) => {
  const { published, proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, undefined),
    () => ({ status: 404, contentType: "application/json", body: "{}" }),
  );
  // The page's own proof read has settled before any is counted.
  await expect(proof.locator(".intent-ci-proof-unavailable")).toBeVisible();
  const before = published.requests.length;
  const answer = await page.evaluate(async (url) => {
    const response = await fetch(url);
    return {
      status: response.status,
      body: (await response.json()) as unknown,
    };
  }, `${authenticatedReadEndpoint}?source=open-dough&intent=ci-proof&run=41&revision=${judged}`);
  expect(answer.status).toBe(400);
  expect(published.requests.length).toBe(before);
});

test("at 200% zoom and on a narrow window each entry's row reads whole within the reading pane, nothing scrolls sideways and the keyboard passes the table", async ({
  page,
}) => {
  const longEntry = "src/skills/dough-test-optimization/scripts";
  const summary = proofSummary(
    run,
    [
      [longEntry, 3],
      ["dashboard/tests", 2],
    ],
    [
      [longEntry, 1, 3, "checks", counts(40, 2, 1), 30_000],
      [longEntry, 3, 3, "checks", counts(12), 20_000],
      ["dashboard/tests", 1, 2, "tests", counts(8), 75_000],
      ["dashboard/tests", 2, 2, "tests", counts(4), 45_000],
    ],
  );
  const rows = [
    [
      longEntry,
      "52 passed, 2 failed and 1 other checks",
      "partial: part 2 of 3 missing",
      "2 of 3 parts present; part 2 of 3 missing",
    ],
    ["dashboard/tests", "12 passed tests", "2 min", "2 of 2 parts present"],
  ] as const;
  const { panel, proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer(summary),
  );
  await expectProofRows(proof, rows);
  const table = proofTable(proof);
  const box = proof.locator(".intent-proof-table");
  const again = panel.getByRole("button", { name: "Check again" });
  const link = proof.getByRole("link", { name: "run 41" });
  // How far the table's box scrolls sideways, and whether the box lies within
  // the reading pane and the page does not scroll sideways.
  const fit = () =>
    box.evaluate((element) => {
      const pane = element.closest(".intent-reading");
      if (pane === null) throw new Error("no reading pane");
      const shown = element.getBoundingClientRect();
      const reading = pane.getBoundingClientRect();
      return {
        sideways: element.scrollWidth - element.clientWidth,
        inPane: shown.left >= reading.left && shown.right <= reading.right,
        pageSideways:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      };
    });

  // Every row reads exactly, every column fits the reading pane with nothing
  // scrolling sideways, `whole` cells keep their words whole, and the table
  // adds no keyboard stop between the run link above it and Check again.
  const readsAt = async (
    window: { width: number; height: number },
    whole: string,
  ) => {
    await page.setViewportSize(window);
    await expect(panel.locator(".intent-ci-state")).toHaveText(failedVerdict);
    await expectProofRows(proof, rows);
    await table.scrollIntoViewIfNeeded();
    await expect(table).toBeVisible();
    expect(await fit()).toEqual({
      sideways: 0,
      inPane: true,
      pageSideways: false,
    });
    expect(await wordsBrokenApart(table, whole)).toEqual([]);
    await again.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(link).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(again).toBeFocused();
  };

  await test.step("a window under 200% zoom keeps even path parts whole", async () => {
    await readsAt(twiceZoomedWindow, "th, td");
  });
  await test.step("a narrow window under 400% zoom wraps the long path within its own column", async () => {
    await readsAt(zoomedWindow, "thead th, tbody td");
  });
});
