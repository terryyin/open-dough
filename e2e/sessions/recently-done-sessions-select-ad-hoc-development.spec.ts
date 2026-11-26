// Development reveal for an ad hoc session, including a Done story older
// than the Board's default 30-day window (../../dashboard/src/recentlyDoneView.ts).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { expectProjectChoice } from "../../dashboard/test-support/projectChoice.ts";
import { recentlyDoneParts } from "../../dashboard/test-support/recentlyDoneSessionsSidebarPage.ts";
import { openSessionsSidebar } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import { retainAdHocCompletedStory } from "../../dashboard/test-support/support/adHocCompletedStory.ts";
import { expectSelected } from "../../dashboard/test-support/storyCardSelection.ts";
import { pausePageClockAt } from "../../dashboard/test-support/dashboardTest.ts";
import { doneRecordFileName } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import {
  commitAll,
  git,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { push } from "../../dashboard/test-support/support/storyReviewTrunkCommits.ts";
import { publishIntentTrunk } from "../../dashboard/test-support/support/intentStoryWorktree.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const sessionTitle = "Older ad hoc completed session";
const executionTitle = "Older execution session";
const day = 24 * 60 * 60_000;

test("selecting an ad hoc session whose Done story is beyond the Board window reveals its card in Development", async ({
  page,
  dashboard,
  origin,
}) => {
  // Real claim/completion publish plus Board reveal beyond the default window.
  test.setTimeout(90_000);
  publishIntentTrunk(origin.project);
  const now = Date.now();
  await pausePageClockAt(page, new Date(now));
  const linked = await retainAdHocCompletedStory(dashboard, origin, {
    title: sessionTitle,
  });
  const execution = makeMe.aLaunchRecord
    .executing({ identity: linked.identity, title: executionTitle })
    .launchedAt(new Date(now - 120_000).toISOString())
    .markedDoneAt(new Date(now - 60_000).toISOString())
    .please();
  keepLaunchRecords(dashboard, [linked.record, execution]);
  // Backdate the published Done record past the Board window; the retained
  // session stays within launch retention.
  const file = path.join(
    origin.project,
    ".planning",
    "done",
    doneRecordFileName(linked.identity),
  );
  const record = JSON.parse(readFileSync(file, "utf8")) as {
    completedAt: string;
  };
  record.completedAt = new Date(now - 40 * day).toISOString();
  writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);
  const catalogScript = path.join(
    origin.project,
    ".agents/skills/dough-product-backlog/scripts/product-backlog.mjs",
  );
  git(origin.project, "add", "-A");
  // Rebuild catalog from the backdated record.
  const { execFileSync } = await import("node:child_process");
  execFileSync(
    process.execPath,
    [catalogScript, "catalog-done", "--file", ".planning/PRODUCT-BACKLOG.md"],
    { cwd: origin.project, stdio: "pipe" },
  );
  commitAll(
    origin.project,
    "backdate completed story outside the Board window",
  );
  push(origin.project);
  const published = git(origin.origin, "rev-parse", "main");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
  });

  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/");
  await openSessionsSidebar(page);
  const shown = recentlyDoneParts(page);
  await shown.header.click();
  const card = parts(page).recentlyDone.getByRole("article", {
    name: linked.title,
    exact: true,
  });
  await expect(shown.reviewCue(sessionTitle)).toBeVisible();
  await expect(shown.reviewCue(executionTitle)).toHaveCount(0);
  await shown.select(executionTitle).click();
  await expect(shown.select(executionTitle)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(card).toHaveCount(0);
  await shown.select(sessionTitle).click();
  await expectProjectChoice(page, "Open Dough");
  await expect(shown.select(sessionTitle)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expectSelected(card, true);
  await expect(card).toBeInViewport();
  await expect(shown.select(sessionTitle)).toHaveAttribute(
    "title",
    /(^|\n)Open Dough · Ad hoc(\n|$)/,
  );
});
