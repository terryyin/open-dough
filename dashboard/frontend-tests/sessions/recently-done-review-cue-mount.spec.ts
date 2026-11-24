// Shown Recently done story rows expose their linked story's outstanding
// local review from their own project's review state and done catalog: equal
// identities stay apart by project, successful card changes reach every
// matching row, failed or pending evidence warns nothing until a later
// successful read, and an answer asked before a save cannot restore a cleared
// cue. Ad hoc rows' association evidence:
// ./recently-done-sessions-review-cue-{evidence,races}.spec.ts (SEED-426).
import { expect, onTestFinished, test, vi } from "vitest";
import { page } from "vitest/browser";
import { reviewCard } from "../stories/recently-done-review-state-mount-page.ts";
import {
  cueOf,
  cueSession,
  duplicateTitle,
  localSessionTitle,
  localTitle,
  openReviewCue,
} from "./recently-done-review-cue-mount-page.ts";
import {
  adHocTitle,
  linked,
  projectShown,
  takenTitle,
} from "./recently-done-selection-mount-page.ts";
import { pollNow } from "./recently-done-sidebar-mount-page.ts";

// Operates the Board's cards with the Sessions sidebar closed, then reopens it.
async function onTheBoard(act: () => Promise<void>) {
  const sessions = page.getByRole("button", { name: /^Sessions/ });
  await sessions.click();
  await act();
  await sessions.click();
}

function pollWithFakeTimers() {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
  });
  onTestFinished(() => {
    vi.useRealTimers();
  });
}

test("equal identities use their own project's review state; every shown matching row shares successful card changes while the Board stays put", async () => {
  const frame = openReviewCue();
  const shown = await frame.mount();
  const cue = (title: string) => () => cueOf(shown.row(title));
  await expect.poll(cue(linked.title)).toBe(true);
  await expect
    .element(shown.select(linked.title))
    .toHaveAccessibleDescription(
      /Needs review.*not been marked reviewed on this machine/,
    );
  await expect
    .element(shown.select(linked.title))
    .toHaveAttribute("aria-pressed", "false");
  expect(cueOf(shown.row(duplicateTitle))).toBe(true);
  for (const title of [localSessionTitle, adHocTitle, takenTitle]) {
    expect(cueOf(shown.row(title))).toBe(false);
    await expect
      .element(shown.select(title))
      .not.toHaveAccessibleDescription(/Reviewed|Needs review/);
  }
  expect(frame.pygardonCatalogReads()).toBe(1);
  await expect.element(projectShown()).toHaveAccessibleName("Open Dough");

  const card = reviewCard(localTitle);
  await onTheBoard(async () => {
    await card.reviewedButton.click();
    await card.confirm.click();
    await expect.element(card.markAsReviewed).toBeVisible();
  });
  await expect.poll(cue(localSessionTitle)).toBe(true);
  expect(cueOf(shown.row(linked.title))).toBe(true);
  await onTheBoard(async () => {
    await card.markAsReviewed.click();
    await expect.element(card.reviewedButton).toBeVisible();
  });
  await expect.poll(cue(localSessionTitle)).toBe(false);
  expect(cueOf(shown.row(linked.title))).toBe(true);
  expect(frame.reviewed("pygardon")).toEqual([]);
});

test("a newly revealed batch resolves the same published story without per-row catalog reads", async () => {
  const older = Array.from(Array(24).keys(), (index) =>
    cueSession(`Older review session ${String(index)}`, index + 100),
  );
  const frame = openReviewCue({ extra: older });
  const shown = await frame.mount();
  expect(shown.titles()).toHaveLength(20);
  expect(shown.row("Older review session 23")).toBeUndefined();
  await expect
    .poll(shown.titlesRevealingThrough(29))
    .toContain("Older review session 23");
  await expect
    .poll(() => cueOf(shown.row("Older review session 23")))
    .toBe(true);
  expect(frame.pygardonCatalogReads()).toBeLessThanOrEqual(2);
  await expect.element(projectShown()).toHaveAccessibleName("Open Dough");
});

for (const evidence of ["catalog", "review state"] as const) {
  test(`failed ${evidence} supplies no warning; a later successful read supplies it without selection`, async () => {
    pollWithFakeTimers();
    const frame = openReviewCue();
    const read =
      evidence === "catalog" ? frame.pygardonCatalog : frame.pygardonReview;
    read.fail();
    const shown = await frame.mount();
    await expect.element(shown.select(linked.title)).toBeEnabled();
    await expect.element(shown.open(linked.title)).toBeEnabled();
    expect(cueOf(shown.row(linked.title))).toBe(false);
    read.answer();
    await expect
      .poll(() => {
        pollNow();
        return cueOf(shown.row(linked.title));
      })
      .toBe(true);
    await expect
      .element(shown.select(linked.title))
      .toHaveAttribute("aria-pressed", "false");
    await expect.element(projectShown()).toHaveAccessibleName("Open Dough");
  });
}

test("pending catalog shows no initial warning, then resolves without selecting", async () => {
  const frame = openReviewCue();
  const held = frame.pygardonCatalog.hold();
  const shown = await frame.mount();
  await held.asked;
  expect(cueOf(shown.row(linked.title))).toBe(false);
  await expect.element(shown.select(linked.title)).toBeEnabled();
  held.release();
  await expect.poll(() => cueOf(shown.row(linked.title))).toBe(true);
  await expect
    .element(shown.select(linked.title))
    .toHaveAttribute("aria-pressed", "false");
  await expect.element(projectShown()).toHaveAccessibleName("Open Dough");
});

test("pending local review evidence stays unknown and its pre-save answer cannot restore a cleared cue", async () => {
  pollWithFakeTimers();
  const frame = openReviewCue();
  const first = frame.pygardonReview.hold();
  const shown = await frame.mount();
  await first.asked;
  expect(cueOf(shown.row(linked.title))).toBe(false);
  await expect.element(shown.select(linked.title)).toBeEnabled();
  first.release();
  await expect.poll(() => cueOf(shown.row(linked.title))).toBe(true);

  const stale = frame.pygardonReview.hold();
  await expect
    .poll(() => {
      pollNow();
      return stale.wasAsked();
    })
    .toBe(true);
  await page.getByRole("radio", { name: "Pygardon" }).click();
  const card = reviewCard(linked.title);
  await onTheBoard(async () => {
    await card.markAsReviewed.click();
    await expect.element(card.reviewedButton).toBeVisible();
  });
  await expect.poll(() => cueOf(shown.row(linked.title))).toBe(false);
  stale.release();
  await stale.asked;
  // Gives the stale answer its turns before reading what stands.
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await expect.element(card.reviewedButton).toBeVisible();
  expect(cueOf(shown.row(linked.title))).toBe(false);
  expect(cueOf(shown.row(duplicateTitle))).toBe(false);
});
