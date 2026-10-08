// Recovery belongs to the current observation and obeys shared admission:
// visibility and project selection decide whether a due recovery may ask or
// publish; each leaving page releases only its wait. Provenance, check
// exclusion, and rate-limit precedence during recovery:
// ./transient-recovery-currentness.spec.ts. The page, local boundary, and
// `gh` are production; only GitHub's answers are supplied. Page time is paused.

import { recordsAt, setPageVisibility } from "./autoRefreshJourney.ts";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  expectProblemAndNoSnapshot,
  expectSettledPage,
  parts,
} from "./dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
} from "./doughnutProject.ts";
import { failedAt, limitSaid } from "./limitNotice.ts";
import { isContent, limiting } from "./limitedReadingJourney.ts";
import {
  filesBesideUnreachable,
  opened as limitedOpened,
  repository,
  revision,
  titlesBesideUnreachable,
  withheldSeed,
  withheldTitle,
} from "./limitedReadingRecords.ts";
import { untilPageReadsAnswered } from "./pageRequestNotes.ts";
import {
  httpErrorAnswer,
  pathsRead,
  publishMovingOrigin,
} from "./publishedOrigin.ts";
import {
  backlogA,
  inspectDashboardStory,
  revisionA,
  titlesOfA,
} from "./refreshJourney.ts";
import { publishes } from "./support/fakeGitHub.ts";
import {
  expectRecoversAfter,
  mainReads,
  transientRecovery,
} from "./transientRecoveryPage.ts";

const opened = new Date("2026-09-20T08:30:00.000Z");

test("a hidden page asks no recovery, retains its due time through hide/reveal, and recovers once when due", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA);
  const restore = origin.answerWith("main", httpErrorAnswer(503));
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
    undefined,
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  const failed = await failedAt(page);
  await expectRecoversAfter(page, failed, 15);
  expect(mainReads(origin)).toBe(1);

  await test.step("repeated hide/reveal before the due time does not reset the backoff step", async () => {
    await setPageVisibility(page, "hidden");
    await page.clock.runFor(5_000);
    await setPageVisibility(page, "visible");
    await setPageVisibility(page, "hidden");
    await setPageVisibility(page, "visible");
    expect(mainReads(origin)).toBe(1);
    await expectRecoversAfter(page, failed, 15);
  });

  await test.step("hidden across the due time, the page asks nothing and keeps the recovery notice", async () => {
    await setPageVisibility(page, "hidden");
    await page.clock.runFor(15_000);
    expect(mainReads(origin)).toBe(1);
    await expect(parts(page).problem).toContainText(transientRecovery);
    await expectRecoversAfter(page, failed, 15);
  });

  await test.step("seen again when due, one recovery is asked and heals without reload", async () => {
    restore();
    await setPageVisibility(page, "visible");
    await page.clock.runFor(1);
    await untilPageReadsAnswered(page);
    expect(mainReads(origin)).toBe(2);
    await inspectDashboardStory(page);
    await expectSettledPage(page, titlesOfA);
    await expect(parts(page).source).toContainText(revisionA);
    await expect(parts(page).problem).toHaveCount(0);
  });
});

test("two pages share a recovery read: one hides while the other finishes; the first recovers once when seen again", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA, recordsAt("A"));
  const restore = origin.answerWith("main", httpErrorAnswer(503));
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
    undefined,
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  const other = await page.context().newPage();
  await other.goto("/");
  await expectProblemAndNoSnapshot(
    other,
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
    undefined,
    transientRecovery,
  );
  await untilPageReadsAnswered(other);
  restore();
  const releaseMain = origin.hold("main");
  await page.clock.runFor(15_250);

  await test.step("both pages' recovery waits reach the held ref", async () => {
    await expect.poll(() => mainReads(origin)).toBeGreaterThanOrEqual(3);
  });

  await test.step("hiding one page leaves the other to finish the shared read", async () => {
    await setPageVisibility(page, "hidden");
    releaseMain();
    await expectSettledPage(other, titlesOfA);
    await expect(parts(other).problem).toHaveCount(0);
    await expect(parts(page).problem).toBeVisible();
  });

  await test.step("the hidden page recovers once when seen again", async () => {
    const before = mainReads(origin);
    await setPageVisibility(page, "visible");
    await page.clock.runFor(1);
    await untilPageReadsAnswered(page);
    await expectSettledPage(page, titlesOfA);
    await expect(parts(page).problem).toHaveCount(0);
    expect(mainReads(origin)).toBeGreaterThan(before);
  });
});

test("switching projects clears project-local recovery while a standing login limit remains", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await pausePageClockAt(page, limitedOpened);
  const published = publishes({
    revision,
    files: filesBesideUnreachable,
  });
  const answers = limiting(page, published, 2);
  githubFor(page).serve(repository, answers.answer);
  answers.limit(isContent(withheldSeed));
  await page.goto("/");
  await expectSettledPage(page, titlesBesideUnreachable);
  answers.lift();
  await expect(parts(page).problem).toContainText(limitSaid);
  const withheldCard = parts(page).backlog.getByRole("article", {
    name: withheldTitle,
  });
  await expect(withheldCard.locator(".card-preparation")).toContainText(
    "GitHub's rate limit withheld",
  );
  const doughnut = await publishMovingOrigin(page, doughnutRepository);
  doughnut.push(revisionDoughnut, doughnutBacklog, doughnutRecords);
  const beforeSwitch = githubFor(page).calls.length;

  await parts(page)
    .project.getByRole("radio", { name: "Doughnut", exact: true })
    .check();
  await expect(parts(page).problem).toContainText(limitSaid);
  await expect(
    parts(page).project.getByRole("radio", { name: "Doughnut", exact: true }),
  ).toBeChecked();
  // Login-wide limit: Doughnut is not asked of GitHub while it stands.
  expect(
    githubFor(page)
      .calls.slice(beforeSwitch)
      .filter(({ request }) => {
        if (request.kind === "unknown") return false;
        return request.repository === doughnutRepository;
      }),
  ).toEqual([]);
});

test("an ordinary transient failure does not hold back another project's reads", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const openDough = await publishMovingOrigin(page);
  openDough.push(revisionA, backlogA);
  openDough.answerWith("main", httpErrorAnswer(503));
  const doughnut = await publishMovingOrigin(page, doughnutRepository);
  doughnut.push(revisionDoughnut, doughnutBacklog, doughnutRecords);
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
    undefined,
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  expect(mainReads(openDough)).toBe(1);

  await parts(page)
    .project.getByRole("radio", { name: "Doughnut", exact: true })
    .check();
  await expectSettledPage(page, {
    taken: [],
    backlog: [doughnutSharedTitle],
  });
  await expect(parts(page).problem).toHaveCount(0);
  await expect(parts(page).source).toContainText(revisionDoughnut);
  expect(pathsRead(doughnut).some((path) => path === "main")).toBe(true);
});
