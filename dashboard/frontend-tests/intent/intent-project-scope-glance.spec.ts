// Project Intent reads test execution time as a Done story does
// (./intent-scope-glance.spec.ts): the entry and folder Summaries read history
// before the child table, and file Proof's Test cases / Test file choice
// changes the observed trunk endpoint's value, average and chart scale
// together, in light and dark appearance. Real collection is
// ../../../e2e/intent/intent-scope-collected-file-timing-history.spec.ts; the
// typed scope history read answers each scope.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { emulateMedia } from "../review/browser-session.ts";
import { workOf } from "./intent-ci-homepage-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { inertCiReads, openDoughSource } from "./intent-ci-status-fixtures.ts";
import {
  configuredIntentReads,
  unreadLiveProof,
} from "./intent-project-scope-history-fixtures.ts";
import {
  openFileProof,
  openScopeChild,
  scopeHistoryIn,
} from "./intent-scope-history-page.ts";
import { openSummary } from "./intent-summary-proof-page.ts";

const work = workOf(openDoughSource, "b2b2b2b");

test("Project Intent reads each scope's test execution time history before its table and switches a file's timing unit", async () => {
  const scopes: string[] = [];
  await mountIntentCiPage({
    work,
    reads: {
      intent: configuredIntentReads(
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting(
            "dashboard/tests/folder/a.spec.ts",
            "dashboard/tests/root.spec.ts",
          )
          .please(),
      ),
      ci: inertCiReads({
        readStatus: () => Promise.resolve(unreadLiveProof),
        readScopeHistory: (...[, path, endpoint]) => {
          scopes.push(path);
          return Promise.resolve(
            makeMe.aScopeHistoryGlance
              .at(path)
              .timing("case", [100, 100, 100, 100, 115], 120)
              .averaging("case", 103, 5)
              .timing("file", [10, 10, 10, 10, 11.5], 12)
              .averaging("file", 10.3, 5)
              .through(endpoint.revision)
              .please(),
          );
        },
      }),
    },
  });
  const endpoint = `Observed trunk endpoint ${shortSha(work.revision)}`;
  const cases = {
    selected: `${endpoint} · 120 ms`,
    average: "Prior-build average · 103 ms · 5 prior builds used",
    change: "vs. prior average · +17 ms (+17%)",
  };

  const summary = await openSummary("dashboard/tests");
  const history = scopeHistoryIn(summary);
  await expect.poll(history.readout).toEqual(cases);
  await expect.element(history.unit("Test files")).toBeVisible();
  const table = (path: string) =>
    summary.getByRole("table", {
      name: `CI proof of the immediate folders and files of ${path}`,
      exact: true,
    });
  await expect
    .poll(() => history.standsAbove(table("dashboard/tests")))
    .toBe(true);
  await openScopeChild("folder/", "dashboard/tests/folder");
  await expect.poll(history.readout).toEqual(cases);
  await expect
    .poll(() => history.standsAbove(table("dashboard/tests/folder")))
    .toBe(true);

  await openScopeChild("a.spec.ts");
  const file = await openFileProof();
  const fileHistory = scopeHistoryIn(file);
  await expect.poll(fileHistory.readout).toEqual(cases);
  await expect
    .poll(() =>
      fileHistory.standsAbove(file.getByText("Live proof unavailable")),
    )
    .toBe(true);
  const caseChart = await fileHistory.chart(
    "test cases",
    "observed trunk endpoint",
  );
  expect(caseChart.readout()).toBe("Nov 6 · Endpoint · 120 ms");
  // Each unit's own scale around its own timings.
  expect(caseChart.axisLabels()).toEqual([
    "90 ms",
    "100 ms",
    "110 ms",
    "120 ms",
    "130 ms",
  ]);
  await fileHistory.choose("Test file", "keyboard");
  await expect.poll(fileHistory.readout).toEqual({
    selected: `${endpoint} · 12 ms`,
    average: "Prior-build average · 10 ms · 5 prior builds used",
    change: "vs. prior average · +2 ms (+17%)",
  });
  const fileChart = await fileHistory.chart(
    "test files",
    "observed trunk endpoint",
  );
  expect(fileChart.readout()).toBe("Nov 6 · Endpoint · 12 ms");
  expect(caseChart.drawn()).toBe(false);
  expect(fileChart.axisLabels()).toEqual(["5 ms", "10 ms", "15 ms", "20 ms"]);

  await emulateMedia([{ name: "prefers-color-scheme", value: "dark" }]);
  await expect.poll(fileHistory.changeCue).toBe("slower");
  expect(scopes).toEqual([
    "dashboard/tests",
    "dashboard/tests/folder",
    "dashboard/tests/folder/a.spec.ts",
  ]);
});
