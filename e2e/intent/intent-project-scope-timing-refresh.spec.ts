import type { Locator } from "@playwright/test";
import {
  openProjectFileTiming,
  scopeHistory,
  scopeHistoryChart,
  scopeHistoryReading,
} from "../../dashboard/test-support/intentScopeHistoryPage.ts";
// Kept landed history separates a middle Done landing from observed trunk,
// read by a dashboard that collects nothing (../../dashboard/test-support/support/projectScopeHistoryFixture.ts).
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import { intentReviewFiles } from "../../dashboard/test-support/intentReviewFiles.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  chooseRecentStory,
  chooseWholeProject,
} from "../../dashboard/test-support/recentStoriesPage.ts";
import {
  fileReadingTab,
  proofRegion,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  intentReadingScroll,
  scrollIntentReadingHalfway,
} from "../../dashboard/test-support/intentReadingPlacePage.ts";
import { openSummary } from "../../dashboard/test-support/intentSummaryCiProofFixtures.ts";
import { untilPageReadsAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  advanceTrunkWithoutCollectedBuild,
  historyBuildAcquisitions,
  readKeptProjectHistory,
  test,
} from "../../dashboard/test-support/support/projectScopeHistoryFixture.ts";
import { intentFile } from "../../dashboard/test-support/support/intentStoryPage.ts";
import { expect } from "../../dashboard/test-support/support/preparationPage.ts";

const landings = (["baseline", "completion", "latest"] as const).map(
  (point, index) => ({
    point,
    at: `2026-11-0${String(index + 5)}T10:10:00.000Z`,
    receipt: `31000000-1000-4000-8000-00000000000${String(index + 1)}`,
  }),
);
const runs = [
  ["baseline", 101, "2026-11-05T10:00:00Z", [["folder/a.spec.ts", 8000, 80]]],
  [
    "branchSide",
    102,
    "2026-11-06T09:00:00Z",
    [["folder/a.spec.ts", 10000, 100]],
  ],
  [
    "completion",
    103,
    "2026-11-06T10:00:00Z",
    [["folder/a.spec.ts", 11000, 110]],
  ],
  ["latest", 104, "2026-11-07T10:00:00Z", [["folder/a.spec.ts", 9000, 90]]],
] as const;

const location = "dashboard/tests";
const recent = (identity: string) => ({ project: "Open Dough", identity });
const path = `${location}/folder/a.spec.ts`;

async function readDoneFileProof(intent: Locator) {
  await openSummary(intent, location);
  await intentFile(intent, `Modified ${path}`).click();
  await fileReadingTab(intent, "Proof").click();
}

test("the bookmark distinguishes collected trunk timing from a Done landing and returning to Intent keeps the reading place", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const { setup, latest, intent } =
    await test.step("Given collected builds on both scopes", () =>
      readKeptProjectHistory(page, dashboard, origin, { landings, runs }));
  const { history, selected, doneChart } =
    await test.step("When I open the changed file's Done Proof", async () => {
      await readDoneFileProof(intent);
      const history = scopeHistory(proofRegion(intent));
      return {
        history,
        selected: scopeHistoryReading(history).selected,
        doneChart: scopeHistoryChart(history, "test cases"),
      };
    });
  const done =
    await test.step("Then history stops at the middle landing", async () => {
      const done = `Selected landing ${shortSha(setup.completion)} · 11.0 s`;
      await expect(selected).toHaveText(done);
      return done;
    });
  await test.step("And the chart shows two builds including the baseline", async () => {
    await expect(doneChart.marks).toHaveCount(2);
    await expect(doneChart.mark("Nov 5 · 8.0 s")).toHaveCount(1);
    await expect(history).not.toContainText(shortSha(latest));
  });
  const offset = await test.step("When I scroll the Proof reading", () =>
    scrollIntentReadingHalfway(intent));
  await test.step("And I show Development", () =>
    parts(page).development.click());
  await test.step("And I return to Intent", () =>
    parts(page).intentChoice.click());
  await test.step("Then the selected file, Proof and scroll position remain", async () => {
    await intentReviewFiles(intent).expectSelected(`Modified ${path}`);
    await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  });
  const before =
    await test.step("Given the story reads have settled", async () => {
      await untilPageReadsAnswered(page);
      return historyBuildAcquisitions(github.calls, [1001, 1002, 1003]);
    });
  await test.step("When I choose Whole project", () =>
    chooseWholeProject(page));
  await test.step("And I read the same file in project scope", async () => {
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await openProjectFileTiming(intent, location, "folder/", "a.spec.ts");
  });
  await test.step("Then the project's chart includes the later trunk measurement", async () => {
    await expect(selected).toHaveText(
      `Observed trunk endpoint ${shortSha(latest)} · 9.0 s`,
    );
    await expect(
      scopeHistoryChart(history, "test cases", "observed trunk endpoint").marks,
    ).toHaveCount(3);
  });
  await test.step("When I reopen the Done story’s Proof", async () => {
    await chooseRecentStory(page, recent(setup.identity));
    await readDoneFileProof(intent);
  });
  await test.step("Then its historical chart returns", async () => {
    await expect(selected).toHaveText(done);
    await expect(doneChart.marks).toHaveCount(2);
    await expect(history).not.toContainText(shortSha(latest));
  });
  await test.step("And the scope changes acquire no earlier artifacts again", async () => {
    await untilPageReadsAnswered(page);
    expect(historyBuildAcquisitions(github.calls, [1001, 1002, 1003])).toBe(
      before,
    );
  });
});

