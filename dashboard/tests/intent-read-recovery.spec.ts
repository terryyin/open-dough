// Intent locations recover through the page's shared schedule while the
// published observation keeps checking its own revision.

import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { headsChecks, setPageVisibility } from "./autoRefreshJourney.ts";
import { filesOf } from "./catalogProjectRecords.ts";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import {
  doughnut,
  doughnutSettings,
  nodeTest,
  publishIntentProject,
} from "./intentCodeBrowseFixtures.ts";
import {
  countLocationsReads,
  intentLocationName,
} from "./intentPerspectivePage.ts";
import { noticedResumeTime } from "./limitNotice.ts";
import { limiting } from "./limitedReadingJourney.ts";
import {
  openUntilRead,
  untilPageRequestsAnswered,
  whileNotingChecks,
} from "./pageRequestNotes.ts";
import { untilReported } from "./support/directedWait.ts";
import { publishes } from "./support/fakeGitHub.ts";

const opened = new Date("2026-11-05T08:00:00.000Z");
const locationsRequest = /[?&]intent=locations(&|$)/;
const locationFiles = { "scripts/example.test.mjs": nodeTest };

type Page = Parameters<typeof parts>[0];

async function openDoughnut(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openUntilRead(page, "/?project=doughnut");
  await expectSettledPage(page, {
    taken: [doughnut.taken],
    backlog: [doughnut.queued],
  });
  await untilPageRequestsAnswered(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  return intent;
}

async function advance(page: Page, milliseconds: number) {
  await page.clock.runFor(milliseconds);
  await untilPageRequestsAnswered(page);
}

test("unreachable Intent locations recover after 15, 30, 60 and 60 seconds while revision checks continue", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  await publishIntentProject(page, doughnut, doughnutSettings, locationFiles);
  const reads = countLocationsReads(page);
  let unreachable = true;
  await page.route(locationsRequest, async (route) => {
    if (unreachable) await route.abort("connectionreset");
    else await route.fallback();
  });

  const intent = await openDoughnut(page);
  const problem = intent.getByRole("alert");
  await expect(problem).toContainText(
    "The local authenticated read could not be reached",
  );
  await expect(problem.getByRole("button", { name: "Retry" })).toBeVisible();
  expect(reads()).toBe(1);
  const checksBefore = headsChecks(githubFor(page).calls).length;

  await whileNotingChecks(page, async (askedAfter) => {
    await advance(page, 14_999);
    expect(reads()).toBe(1);
    expect(await askedAfter()).toEqual([]);
    await advance(page, 251);
    expect(await askedAfter()).toEqual([15_000]);
    expect(headsChecks(githubFor(page).calls)).toHaveLength(checksBefore + 1);
    expect(reads()).toBe(2);
    await expect(problem).toContainText("could not be reached");
  });

  for (const [wait, before] of [
    [30_000, 2],
    [60_000, 3],
    [60_000, 4],
  ] as const) {
    // Leave room for the preceding request to settle during its clock step.
    await advance(page, wait - 1_000);
    expect(reads()).toBe(before);
    if (before === 4) unreachable = false;
    await advance(page, 1_250);
    expect(reads()).toBe(before + 1);
    if (unreachable) {
      await expect(problem).toContainText("could not be reached");
    }
  }

  await expect(intentLocationName(intent, "scripts")).toBeVisible();
  await expect(problem).toHaveCount(0);
  await advance(page, 61_000);
  expect(reads()).toBe(5);
});

test("Intent locations make no recovery request while hidden and ask once on reveal", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  await publishIntentProject(page, doughnut, doughnutSettings, locationFiles);
  const reads = countLocationsReads(page);
  await page.route(
    locationsRequest,
    (route) => route.abort("connectionreset"),
    {
      times: 1,
    },
  );

  const intent = await openDoughnut(page);
  await expect(intent.getByRole("alert")).toContainText("could not be reached");
  await setPageVisibility(page, "hidden");
  await advance(page, 65_000);
  expect(reads()).toBe(1);

  await setPageVisibility(page, "visible");
  await untilPageRequestsAnswered(page);
  expect(reads()).toBe(2);
  await expect(intentLocationName(intent, "scripts")).toBeVisible();
  await advance(page, 61_000);
  expect(reads()).toBe(2);
});

test("published detail and Intent locations share a wait, and healing detail leaves Intent pending", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  await publishIntentProject(page, doughnut, doughnutSettings, locationFiles);
  let detailReads = 0;
  let detailUnreachable = true;
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("path") === doughnut.queuedPath,
    async (route) => {
      detailReads += 1;
      if (detailUnreachable) await route.abort("connectionreset");
      else await route.fallback();
    },
  );
  const reads = countLocationsReads(page);
  let locationsUnreachable = true;
  await page.route(locationsRequest, async (route) => {
    if (locationsUnreachable) await route.abort("connectionreset");
    else await route.fallback();
  });

  const intent = await openDoughnut(page);
  const publishedProblem = page.getByRole("alert").filter({
    hasText: "Reading unanswered detail again",
  });
  const intentProblem = intent.getByRole("alert");
  await expect(publishedProblem).toBeVisible();
  await expect(intentProblem).toContainText("could not be reached");
  expect([detailReads, reads()]).toEqual([1, 1]);

  detailUnreachable = false;
  await advance(page, 14_000);
  expect([detailReads, reads()]).toEqual([1, 1]);
  await advance(page, 1_250);
  expect([detailReads, reads()]).toEqual([2, 2]);
  await expect(publishedProblem).toHaveCount(0);
  await expect(intentProblem).toContainText("could not be reached");

  locationsUnreachable = false;
  await advance(page, 29_000);
  expect([detailReads, reads()]).toEqual([2, 2]);
  await advance(page, 1_250);
  expect([detailReads, reads()]).toEqual([2, 3]);
  await expect(intentLocationName(intent, "scripts")).toBeVisible();
});

test("malformed Intent settings stay visible until manual Retry", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  await publishIntentProject(page, doughnut, "{not json", locationFiles);
  const reads = countLocationsReads(page);

  const intent = await openDoughnut(page);
  const problem = intent.getByRole("alert");
  await expect(problem).toContainText(
    ".planning/open-dough.json is not valid JSON",
  );
  await advance(page, 70_000);
  expect(reads()).toBe(1);
  await expect(problem).toBeVisible();

  await problem.getByRole("button", { name: "Retry" }).click();
  await untilPageRequestsAnswered(page);
  expect(reads()).toBe(2);
  await expect(problem).toContainText(
    ".planning/open-dough.json is not valid JSON",
  );
});

test("rate-limited Intent locations reread when the standing limit ends", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const published = publishes({
    revision: doughnut.revision,
    files: {
      ...filesOf(doughnut),
      ".planning/open-dough.json": doughnutSettings,
      ...locationFiles,
    },
  });
  const directedSeconds = 2;
  const answers = limiting(page, published, directedSeconds);
  answers.limit(
    (request) => request.kind === "tree" && request.path === "scripts",
  );
  githubFor(page).serve(doughnut.repository, answers.answer);
  const reads = countLocationsReads(page);

  const intent = await openDoughnut(page);
  await expect(intent.getByRole("alert")).toContainText(
    "GitHub limited the rate",
  );
  const resumesAt = await noticedResumeTime(page);
  const limitSeenAt = answers.lift();

  await advance(page, resumesAt - opened.getTime() - 1);
  expect(reads()).toBe(1);
  await untilReported(limitSeenAt, directedSeconds);
  await advance(page, 251);
  expect(reads()).toBe(2);
  await expect(intentLocationName(intent, "scripts")).toBeVisible();
});
