// A Done story's test execution time reads at a glance while drilling from
// its test entry into a folder and a test file: each Summary reads its history
// before the child table, and file Proof's Test cases / Test file choice
// changes the selected value, average and chart scale together, by keyboard
// and touch, in light and dark appearance. Each scope's retained history is
// the typed scope history read's answer; reading it without upstream CI
// requests is ../../backend-tests/intent/landed-ci-scope-proof-completion.spec.ts's,
// and collecting it is
// ../../../e2e/intent/intent-scope-collected-file-timing-history.spec.ts's.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { portrait, useTouchScreen } from "../navigation/board-touch-page.ts";
import { emulateMedia } from "../review/browser-session.ts";
import { visibleText } from "./intent-ci-comparison-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  openFileProof,
  openScopeChild,
  openScopeSummary,
  scopeHistoryIn,
} from "./intent-scope-history-page.ts";
import {
  doneCompletion,
  doneSource,
  openDoneStoryComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

// Five measured priors and a failed sixth before the selected landing. The
// entry holds a.spec.ts's cases six times over, the folder three times; each
// test file outcome takes a tenth of its cases. Each scope's selected landing
// takes its cases' measured time.
const scopes: Readonly<Record<string, { times: number; selectedMs: number }>> =
  {
    "dashboard/tests": { times: 6, selectedMs: 1440 },
    "dashboard/tests/folder": { times: 3, selectedMs: 720 },
    "dashboard/tests/folder/a.spec.ts": { times: 1, selectedMs: 120 },
  };
const priorsOf = (ms: readonly number[], times: number) => [
  ...ms.map((each) => each * times),
  "failed" as const,
];

test("drilling from a Done story's test entry to a folder and a test file reads each scope's execution time history before its table", async () => {
  await useTouchScreen();
  const requests: string[] = [];
  await openDoneStoryComparison({
    review: () => Promise.resolve(publishedCompletion()),
    ci: {
      readScopeHistory: (source, path, endpoint) => {
        requests.push(`${source.id} ${path} ${endpoint.revision}`);
        const scope = scopes[path];
        if (scope === undefined)
          return Promise.reject(new Error(`Unarranged scope ${path}`));
        const { times, selectedMs } = scope;
        return Promise.resolve(
          makeMe.aScopeHistoryGlance
            .at(path)
            .timing(
              "case",
              priorsOf([100, 100, 100, 100, 115], times),
              selectedMs,
            )
            .averaging("case", 103 * times, 5)
            .timing(
              "file",
              priorsOf([10, 10, 10, 10, 11.5], times),
              selectedMs / 10,
            )
            .averaging("file", 10.3 * times, 5)
            .through(endpoint.revision)
            .please(),
        );
      },
    },
  });
  await page.viewport(portrait.width, portrait.height);
  await intentStoryCompare().chooseTab("Changes");
  const landing = `Selected landing ${shortSha(doneCompletion)}`;
  const priors = "5 prior builds used";

  const summary = await openScopeSummary("dashboard/tests");
  const history = scopeHistoryIn(summary);
  await expect.poll(history.readout).toEqual({
    selected: `${landing} · 1.4 s`,
    average: `Prior-build average · 618 ms · ${priors}`,
    change: "vs. prior average · +822 ms (+133%)",
  });
  expect(history.changeCue()).toBe("slower");
  expect(history.measures()).toContainEqual(
    expect.stringContaining("Cumulative test execution time"),
  );
  // No build list, membership or methodology; the chart and readout read it.
  expect(history.lists()).toBe(0);
  expect(history.evidence()).toBe(0);
  expect(history.text()).not.toMatch(
    /Builds and evidence|Median|calibration|Represents|Observed scope at each build/,
  );
  const table = (path: string) =>
    summary.getByRole("table", {
      name: `CI proof of the immediate folders and files of ${path}`,
      exact: true,
    });
  await expect
    .poll(() => history.standsAbove(table("dashboard/tests")))
    .toBe(true);
  // Six prior builds and the selected landing, which the readout names.
  const entryChart = await history.chart("test cases", "selected landing");
  expect(entryChart.marks()).toBe(7);
  expect(entryChart.readout()).toBe("Nov 7 · Selected landing · 1.4 s");
  // The failed build is its × under its mark.
  expect(entryChart.drawnUnder("Nov 6 · Failed build", "failed")).toBe(true);
  expect(entryChart.averageLabel()).toEqual(["Prior-build average 618 ms"]);

  await openScopeChild("folder/", "dashboard/tests/folder");
  await expect.poll(history.readout).toEqual({
    selected: `${landing} · 720 ms`,
    average: `Prior-build average · 309 ms · ${priors}`,
    change: "vs. prior average · +411 ms (+133%)",
  });
  await expect
    .poll(() => history.standsAbove(table("dashboard/tests/folder")))
    .toBe(true);

  // The file's Proof: history above its comparison, Test cases first.
  await openScopeChild("a.spec.ts");
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  await expect
    .element(intent.getByRole("region", { name: "Purpose", exact: true }))
    .toBeVisible();
  const file = await openFileProof();
  const fileHistory = scopeHistoryIn(file);
  const proofTable = file.getByRole("table", {
    name: "CI proof of dashboard/tests/folder/a.spec.ts",
    exact: true,
  });
  await expect.element(proofTable).toBeVisible();
  expect(visibleText(proofTable.element())).toContain("Baseline");
  await expect.poll(() => fileHistory.standsAbove(proofTable)).toBe(true);
  await expect.poll(fileHistory.readout).toEqual({
    selected: `${landing} · 120 ms`,
    average: `Prior-build average · 103 ms · ${priors}`,
    change: "vs. prior average · +17 ms (+17%)",
  });
  // Each scope's own history, read at the Done story's landing.
  expect(requests).toEqual(
    Object.keys(scopes).map(
      (path) => `${doneSource.id} ${path} ${doneCompletion}`,
    ),
  );
  const cases = await fileHistory.chart("test cases", "selected landing");
  // The dashed 103 ms average lies between its Nov 1/100 ms and Nov 5/115 ms marks.
  expect(cases.averageLabel()).toEqual(["Prior-build average 103 ms"]);
  const low = cases.markY("Nov 1 · 100 ms");
  const high = cases.markY("Nov 5 · 115 ms");
  expect(cases.averageY()).toBeCloseTo(low + ((high - low) * 3) / 15, 0);
  // Each unit's own scale around its own timings.
  expect(cases.axisLabels()).toEqual([
    "90 ms",
    "100 ms",
    "110 ms",
    "120 ms",
    "130 ms",
  ]);

  // A tap chooses the file's own outcome: its value, average and scale.
  await fileHistory.choose("Test file", "touch");
  await expect.poll(fileHistory.readout).toEqual({
    selected: `${landing} · 12 ms`,
    average: `Prior-build average · 10 ms · ${priors}`,
    change: "vs. prior average · +2 ms (+17%)",
  });
  const files = await fileHistory.chart("test files", "selected landing");
  expect(cases.drawn()).toBe(false);
  expect(files.averageLabel()).toHaveLength(1);
  expect(files.axisLabels()).toEqual(["5 ms", "10 ms", "15 ms", "20 ms"]);
  await files.tapMark("Nov 1 · 10 ms");
  await expect.poll(files.readout).toBe("Nov 1 · 10 ms");

  // The keyboard returns to Test cases; Purpose and the return stay offered.
  await fileHistory.choose("Test cases", "keyboard");
  await expect.poll(cases.readout).toBe("Nov 7 · Selected landing · 120 ms");
  await expect
    .element(
      file.getByRole("button", {
        name: "View story CI comparison",
        exact: true,
      }),
    )
    .toBeVisible();
  await expect
    .element(
      intent
        .getByRole("tablist", { name: "Purpose and Proof", exact: true })
        .getByRole("tab", { name: "Purpose", exact: true }),
    )
    .toBeVisible();
  expect(fileHistory.scrollingSideways(), "scrolling sideways").toEqual([]);

  await emulateMedia([{ name: "prefers-color-scheme", value: "dark" }]);
  await expect.poll(fileHistory.changeCue).toBe("slower");
  expect(fileHistory.readable(["Test cases", "Test file"], "test cases")).toBe(
    true,
  );
});
