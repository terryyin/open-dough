// Two tabs of one dashboard opening different projects never have more than
// eight reads under way at GitHub together (../server/readAdmission.ts):
// while GitHub holds every record answer, eight reach it and the tabs' other
// reads wait their turn; once the answers come, both tabs settle on their
// projects' facts. The page, its local read boundary, and the `gh`
// invocation are the production ones. The bound itself, turn by turn:
// ./authenticated-read-turns.spec.ts.

import type { Page, Request } from "@playwright/test";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectSettledPage } from "./dashboardPage.ts";
import { doughnutRepository } from "./doughnutProject.ts";
import { publishes } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { heldInTurn } from "./support/heldGitHubAnswer.ts";
import { noteRequestsInEveryPage } from "./pageRequestNotes.ts";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

const backlogPath = ".planning/PRODUCT-BACKLOG.md";

// A project whose backlog names six stories, each in a seed of its own.
function project(name: string, revision: string) {
  const titles = Array.from(
    Array(6).keys(),
    (index) => `${name} story ${String(index + 1)}`,
  );
  const seed = (index: number) =>
    `seeds/SEED-${String(900 + index)}-${name.toLowerCase()}.md`;
  const files: Record<string, string> = {
    [backlogPath]: `# Product backlog

## Taken

## Backlog list

${titles
  .map(
    (title, index) =>
      `- [${title}](${seed(index)}#story) — SEED-${String(900 + index)}#story`,
  )
  .join("\n")}
`,
    ".planning/open-dough.json": "{}\n",
  };
  titles.forEach((title, index) => {
    files[`.planning/${seed(index)}`] = `# ${name}

<a id="story"></a>

### ${title}

**Identity:** SEED-${String(900 + index)}#story

**Goal:** ${title} is read once its turn comes.
`;
  });
  return {
    published: publishes({ revision, files }),
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
  const openDough = project("Dough", "9a".repeat(20));
  const doughnut = project("Doughnut", "9b".repeat(20));
  const heldDough = heldInTurn(openDough.published, isRecordRead);
  const heldDoughnut = heldInTurn(doughnut.published, isRecordRead);
  github.serve("terryyin/open-dough", heldDough.answer);
  github.serve(doughnutRepository, heldDoughnut.answer);
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

    heldDough.releaseAll();
    heldDoughnut.releaseAll();
    await expectSettledPage(page, openDough.membership);
    await expectSettledPage(other, doughnut.membership);
    expect(most()).toBe(8);
  } finally {
    await otherContext.close();
  }
});
