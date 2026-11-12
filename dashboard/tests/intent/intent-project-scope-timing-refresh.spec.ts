import {
  scopeHistory,
  scopeHistoryReading,
} from "../intentScopeHistoryPage.ts";
// Kept landed history separates a middle Done landing from observed trunk,
// read by a dashboard that collects nothing (../support/projectScopeHistoryFixture.ts).
import { shortSha } from "../../src/baseCiWording.ts";
import { openProjectIntent, returnToStory } from "../intentModePage.ts";
import {
  fileReadingTab,
  proofRegion,
  intentReadingScroll,
  scrollIntentReadingHalfway,
} from "../intentPerspectivePage.ts";
import { childName } from "../intentScopeProofPage.ts";
import { openSummary } from "../intentSummaryCiProofFixtures.ts";
import { passTimeUntilCheckedAfterSettled } from "../autoRefreshJourney.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import {
  readKeptProjectHistory,
  test,
} from "../support/projectScopeHistoryFixture.ts";
import { intentFile } from "../support/intentStoryPage.ts";
import { originMain } from "../support/sessionDialog.ts";
import { git } from "../support/storyReviewWorktree.ts";
import { expect } from "../support/preparationPage.ts";

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

test("visiting Project Intent reads later collected trunk builds and returning restores the middle Done history, selected file and reading place", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const { setup, latest, intent } = await readKeptProjectHistory(
    page,
    dashboard,
    origin,
    { landings, runs },
  );
  await openSummary(intent, "dashboard/tests");
  const path = "dashboard/tests/folder/a.spec.ts";
  await intentFile(intent, `Modified ${path}`).click();
  await fileReadingTab(intent, "Proof").click();
  const history = scopeHistory(proofRegion(intent));
  const rows = scopeHistoryReading(history).rows;
  await expect(history).toContainText(
    `Selected landing ${shortSha(setup.completion)}`,
  );
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText("8.0 s");
  await expect(rows.nth(1)).toContainText("11.0 s");
  await expect(history).not.toContainText(shortSha(latest));
  const offset = await scrollIntentReadingHalfway(intent);
  const acquisitions = () =>
    github.calls.filter(
      ({ request }) =>
        request.kind === "actions-artifact-zip" &&
        [1001, 1002, 1003].includes(request.artifactId),
    ).length;
  await untilPageReadsAnswered(page);
  // The first Project visit legitimately acquires its current live Proof
  // (run104). History navigation must not reacquire earlier build artifacts.
  const before = acquisitions();
  await openProjectIntent(intent);
  await expect(intent).toHaveAttribute("data-selected-story", setup.identity);
  const projectSummary = await openSummary(intent, "dashboard/tests");
  await childName(projectSummary, "folder/").first().click();
  await childName(projectSummary, "a.spec.ts").first().click();
  await fileReadingTab(intent, "Proof").click();
  await expect(history).toContainText(
    `Observed trunk endpoint main ${shortSha(latest)}`,
  );
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(2)).toContainText("9.0 s");
  await returnToStory(intent);
  await expect(intentFile(intent, `Modified ${path}`)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(history).toContainText(
    `Selected landing ${shortSha(setup.completion)}`,
  );
  await expect(rows).toHaveCount(2);
  await expect(history).not.toContainText(shortSha(latest));
  await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  await untilPageReadsAnswered(page);
  expect(acquisitions()).toBe(before);
});

test("Project Intent refresh keeps collected history and Proof when the new trunk endpoint has no collected observation, then returns to the middle Done landing", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const { setup, latest, intent } = await readKeptProjectHistory(
    page,
    dashboard,
    origin,
    { landings, runs },
  );
  const acquisitions = () =>
    github.calls.filter(
      ({ request }) =>
        request.kind === "actions-artifact-zip" &&
        [1001, 1002, 1003].includes(request.artifactId),
    ).length;
  await untilPageReadsAnswered(page);
  const before = acquisitions();
  await openProjectIntent(intent);
  await expect(intent).toHaveAttribute("data-selected-story", setup.identity);
  const summary = await openSummary(intent, "dashboard/tests");
  await childName(summary, "folder/").first().click();
  await childName(summary, "a.spec.ts").first().click();
  await fileReadingTab(intent, "Proof").click();
  const history = scopeHistory(proofRegion(intent));
  const rows = scopeHistoryReading(history).rows;
  await expect(history).toContainText(
    `Observed trunk endpoint main ${shortSha(latest)}`,
  );
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(2)).toContainText("9.0 s");
  await returnToStory(intent);
  await openProjectIntent(intent);
  await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(history).toContainText(
    `Observed trunk endpoint main ${shortSha(latest)}`,
  );
  await expect(rows).toHaveCount(3);
  const observed =
    await scopeHistoryReading(history).endpointTime.getAttribute("datetime");
  const main = await originMain(origin);
  const next = (
    await origin.originGit(
      "-c",
      "user.name=Trunk Mover",
      "-c",
      "user.email=trunk@example.invalid",
      "commit-tree",
      `${main}^{tree}`,
      "-p",
      main,
      "-m",
      "New observed trunk head",
    )
  ).trim();
  await origin.originGit("update-ref", "refs/heads/main", next, main);
  git(origin.project, "fetch", "--quiet", "origin", "main");
  await passTimeUntilCheckedAfterSettled(page);
  await untilPageReadsAnswered(page);
  await expect(history).toContainText(
    `Observed trunk endpoint main ${shortSha(next)}`,
  );
  await expect(
    proofRegion(intent).getByRole("list", {
      name: "CI evidence",
      exact: true,
    }),
  ).toContainText(`Revision ${shortSha(latest)}`);
  await expect(history).toContainText("no matching collected observation");
  await expect(rows.filter({ hasText: /Run \d/ })).toHaveCount(3);
  await expect(scopeHistoryReading(history).endpointTime).not.toHaveAttribute(
    "datetime",
    observed ?? "",
  );
  expect(acquisitions()).toBe(before);
  await returnToStory(intent);
  await openSummary(intent, "dashboard/tests");
  await intentFile(intent, "Modified dashboard/tests/folder/a.spec.ts").click();
  await fileReadingTab(intent, "Proof").click();
  await expect(history).toContainText(
    `Selected landing ${shortSha(setup.completion)}`,
  );
  await expect(rows).toHaveCount(2);
});
