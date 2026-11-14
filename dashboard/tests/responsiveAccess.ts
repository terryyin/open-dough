// Shared by ./launches/responsive-session-access.spec.ts: beginning another
// task by keyboard, recording what the startup announcements region says,
// counting the page's reads of this machine's sessions, and how a card and its
// startup indicator are drawn.

import type { Locator, Page } from "@playwright/test";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import { expect } from "./dashboardTest.ts";

// Opens the card's detail by keyboard, a task of the developer's own, and
// answers its Hide detail, which then holds the keyboard.
export async function inspectByKeyboard(page: Page, card: Locator) {
  await card.getByRole("button", { name: "Inspect story" }).focus();
  await page.keyboard.press("Enter");
  const hide = card.getByRole("button", { name: "Hide detail" });
  await expect(hide).toBeFocused();
  return hide;
}

// Every text the startup announcements region says from now on, in order.
export async function recordAnnouncements(page: Page) {
  await page.evaluate(() => {
    const region = document.querySelector(
      "[role='log'][aria-label='Startup announcements']",
    );
    const said: string[] = [];
    Object.assign(window, { startupSaid: said });
    new MutationObserver(() => {
      said.push(region?.textContent ?? "");
    }).observe(region as Node, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
  return () =>
    page.evaluate(
      () => (window as unknown as { startupSaid: string[] }).startupSaid,
    );
}

// Counts the page's reads of this machine's sessions from now on.
export function countMachineReads(page: Page) {
  let reads = 0;
  page.on("requestfinished", (request) => {
    if (
      request.method() === "GET" &&
      new URL(request.url()).pathname === agentLaunchEndpoint
    )
      reads += 1;
  });
  return () => reads;
}

// Whether the startup's indicator shows, and its animation.
export const indicatorOf = (indicator: Locator) =>
  indicator.evaluate((element) => {
    const before = getComputedStyle(element, "::before");
    return {
      shown: before.content !== "none" && parseFloat(before.width) > 0,
      animation: before.animationName,
    };
  });

// The card's marks as drawn: its edge and its outline.
export const marksOf = (card: Locator) =>
  card.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      classes: [...element.classList],
      edge: style.borderTopStyle,
      edgeColor: style.borderTopColor,
      accent: style.borderLeftColor,
      outline: style.outlineStyle,
    };
  });
