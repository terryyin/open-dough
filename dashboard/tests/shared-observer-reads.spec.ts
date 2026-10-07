// Two tabs of one dashboard ask GitHub once for what they both need while it
// is outstanding: opening one project together resolves its ref once and
// reads each record once, and both show its facts; a tab that closes or
// switches project before an answer arrives leaves the other's read to
// finish; and revision checks from both tabs share one head listing, which
// still answers the tab left showing when the other is hidden. The fake
// GitHub holds answers until both tabs wait on them: each tab's request is
// seen sent, then each tab sends a marker the boundary refuses without
// asking GitHub, and the answer is released once the markers are answered.
// The page, its local read boundary, and the `gh` invocation are the
// production ones.

import type { Page, Request } from "@playwright/test";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectMembership, expectSettledPage, parts } from "./dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
} from "./doughnutProject.ts";
import { readsBesideChecks } from "./originObservation.ts";
import { isCheck } from "./pageRequestNotes.ts";
import { setPageVisibility } from "./autoRefreshJourney.ts";
import { publishes } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { holdingAnswer } from "./support/heldGitHubAnswer.ts";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

const repository = "terryyin/open-dough";
const revision = "7a".repeat(20);
const seedPath = ".planning/seeds/SEED-263-shared.md";
const title = "A story both tabs show";
const goal = "Both tabs show this goal, read from GitHub once.";
const titles = { taken: [], backlog: [title] };
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const files = {
  [backlogPath]: `# Product backlog

## Taken

## Backlog list

- [${title}](seeds/SEED-263-shared.md#shared) — SEED-263#shared
`,
  [seedPath]: `# Shared

<a id="shared"></a>

### ${title}

**Identity:** SEED-263#shared

**Goal:** ${goal}
`,
  ".planning/open-dough.json": "{}\n",
};

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

// Once each tab's request is seen sent, each tab asks the boundary for
// something it refuses without GitHub; once both are answered, both requests
// wait on GitHub's held answer.
async function waitingTogether(
  tabs: readonly Page[],
  sent: readonly Promise<Request>[],
): Promise<void> {
  await Promise.all(sent);
  for (const tab of tabs) {
    const status = await tab.evaluate(
      (url) => fetch(url).then((response) => response.status),
      `${authenticatedReadEndpoint}?source=open-dough&revision=main`,
    );
    expect(status).toBe(400);
  }
}

// What Open Dough's repository was asked, revision checks aside.
const askedOfOpenDough = (page: Page) =>
  readsBesideChecks(
    githubFor(page).calls.filter(
      ({ request }) =>
        "repository" in request && request.repository === repository,
    ),
  );

const card = (page: Page, name: string) =>
  parts(page).backlog.getByRole("article", { name });

async function expectGoalShown(page: Page) {
  await expectSettledPage(page, titles);
  await card(page, title)
    .getByRole("button", { name: "Inspect story" })
    .click();
  await expect(card(page, title)).toContainText(goal);
}

// Opens Open Dough in this page and a second tab of the same browser, with
// its ref and then its seed held until both tabs wait on each; the seed is
// left held.
async function openedTogether(page: Page) {
  await pausePageClockAt(page, new Date("2026-10-06T09:00:00.000Z"));
  const github = githubFor(page);
  const isSeed = (request: GhRequest) =>
    request.kind === "content" && request.path === seedPath;
  const seed = holdingAnswer(publishes({ revision, files }), isSeed);
  const ref = holdingAnswer(seed.answer, ({ kind }) => kind === "ref");
  github.serve(repository, ref.answer);
  github.serve(
    doughnutRepository,
    publishes({
      revision: revisionDoughnut,
      files: { [backlogPath]: doughnutBacklog, ...doughnutRecords },
    }),
  );
  const other = await page.context().newPage();
  const tabs = [page, other];
  const opened = tabs.map((tab) => tab.waitForRequest(isMembership));
  const seedRead = tabs.map((tab) => tab.waitForRequest(isSeedRead));
  await Promise.all(tabs.map((tab) => tab.goto("/")));
  await waitingTogether(tabs, opened);
  ref.release();
  await waitingTogether(tabs, seedRead);
  // While the seed is held, its read and every earlier one reached GitHub
  // once.
  const seedAsked = `content ${seedPath}@${revision}`;
  await expect
    .poll(() => askedOfOpenDough(page).includes(seedAsked))
    .toBe(true);
  const whileHeld = askedOfOpenDough(page);
  expect(whileHeld).toEqual([...new Set(whileHeld)]);
  expect(whileHeld.slice(0, 2)).toEqual([
    "ref main",
    `content ${backlogPath}@${revision}`,
  ]);
  return { other, releaseSeed: seed.release };
}

