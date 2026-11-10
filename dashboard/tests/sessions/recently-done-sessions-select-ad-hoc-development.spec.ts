// Development reveal for an ad hoc association, including a Done story older
// than the Board's default 30-day window (../../src/recentlyDoneView.ts).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/preparationPage.ts";
import { parts } from "../dashboardPage.ts";
import { expectProjectChoice } from "../projectChoice.ts";
import { recentlyDoneParts } from "../recentlyDoneSessionsSidebarPage.ts";
import { openSessionsSidebar } from "../sessionsSidebarPage.ts";
import { retainAdHocCompletedStory } from "../support/adHocCompletedAssociation.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { pausePageClockAt } from "../dashboardTest.ts";
import { doneRecordFileName } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { commitAll, git } from "../support/storyReviewWorktree.ts";
import { push } from "../support/storyReviewTrunkCommits.ts";
import { publishIntentTrunk } from "../support/intentStoryWorktree.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const sessionTitle = "Older ad hoc completed session";
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
  await shown.entry(sessionTitle).click();
  await expectProjectChoice(page, "Open Dough");
  await expect(shown.entry(sessionTitle)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const card = parts(page).recentlyDone.getByRole("article", {
    name: linked.title,
    exact: true,
  });
  await expectSelected(card, true);
  await expect(card).toBeInViewport();
  await expect(shown.entry(sessionTitle)).toHaveAttribute(
    "title",
    /(^|\n)Open Dough · Ad hoc(\n|$)/,
  );
});
