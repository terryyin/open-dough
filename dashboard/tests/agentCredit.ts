// What a Story card, its detail, or an agent roster member says about the
// agent holding or preparing a story and the human credited for it. The
// scenario supplies every expected agent, human, line and gap; these readers
// only find where the page shows them.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { loadedWidth } from "./agentPortrait.ts";

// The credit parts within `holder`: a card, a detail, a roster member, or one
// of their credit parts, such as a card's owner or scan line.
export function credit(holder: Locator) {
  return {
    // A Taken card's owner, or the gap that stands in its place.
    owner: holder.locator(".story-card-owner"),
    // A queued card's Preparing undertaking, its word, and its developers.
    preparing: holder.locator(".story-card-preparing"),
    activity: holder.locator(".preparing-activity"),
    agent: holder.locator(".owner-agent"),
    // The scan line: agent · human · host · model.
    line: holder.locator(".owner-line"),
    // The detail's and roster's summary: agent or mode · host · model.
    summary: holder.locator(".owner-summary"),
    host: holder.locator(".owner-host"),
    // The host's mark beside its label; none when the host is not recorded.
    hostMark: holder.locator(".owner-host img"),
    mode: holder.locator(".owner-mode"),
    marks: holder.locator(".owner-mark"),
    // "Human developer: …", or why that human is unknown.
    human: holder.locator(".owner-human"),
    humanName: holder.locator(".owner-human-name"),
    // An assignment the published records leave unknown or conflicting.
    gap: holder.locator(".assignment-gap"),
    avatar: holder.locator(".human-avatar"),
  };
}

// The credited human beside an agent: their avatar or initials, and name.
function humanCredit(holder: Locator) {
  const shown = holder.locator(".owner-human-credit");
  return {
    name: shown.locator(".owner-human"),
    image: shown.locator("img.human-avatar"),
    initials: shown.locator(".human-avatar-fallback"),
  };
}

// The human `name` is credited with their avatar, `width` pixels wide once
// loaded, read through the page's own origin for the shown `revision`.
export async function expectHumanAvatar(
  holder: Locator,
  name: string,
  { width, revision }: { readonly width: number; readonly revision: string },
) {
  const { name: named, image, initials } = humanCredit(holder);
  await expect(named).toHaveText(`Human developer: ${name}`);
  await expect(image).toBeVisible();
  await expect.poll(() => loadedWidth(image)).toBe(width);
  await expect(initials).toHaveCount(0);
  const src = new URL(
    await image.evaluate((element: HTMLImageElement) => element.currentSrc),
  );
  expect(src.origin).toBe(new URL(holder.page().url()).origin);
  expect(src.searchParams.get("revision")).toBe(revision);
}

// The human `name` is credited with the initials `shown` and no avatar.
export async function expectHumanInitials(
  holder: Locator,
  name: string,
  shown: string,
) {
  const { name: named, image, initials } = humanCredit(holder);
  await expect(named).toHaveText(`Human developer: ${name}`);
  await expect(initials).toHaveText(shown);
  await expect(initials).toBeVisible();
  await expect(image).toHaveCount(0);
}
