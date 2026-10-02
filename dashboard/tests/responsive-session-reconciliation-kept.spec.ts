// A reconciled start stays reconciled on this machine
// (../src/startupReconciliation.ts): once a page found a settled Take
// reconciled with published state, its attempt keeps that, so a story
// another writer then removes leaves no Startup recovery item after a
// reload, a server restart on the same machine, or on a second page. A Take
// no page reconciled before its story was removed reconciles on the next
// page once GitHub confirms the shown revision contains it.

import { attempts } from "./agentLaunchBoundary.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import {
  recoveryOf,
  removeQueuedStory,
  restart,
  startExecution,
} from "./responsiveRecovery.ts";
import { openStories, test } from "./responsiveStart.ts";
import type { Locator, Page } from "@playwright/test";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

// The page shows the revision read, with Story A gone, Story B's actions
// available once this machine's attempts are read, and no Startup recovery.
async function expectRemovedSettled(page: Page, revision: string) {
  const { stages, backlog } = parts(page);
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${revision.slice(0, 7)}`,
  );
  await expect(stages.getByRole("article", { name: "Story A" })).toHaveCount(0);
  const other = backlog.getByRole("article", { name: "Story B" });
  await expect(other.getByRole("button", { disabled: true })).toHaveCount(0);
  await expect(recoveryOf(page)).toHaveCount(0);
}

// The Taken card shows its session with every action available.
async function expectTakenSettled(takenStory: Locator) {
  await expect(cardSessions(takenStory)).toHaveCount(1, { timeout: 60_000 });
  await expect(takenStory.getByRole("button", { disabled: true })).toHaveCount(
    0,
  );
}

test("a reconciled Take whose story is then removed leaves no recovery after a reload, a restart, or on a second page", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  test.setTimeout(150_000);
  const { published, story, takenStory } = await openStories(page, origin);
  await startExecution(page, story);
  await expectTakenSettled(takenStory);
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.reconciledAt, {
      timeout: 30_000,
    })
    .toBeDefined();
  const compares = [...published.compares];

  await removeQueuedStory(origin);
  const removal = (await origin.originGit("rev-parse", "main")).trim();
  await parts(page).refresh.click();
  await expectRemovedSettled(page, removal);
  await page.reload();
  await expectRemovedSettled(page, removal);

  const restarted = await restart(dashboard, origin, github);
  try {
    await page.reload();
    await expectRemovedSettled(page, removal);
    const second = await page.context().newPage();
    await second.goto("/");
    await expectRemovedSettled(second, removal);
    expect(await attempts(restarted)).toEqual([
      expect.objectContaining({
        outcome: expect.objectContaining({ kind: "launched" }),
        reconciledAt: expect.any(String),
      }),
    ]);
    expect(published.compares).toEqual(compares);
    expect(restarted.claudeLaunchCalls()).toHaveLength(1);
  } finally {
    await restarted.close();
  }
});

test("a Take no page reconciled before its story was removed reconciles on a new page with one comparison", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const push = origin.holdPushes();
  const { published, story } = await openStories(page, origin);
  await startExecution(page, story);
  await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
  const context = page.context();
  await page.close();
  push.release();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 60_000,
    })
    .toBe("launched");
  const [settled] = await attempts(dashboard);
  expect(settled?.reconciledAt).toBeUndefined();
  const accepted = (await origin.originGit("rev-parse", "main")).trim();
  expect(settled?.publication).toEqual({
    kind: "published",
    revision: accepted,
  });

  await removeQueuedStory(origin);
  const removal = (await origin.originGit("rev-parse", "main")).trim();
  const next = await context.newPage();
  await next.goto("/");
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.reconciledAt, {
      timeout: 30_000,
    })
    .toBeDefined();
  await expectRemovedSettled(next, removal);
  expect(published.compares).toEqual([`${accepted}...${removal}`]);
});
