// Line-number menu on a Done story's DiffLines: copy leaves numbers out,
// pointer/keyboard/touch open the menu, Escape and outside click return
// focus, Tab does not stop on each line, revealed context lines work the
// same, and Follow up opens the existing dialog with the line and side.
// Intent blank start on old line 85: ../../../e2e/intent/intent-story-follow-up.spec.ts.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  copyDiffLine,
  expectLineMenuOpen,
  expectNoLineNumberTabStops,
  followUpFromLine,
  lineNumberControl,
  openLineMenu,
} from "../support/diffLineFollowUpPage.ts";
import { completedPublishedStory } from "../support/completedPublishedStory.ts";
import { contextExpansion } from "../support/expandContextDiff.ts";
import { expect, test } from "../support/preparationPage.ts";
import { codePane, diffLines } from "../support/reviewPanes.ts";
import { readReview } from "../support/launchLandingReview.ts";
import { fileDiff, listedFile } from "../support/reviewTreeRows.ts";
import { queuedIdentity } from "../support/startOrigin.ts";
import {
  commitAll,
  expandContextFile,
  expandContextLines,
  git,
} from "../support/storyReviewWorktree.ts";
import { showColumn } from "../boardPage.ts";
import { parts } from "../dashboardPage.ts";
import { reviewRegion } from "../support/storyReviewMark.ts";
import type { Page } from "@playwright/test";
import type { StartOrigin } from "../support/startOrigin.ts";

const storyName = `${queuedIdentity} — Story A`;
const fileLabel = `Modified ${expandContextFile}`;

test.describe("diff line Follow up menu", () => {
  test.use({
    hasTouch: true,
    permissions: ["clipboard-read", "clipboard-write"],
  });

  async function openLineFollowDiff(page: Page, origin: StartOrigin) {
    writeFileSync(
      path.join(origin.project, expandContextFile),
      expandContextLines("line", 160),
    );
    commitAll(origin.project, "expand context trunk");
    git(origin.project, "push", "--quiet", "origin", "main");
    const { completion } = await completedPublishedStory(
      origin,
      "trunk",
      undefined,
      (storyWorkspace) => {
        const edited = expandContextLines("line", 160)
          .replace("line 54\n", "changed fifty-four\n")
          .replace("line 127\n", "changed one-twenty-seven\n");
        writeFileSync(path.join(storyWorkspace, expandContextFile), edited);
      },
    );
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: completion,
      repository: "terryyin/open-dough",
    });
    await page.goto("/");
    await showColumn(page, "Recently done");
    const card = parts(page).recentlyDone.getByRole("article", {
      name: "Story A",
      exact: true,
    });
    const first = await readReview(page, card);
    expect(first.kind).toBe("published");
    const review = reviewRegion(page);
    await listedFile(review, fileLabel, { exact: true }).click();
    const diff = fileDiff(review, fileLabel, { exact: true });
    await expect(diffLines(diff).first()).toBeVisible();
    return { review, diff };
  }

  test("selecting a diff line copies code without line numbers", async ({
    page,
    origin,
  }) => {
    const { diff } = await openLineFollowDiff(page, origin);
    const removed = diffLines(diff, { hasText: "-line 54" });
    await expect(removed).toBeVisible();
    const copied = await copyDiffLine(page, removed);
    // Marker and code only — no old/new number column before the text.
    expect(copied).toBe("-line 54");
    expect(copied).not.toMatch(/^\d/);
    expect(copied).not.toMatch(/\d+\s+\d+\s*-/);
  });

  test("line numbers open a Follow up menu by pointer, keyboard, touch, Escape, outside click, and revealed context", async ({
    page,
    origin,
  }) => {
    const { diff } = await openLineFollowDiff(page, origin);
    const oldFiftyFour = lineNumberControl(diff, "old", 54);
    const newFiftyFour = lineNumberControl(diff, "new", 54);

    await test.step("pointer opens the menu naming the line with only Follow up", async () => {
      await openLineMenu(oldFiftyFour, "pointer");
      const menu = await expectLineMenuOpen(page, "Old line 54");
      await expect(menu.getByRole("menuitem")).toHaveCount(1);
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
      await expect(oldFiftyFour).toBeFocused();
    });

    await test.step("keyboard opens the menu; Escape returns focus", async () => {
      await openLineMenu(newFiftyFour, "keyboard");
      const menu = await expectLineMenuOpen(page, "New line 54");
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
      await expect(newFiftyFour).toBeFocused();
    });

    await test.step("outside click closes the menu and returns focus", async () => {
      await openLineMenu(oldFiftyFour, "pointer");
      const menu = await expectLineMenuOpen(page, "Old line 54");
      await codePane(diff).click({ position: { x: 8, y: 8 } });
      await expect(menu).toHaveCount(0);
      await expect(oldFiftyFour).toBeFocused();
    });

    await test.step("no added Tab stop per line number", async () => {
      await expectNoLineNumberTabStops(diff);
    });

    await test.step("touch opens the menu on a phone-sized viewport", async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openLineMenu(oldFiftyFour, "touch");
      const menu = await expectLineMenuOpen(page, "Old line 54");
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
      await expect(oldFiftyFour).toBeFocused();
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    await test.step("revealed context lines open the same menu", async () => {
      const beforeGap = diff.getByRole("list", {
        name: "Omitted lines before the next change",
      });
      await contextExpansion(beforeGap, /Show 20 preceding/).click();
      const revealed = lineNumberControl(beforeGap, "old", 40);
      await openLineMenu(revealed, "pointer");
      const menu = await expectLineMenuOpen(page, "Old line 40");
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
      await expect(revealed).toBeFocused();
    });

    await test.step("Follow up opens the dialog with the line and side", async () => {
      const dialog = await followUpFromLine(page, diff, "old", 54, storyName, [
        `Path: ${expandContextFile}`,
        /Comparison: Published completion [a-f0-9]{40} → [a-f0-9]{40}/,
        "Line: 54",
        "Side: old",
      ]);
      await dialog.getByRole("button", { name: "Cancel" }).click();
      await expect(dialog).toBeHidden();
    });
  });
});