test("project refresh keeps the collected history and Proof beside an unmeasured trunk endpoint", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const { setup, latest, intent } =
    await test.step("Given the collected builds are available", () =>
      readKeptProjectHistory(page, dashboard, origin, { landings, runs }));
  const before =
    await test.step("Given the story reads have settled", async () => {
      await untilPageReadsAnswered(page);
      return historyBuildAcquisitions(github.calls, [1001, 1002, 1003]);
    });
  await test.step("When I choose Whole project", () =>
    chooseWholeProject(page));
  const { history, reading, trunk } =
    await test.step("And I open the file's project Proof", async () => {
      await expect(intent).not.toHaveAttribute("data-selected-story");
      await openProjectFileTiming(intent, location, "folder/", "a.spec.ts");
      return readProjectTiming(intent);
    });
  const atLatest =
    await test.step("Then the observed trunk endpoint has timing", async () => {
      const endpoint = `Observed trunk endpoint ${shortSha(latest)} · 9.0 s`;
      await expect(reading.selected).toHaveText(endpoint);
      return endpoint;
    });
  await test.step("And the project chart has three measured points", () =>
    expect(trunk.marks).toHaveCount(3));
  await test.step("When I show Development and return to Intent with no story selected", async () => {
    const { development, intentChoice } = parts(page);
    await development.click();
    await intentChoice.click();
  });
  await test.step("Then the same project Proof and chart remain selected", async () => {
    await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(reading.selected).toHaveText(atLatest);
    await expect(trunk.marks).toHaveCount(3);
  });
  const observed = await test.step("Given the build's observation time", () =>
    reading.endpointTime.getAttribute("datetime"));
  const next = await test.step("When unmeasured trunk arrives", () =>
    advanceTrunkWithoutCollectedBuild(page, origin));
  await test.step("Then the new endpoint has no timing and keeps the earlier Proof", async () => {
    await expect(reading.selected).toContainText(
      `Observed trunk endpoint ${shortSha(next)} · No timing`,
    );
    await expect(
      proofRegion(intent).getByRole("list", {
        name: "CI evidence",
        exact: true,
      }),
    ).toContainText(`Revision ${shortSha(latest)}`);
    await expect(reading.status).toHaveText(
      "Observed trunk endpoint not collected",
    );
  });
  await test.step("And three measured points precede the gap", async () => {
    await expect(trunk.measured).toHaveCount(3);
    await expect(trunk.unavailable).toHaveCount(1);
    await expect(reading.endpointTime).not.toHaveAttribute(
      "datetime",
      observed ?? "",
    );
  });
  await test.step("And the earlier artifacts stay local", () => {
    expect(historyBuildAcquisitions(github.calls, [1001, 1002, 1003])).toBe(
      before,
    );
  });
  await test.step("When I reselect the Done story and open its file Proof", async () => {
    await chooseRecentStory(page, recent(setup.identity));
    await readDoneFileProof(intent);
  });
  await test.step("Then the Done landing still has two points", async () => {
    await expect(reading.selected).toHaveText(
      `Selected landing ${shortSha(setup.completion)} · 11.0 s`,
    );
    await expect(scopeHistoryChart(history, "test cases").marks).toHaveCount(2);
  });
});

function readProjectTiming(intent: Locator) {
  const history = scopeHistory(proofRegion(intent));
  return {
    history,
    reading: scopeHistoryReading(history),
    trunk: scopeHistoryChart(history, "test cases", "observed trunk endpoint"),
  };
}
