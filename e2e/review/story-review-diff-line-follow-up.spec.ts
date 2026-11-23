// Line-number menu on a Done story's DiffLines: copy leaves numbers out,
// pointer/keyboard/touch open the menu, Escape and outside click return
// focus, Tab does not stop on each line, revealed context lines work the
// same, and Follow up opens the existing dialog with the line and side.
// Intent blank start on old line 85: ../../../e2e/intent/intent-story-follow-up.spec.ts.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { attachStoryNotes } from "../../dashboard/test-support/support/attachStoryNotesPage.ts";
import {
  copyDiffLine,
  expectLineMenuOpen,
  expectNoLineNumberTabStops,
  followUpFromLine,
  lineNumberControl,
  openLineMenu,
} from "../../dashboard/test-support/support/diffLineFollowUpPage.ts";
import { expandContextLineFollowUpHistory } from "../../dashboard/test-support/support/completedFollowUpHistory.ts";
import { contextExpansion } from "../../dashboard/test-support/support/expandContextDiff.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  codePane,
  diffLines,
  expectContextRead,
} from "../../dashboard/test-support/support/reviewPanes.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import { expandContextFile } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { seedStoryNotes } from "../../dashboard/test-support/support/storyNotesStore.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import type { Page } from "@playwright/test";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";

const storyName = `${queuedIdentity} — Story A`;
const fileLabel = `Modified ${expandContextFile}`;

test.describe("diff line Follow up menu", () => {
  test.use({
    hasTouch: true,
    permissions: ["clipboard-read", "clipboard-write"],
    originRepository: expandContextLineFollowUpHistory(),
  });

  async function openLineFollowDiff(page: Page, origin: StartOrigin) {
    const completion = origin.revision("completion");
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
    const review = await openIntentReviewChanges(page, card);
    expect(review.answer.kind).toBe("published");
    await review.files.choose(fileLabel);
    const diff = review.diffs.toRead(fileLabel);
    await expect(diffLines(diff).first()).toBeVisible();
    // Line numbers hold still only once the gap rows above them have arrived.
    await expectContextRead(codePane(diff));
    return { diff };
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
    dashboard,
    origin,
  }) => {
    const waiting = makeMe.aStoryNote
      .withText("Follow up the changed line")
      .please();
    seedStoryNotes(dashboard.home, { [queuedIdentity]: [waiting] });
    const { diff } = await openLineFollowDiff(page, origin);
    const oldFiftyFour = lineNumberControl(diff, "old", 54);
    const newFiftyFour = lineNumberControl(diff, "new", 54);

    await test.step("pointer opens the menu naming the line with Follow up and Add note", async () => {
      await openLineMenu(oldFiftyFour, "pointer");
      const menu = await expectLineMenuOpen(page, "Old line 54");
      await expect(menu.getByRole("menuitem")).toHaveCount(2);
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

    const dialog =
      await test.step("Follow up opens the dialog with the line and side", () =>
        followUpFromLine(page, diff, "old", 54, storyName, [
          `Path: ${expandContextFile}`,
          /Comparison: Published completion [a-f0-9]{40} → [a-f0-9]{40}/,
          "Line: 54",
          "Side: old",
        ]));

    await test.step("the line follow-up offers the waiting story note", async () => {
      await attachStoryNotes(dialog).expectChecked(1, 1);
    });

    await test.step("Cancel closes the line follow-up dialog", async () => {
      await dialog.getByRole("button", { name: "Cancel" }).click();
      await expect(dialog).toBeHidden();
    });
  });
});
