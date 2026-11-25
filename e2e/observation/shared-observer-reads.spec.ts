import type { Page, Request } from "@playwright/test";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import {
  expectMembership,
  expectSettledPage,
  parts,
  shortRevision,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  doughnutSharedTitle,
} from "../../dashboard/test-support/doughnutProject.ts";
import { readsBesideChecks } from "../../dashboard/test-support/originObservation.ts";
import {
  isCheck,
  passCheckPace,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { setPageVisibility } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import {
  backlogPath,
  defaultRepository as repository,
} from "../../dashboard/test-support/publishedOrigin.ts";
import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { renderStorySection } from "../../Distribution/tests/support/published-seed.mjs";
import { holdingAnswer } from "../../dashboard/test-support/support/heldGitHubAnswer.ts";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";

const seedPath = ".planning/seeds/SEED-263-shared.md";
const title = "A story both tabs show";
const goal = "Both tabs show this goal, read from GitHub once.";
const titles = { taken: [], backlog: [title] };
const story = makeMe.aBacklogEntry
  .with({
    identity: "SEED-263#shared",
    title,
    href: "seeds/SEED-263-shared.md#shared",
  })
  .please();
const history = makeMe.aRepository
  .withRevision("A", {
    backlog: { queued: [story] },
    files: {
      [seedPath]: `# Shared

${renderStorySection(story, { goal })}`,
      ".planning/open-dough.json": "{}\n",
    },
  })
  .withRevision("B", {
    files: { "product.txt": "Updated during a shared check\n" },
  })
  .please();

const readOf =
  (picked: (params: URLSearchParams) => boolean) => (request: Request) => {
    const url = new URL(request.url());
    return (
      url.pathname === authenticatedReadEndpoint && picked(url.searchParams)
    );
  };
const isMembership = readOf(
  (params) => params.get("source") === "open-dough" && params.size === 1,
);
const isSeedRead = readOf(
  (params) => params.get("path") === seedPath && !params.has("committed"),
);

// A rejected marker after each read confirms both tabs wait at the boundary.
async function waitingTogether(tabs: Page[], sent: Promise<Request>[]) {
  await Promise.all(sent);
  for (const tab of tabs) {
    const status = await tab.evaluate(
      (url) => fetch(url).then((response) => response.status),
      `${authenticatedReadEndpoint}?source=open-dough&revision=main`,
    );
    expect(status).toBe(400);
  }
}

const askedOfOpenDough = (page: Page) =>
  readsBesideChecks(
    githubFor(page).calls.filter(
      ({ request }) =>
        "repository" in request && request.repository === repository,
    ),
  );

async function expectGoalShown(page: Page) {
  await expectSettledPage(page, titles);
  const card = parts(page).backlog.getByRole("article", { name: title });
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expect(card).toContainText(goal);
}

async function openedTogether(
  page: Page,
  afterGitHubStops: (cleanup: () => Promise<void>) => void,
  holdListing = false,
) {
  await pausePageClockAt(page, new Date("2026-10-06T09:00:00.000Z"));
  let releaseListing: () => void = () => undefined;
  const origin = await publishMovingHistory(
    page,
    history,
    "A",
    afterGitHubStops,
    repository,
    (answer) => {
      const listing = holdingAnswer(
        answer,
        ({ kind }) => holdListing && kind === "matching-refs",
      );
      releaseListing = listing.release;
      return listing.answer;
    },
  );
  const releaseRef = origin.hold("main");
  const releaseSeed = origin.hold(seedPath);
  githubFor(page).serve(
    doughnutRepository,
    publishes({ backlog: doughnutBacklog, files: doughnutRecords }),
  );
  const other = await page.context().newPage();
  const tabs = [page, other];
  const opened = tabs.map((tab) => tab.waitForRequest(isMembership));
  const seedRead = tabs.map((tab) => tab.waitForRequest(isSeedRead));
  await Promise.all(tabs.map((tab) => tab.goto("/")));
  await waitingTogether(tabs, opened);
  releaseRef();
  await waitingTogether(tabs, seedRead);
  const seedAsked = `content ${seedPath}@${origin.revisions.A}`;
  await expect
    .poll(() => askedOfOpenDough(page).includes(seedAsked))
    .toBe(true);
  const whileHeld = askedOfOpenDough(page);
  expect(whileHeld).toEqual([...new Set(whileHeld)]);
  expect(whileHeld.slice(0, 2)).toEqual([
    "ref main",
    `content ${backlogPath}@${origin.revisions.A}`,
  ]);
  return { other, origin, releaseSeed, releaseListing };
}

const askedOnce = (page: Page, revision: string) => {
  const asked = askedOfOpenDough(page);
  expect(asked).toEqual([...new Set(asked)]);
  expect(asked.filter((read) => read === "ref main")).toHaveLength(1);
  expect(asked).toContain(`content ${seedPath}@${revision}`);
};

test("two tabs opening one project resolve its ref once and read each record once, and both show its facts", async ({
  page,
  afterGitHubStops,
}) => {
  const opened = await openedTogether(page, afterGitHubStops);
  const { other, origin, releaseSeed } = opened;
  releaseSeed();
  await expectGoalShown(page);
  await expectGoalShown(other);
  askedOnce(page, origin.revisions.A);
});

test("a tab closed before the seed is answered leaves the other tab's read to finish", async ({
  page,
  afterGitHubStops,
}) => {
  const opened = await openedTogether(page, afterGitHubStops);
  const { other, origin, releaseSeed } = opened;
  await other.close();
  releaseSeed();
  await expectGoalShown(page);
  askedOnce(page, origin.revisions.A);
  await expect(parts(page).problem).toHaveCount(0);
});

test("a tab switched to another project before the seed is answered leaves the other tab's read to finish", async ({
  page,
  afterGitHubStops,
}) => {
  const opened = await openedTogether(page, afterGitHubStops);
  const { other, origin, releaseSeed } = opened;
  await projectTab(other, "Doughnut").check();
  await expectMembership(other, { taken: [], backlog: [doughnutSharedTitle] });
  releaseSeed();
  await expectGoalShown(page);
  askedOnce(page, origin.revisions.A);
  await expect(parts(page).problem).toHaveCount(0);
  await expectMembership(other, { taken: [], backlog: [doughnutSharedTitle] });
});

test("revision checks from two tabs share one head listing, which still answers the tab left showing when the other is hidden", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const opened = await openedTogether(page, afterGitHubStops, true);
  const { other, origin, releaseSeed, releaseListing } = opened;
  const { A, B } = origin.revisions;
  const routedTrunk = () =>
    remoteBranchHead(gitHubRepositoryUrl(repository), "refs/heads/main", {
      cwd: dashboard.home,
      env: { HOME: dashboard.home },
      maxBuffer: 4096,
    });
  expect(await routedTrunk()).toBe(A);
  releaseSeed();
  await expectSettledPage(page, titles);
  await expectSettledPage(other, titles);
  const github = githubFor(page);
  const before = github.calls.length;
  const tabs = [page, other];
  const checks = tabs.map((tab) =>
    tab.waitForRequest((request) => isCheck(request.url())),
  );
  await passCheckPace(page);
  await waitingTogether(tabs, checks);
  const checksAsked = () =>
    github.calls.slice(before).map(({ request }) => request.kind);
  await expect.poll(checksAsked).toEqual(["matching-refs"]);
  origin.advanceTo("B");
  expect(await routedTrunk()).toBe(B);
  const answered = page.waitForResponse((response) => isCheck(response.url()));
  await setPageVisibility(other, "hidden");
  releaseListing();
  const response = await answered;
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ changed: true, revision: B });
  await expectSettledPage(page, titles);
  expect(
    checksAsked().filter((kind) => kind === "matching-refs" || kind === "ref"),
  ).toEqual(["matching-refs"]);
  expect(askedOfOpenDough(page)).toContain(`content ${backlogPath}@${B}`);
  await expect(parts(page).readRevision).toContainText(shortRevision(B));
  await expect(parts(page).problem).toHaveCount(0);
});