const askedOnce = (page: Page) => {
  const asked = askedOfOpenDough(page);
  expect(asked).toEqual([...new Set(asked)]);
  expect(asked.filter((read) => read === "ref main")).toHaveLength(1);
  expect(asked).toContain(`content ${seedPath}@${revision}`);
};

test("two tabs opening one project resolve its ref once and read each record once, and both show its facts", async ({
  page,
}) => {
  const { other, releaseSeed } = await openedTogether(page);
  releaseSeed();
  await expectSettledPage(page, titles);
  await expectSettledPage(other, titles);
  askedOnce(page);
  await expectGoalShown(page);
  await expectGoalShown(other);
});

test("a tab closed before the seed is answered leaves the other tab's read to finish", async ({
  page,
}) => {
  const { other, releaseSeed } = await openedTogether(page);
  await other.close();
  releaseSeed();
  await expectSettledPage(page, titles);
  askedOnce(page);
  await expectGoalShown(page);
  await expect(parts(page).problem).toHaveCount(0);
});

test("a tab switched to another project before the seed is answered leaves the other tab's read to finish", async ({
  page,
}) => {
  const { other, releaseSeed } = await openedTogether(page);
  await parts(other)
    .project.getByRole("radio", { name: "Doughnut", exact: true })
    .check();
  await expectMembership(other, { taken: [], backlog: [doughnutSharedTitle] });
  releaseSeed();
  await expectSettledPage(page, titles);
  askedOnce(page);
  await expectGoalShown(page);
  await expect(parts(page).problem).toHaveCount(0);
  await expectMembership(other, { taken: [], backlog: [doughnutSharedTitle] });
});

test("revision checks from two tabs share one head listing, which still answers the tab left showing when the other is hidden", async ({
  page,
}) => {
  const { other, releaseSeed } = await openedTogether(page);
  releaseSeed();
  await expectSettledPage(page, titles);
  await expectSettledPage(other, titles);
  const github = githubFor(page);
  const listing = holdingAnswer(
    publishes({ revision, files }),
    ({ kind }) => kind === "matching-refs",
  );
  github.serve(repository, listing.answer);
  const before = github.calls.length;
  const tabs = [page, other];
  let seen = 0;
  const checks = tabs.map((tab) =>
    tab
      .waitForRequest((request) => isCheck(request.url()))
      .then((sent) => {
        seen += 1;
        return sent;
      }),
  );
  for (let passed = 0; seen < tabs.length && passed <= 60_000; passed += 250) {
    await page.clock.runFor(250);
  }
  await waitingTogether(tabs, checks);
  const answered = page.waitForResponse((response) => isCheck(response.url()));
  await setPageVisibility(other, "hidden");
  listing.release();
  expect((await answered).status()).toBe(200);
  // Answered from that one listing, not from asking the ref alone.
  expect(github.calls.slice(before).map(({ request }) => request.kind)).toEqual(
    ["matching-refs"],
  );
  await expectSettledPage(page, titles);
  await expect(parts(page).problem).toHaveCount(0);
});
