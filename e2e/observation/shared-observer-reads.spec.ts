import type { Page } from "@playwright/test";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import {
  expect,
  githubFor,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import {
  expectMembership,
  expectSettledPage,
  parts,
  shortRevision,
} from "../../dashboard/test-support/dashboardPage.ts";
import { doughnutSharedTitle } from "../../dashboard/test-support/doughnutProject.ts";
import { restMembershipReads } from "../../dashboard/test-support/originObservation.ts";
import {
  isCheck,
  passCheckPace,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { setPageVisibility } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import {
  backlogPath,
  defaultRepository as repository,
} from "../../dashboard/test-support/publishedOrigin.ts";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";
import {
  askedOfOpenDough,
  expectGoalShown,
  openedTogether,
  seedPath,
  titles,
} from "./sharedObserverOpen.ts";

// A rejected marker after each read confirms both tabs wait at the boundary.
async function waitingTogether(tabs: Page[], sent: Promise<unknown>[]) {
  await Promise.all(sent);
  for (const tab of tabs) {
    const status = await tab.evaluate(
      (url) => fetch(url).then((response) => response.status),
      `${authenticatedReadEndpoint}?source=open-dough&revision=main`,
    );
    expect(status).toBe(400);
  }
}

// The seed read is recorded as the goal appears. Poll until that call is listed.
async function askedOnce(page: Page, revision: string) {
  const seedRead = `content ${seedPath}@${revision}`;
  await expect.poll(() => askedOfOpenDough(page)).toContain(seedRead);
  const asked = askedOfOpenDough(page);
  expect(asked).toEqual([...new Set(asked)]);
  expect(restMembershipReads(asked)).toEqual([]);
}

async function showsProbedCommit(page: Page, revision: string) {
  await expect(parts(page).readRevision).toContainText(shortRevision(revision));
}

test("two tabs opening one project resolve its ref once and read each record once, and both show its facts", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const opened = await openedTogether(page, dashboard.home, afterGitHubStops);
  const { other, origin, releaseSeed, releaseGit, releaseGitIfHeld } = opened;
  try {
    await releaseGit();
    releaseSeed();
    await expectGoalShown(page);
    await expectGoalShown(other);
    await showsProbedCommit(page, origin.revisions.A);
    await showsProbedCommit(other, origin.revisions.A);
    await askedOnce(page, origin.revisions.A);
  } finally {
    await releaseGitIfHeld();
    releaseSeed();
  }
});

test("a tab closed before the seed is answered leaves the other tab's read to finish", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const opened = await openedTogether(page, dashboard.home, afterGitHubStops);
  const { other, origin, releaseSeed, releaseGit, releaseGitIfHeld } = opened;
  try {
    await other.close();
    await releaseGit();
    releaseSeed();
    await expectGoalShown(page);
    await showsProbedCommit(page, origin.revisions.A);
    await askedOnce(page, origin.revisions.A);
    await expect(parts(page).problem).toHaveCount(0);
  } finally {
    await releaseGitIfHeld();
    releaseSeed();
  }
});

test("a tab switched to another project before the seed is answered leaves the other tab's read to finish", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const opened = await openedTogether(page, dashboard.home, afterGitHubStops);
  const { other, origin, releaseSeed, releaseGit, releaseGitIfHeld } = opened;
  try {
    await projectTab(other, "Doughnut").check();
    await releaseGit();
    await expectMembership(other, {
      taken: [],
      backlog: [doughnutSharedTitle],
    });
    releaseSeed();
    await expectGoalShown(page);
    await showsProbedCommit(page, origin.revisions.A);
    await askedOnce(page, origin.revisions.A);
    await expect(parts(page).problem).toHaveCount(0);
    await expectMembership(other, {
      taken: [],
      backlog: [doughnutSharedTitle],
    });
  } finally {
    await releaseGitIfHeld();
    releaseSeed();
  }
});

test("revision checks from two tabs share one head listing, which still answers the tab left showing when the other is hidden", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const opened = await openedTogether(
    page,
    dashboard.home,
    afterGitHubStops,
    true,
  );
  const { other, origin, releaseSeed, releaseListing, releaseGit } = opened;
  await releaseGit();
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
