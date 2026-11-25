// Two tabs of one dashboard opening different projects never have more than
// eight reads under way at GitHub together (github-request-admission.mjs):
// while GitHub holds every record answer, eight reach it and the tabs' other
// reads wait their turn; once the answers come, both tabs settle on their
// projects' facts. The page, its local read boundary, and the `gh`
// invocation are the production ones. The bound itself, turn by turn:
// ../../dashboard/backend-tests/observation/authenticated-read-turns.spec.ts.

import type { Page, Request } from "@playwright/test";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectSettledPage,
  parts,
  shortRevision,
} from "../../dashboard/test-support/dashboardPage.ts";
import { doughnutRepository } from "../../dashboard/test-support/doughnutProject.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import { describedFiles } from "../../dashboard/test-support/describedRevisions.ts";
import {
  backlogPath,
  defaultRepository,
} from "../../dashboard/test-support/publishedOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { renderStorySection } from "../../Distribution/tests/support/published-seed.mjs";
import type { GhRequest } from "../../dashboard/test-support/support/ghRequest.ts";
import { heldInTurn } from "../../dashboard/test-support/support/heldGitHubAnswer.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { noteRequestsInEveryPage } from "../../dashboard/test-support/pageRequestNotes.ts";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";

// A project whose backlog names six stories, each in a seed of its own.
function project(name: string) {
  const titles = Array.from(
    Array(6).keys(),
    (index) => `${name} story ${String(index + 1)}`,
  );
  const seed = (index: number) =>
    `seeds/SEED-${String(900 + index)}-${name.toLowerCase()}.md`;
  const files: Record<string, string> = {
    ".planning/open-dough.json": "{}\n",
  };
  const queued = titles.map((title, index) =>
    makeMe.aBacklogEntry
      .with({
        identity: `SEED-${String(900 + index)}#story`,
        title,
        href: `${seed(index)}#story`,
      })
      .please(),
  );
  queued.forEach((entry, index) => {
    files[`.planning/${seed(index)}`] = `# ${name}

${renderStorySection(entry, {
  goal: `${entry.title} is read once its turn comes.`,
})}`;
  });
  return {
    published: publishes({
      files: describedFiles({ backlog: { queued }, files }),
    }),
    membership: { taken: [], backlog: titles },
  };
}

// Every record read is held; the ref and the backlog are answered, so each
// tab goes on to read its records together.
const isRecordRead = (request: GhRequest) =>
  request.kind === "content" && request.path !== backlogPath;

// How many reads the tabs have sent the local boundary and not yet had
// answered.
function boundaryReadsPending(tabs: readonly Page[]): () => number {
  let pending = 0;
  const isRead = (request: Request) =>
    new URL(request.url()).pathname === authenticatedReadEndpoint;
  for (const tab of tabs) {
    tab.on("request", (request) => {
      if (isRead(request)) pending += 1;
    });
    const ended = (request: Request) => {
      if (isRead(request)) pending -= 1;
    };
    tab.on("requestfinished", ended);
    tab.on("requestfailed", ended);
  }
  return () => pending;
}

// Tabs of one browser context share its six connections to the dashboard,
// so the second tab opens in a browser context of its own: together they can
// ask more than eight reads at once.
test("two tabs opening different projects while GitHub holds its answers never have more than eight reads there together, and both settle once answered", async ({
  page,
  browser,
  dashboard,
}) => {
  const at = new Date("2026-10-07T09:00:00.000Z");
  await pausePageClockAt(page, at);
  const github = githubFor(page);
  const openDough = project("Dough");
  const doughnut = project("Doughnut");
  const heldDough = heldInTurn(openDough.published, isRecordRead);
  const heldDoughnut = heldInTurn(doughnut.published, isRecordRead);
  github.serve(defaultRepository, heldDough.answer);
  github.serve(doughnutRepository, heldDoughnut.answer);
  const routedTrunk = (repository: string) =>
    remoteBranchHead(gitHubRepositoryUrl(repository), "refs/heads/main", {
      cwd: dashboard.home,
      env: { HOME: dashboard.home },
      maxBuffer: 4096,
    });
  expect(await routedTrunk(defaultRepository)).toBe(
    openDough.published.revision,
  );
  expect(await routedTrunk(doughnutRepository)).toBe(
    doughnut.published.revision,
  );
  const most = github.observeUnanswered();

  const otherContext = await browser.newContext({ baseURL: dashboard.baseURL });
  try {
    await noteRequestsInEveryPage(otherContext);
    const other = await otherContext.newPage();
    await pausePageClockAt(other, at);
    const pending = boundaryReadsPending([page, other]);
    await page.goto("/?project=open-dough");
    await other.goto("/?project=doughnut");

    // Eight reach GitHub, and the tabs still wait on more than that.
    await expect
      .poll(() => heldDough.held() + heldDoughnut.held(), { timeout: 10_000 })
      .toBe(8);
    await expect.poll(pending, { timeout: 10_000 }).toBeGreaterThan(8);
    expect(heldDough.held() + heldDoughnut.held()).toBe(8);
    expect(heldDough.held()).toBeGreaterThan(0);
    expect(heldDoughnut.held()).toBeGreaterThan(0);
    const pinnedReads = github.calls.flatMap(({ request }) =>
      request.kind === "content" && isRecordRead(request)
        ? [`${request.repository}@${request.revision}`]
        : [],
    );
    expect(new Set(pinnedReads)).toEqual(
      new Set([
        `${defaultRepository}@${openDough.published.revision}`,
        `${doughnutRepository}@${doughnut.published.revision}`,
      ]),
    );

    heldDough.releaseAll();
    heldDoughnut.releaseAll();
    await expectSettledPage(page, openDough.membership);
    await expectSettledPage(other, doughnut.membership);
    await expect(parts(page).readRevision).toContainText(
      shortRevision(openDough.published.revision),
    );
    await expect(parts(other).readRevision).toContainText(
      shortRevision(doughnut.published.revision),
    );
    expect(most()).toBe(8);
  } finally {
    await otherContext.close();
  }
});
