// The CI homepage's projects and the Files column, location and folder
// controls its cases operate.
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { pressAt } from "../navigation/board-reading-page.ts";
import { intentViewTab } from "./intent-candidates-page.ts";
import { fullSha } from "./intent-ci-status-fixtures.ts";
import { fileLayout } from "./intent-file-layout-page.ts";

export const workOf = (
  source: PublishedSource,
  shortSha: string,
): PublishedWork =>
  makeMe.aPublishedWork.of(source).at(fullSha(shortSha)).please();

export const doughnutSource: PublishedSource = makeMe.aPublishedSource
  .with({
    id: "doughnut",
    label: "Doughnut",
    repository: "nerds-odd-e/doughnut",
    ref: "main",
  })
  .please();

export const filesColumnVisible = () =>
  document.querySelector<HTMLElement>(".intent-locations")?.checkVisibility() ??
  false;

export async function activateChosenCiTab(how: "click" | "Enter" | "Space") {
  const tab = intentViewTab("CI status");
  if (how === "click") {
    await userEvent.click(tab);
  } else {
    tab.element().focus();
    await userEvent.keyboard(how === "Enter" ? "{Enter}" : " ");
  }
  await expect.element(tab).toHaveAttribute("aria-selected", "true");
}

export function presentElement<T>(found: T | null | undefined): T {
  if (found === null || found === undefined) {
    throw new Error("Expected element in document");
  }
  return found;
}

const locationRow = (locationPath: string) =>
  document.querySelector<HTMLElement>(
    `.intent-location-header:has(> button[data-location-path="${CSS.escape(locationPath)}"]), li[data-folder-path="${CSS.escape(locationPath)}"] > [data-intent-folder-cue="root"]`,
  );

const locationNameElement = (locationPath: string) =>
  locationRow(locationPath)?.querySelector<HTMLElement>(
    ":scope > button[aria-pressed]",
  ) ?? null;

const rowToggle = (row: Element) =>
  row.querySelector<HTMLButtonElement>(":scope > button[aria-expanded]");

async function disclose(toggle: HTMLButtonElement) {
  if (toggle.getAttribute("aria-expanded") === "false") {
    await userEvent.click(page.elementLocator(toggle));
    // Opening changes the accessible name used by elementLocator.
    await expect
      .element(page.elementLocator(toggle))
      .toHaveAttribute("aria-expanded", "true");
  }
}

async function revealLocationAncestors(locationPath: string) {
  const row = presentElement(locationRow(locationPath));
  const ancestors: Element[] = [];
  let item = row.closest("li[data-folder-path]");
  while (
    (item = item?.parentElement?.closest("li[data-folder-path]") ?? null)
  ) {
    ancestors.unshift(item);
  }
  for (const ancestor of ancestors) {
    const ancestorRow = presentElement(ancestor.querySelector(":scope > div"));
    await disclose(presentElement(rowToggle(ancestorRow)));
  }
}

// Open the location and its descendants, keeping any folders already open.
export async function expandLocationAndFolders(locationPath: string) {
  await locationNameDrawn(locationPath);
  await revealLocationAncestors(locationPath);
  const locationToggle = () =>
    rowToggle(presentElement(locationRow(locationPath)));
  const root = presentElement(locationToggle());
  await disclose(root);
  const body = document.getElementById(
    root.getAttribute("aria-controls") ?? "",
  );
  const closed = () =>
    body?.querySelector<HTMLButtonElement>(
      'button.story-review-folder[aria-expanded="false"]',
    ) ?? null;
  for (let toggle = closed(); toggle !== null; toggle = closed()) {
    await disclose(toggle);
  }
  return locationToggle;
}

export const locationNameControl = (locationPath: string) =>
  page.elementLocator(presentElement(locationNameElement(locationPath)));

// Resolves once the location name control at LOCATIONPATH is drawn, however
// long the mount takes; the case's own timeout bounds the wait.
export function locationNameDrawn(locationPath: string) {
  const drawn = () => locationNameElement(locationPath) !== null;
  return new Promise<void>((resolve) => {
    if (drawn()) {
      resolve();
      return;
    }
    const watch = new MutationObserver(() => {
      if (!drawn()) return;
      watch.disconnect();
      resolve();
    });
    watch.observe(document.body, { childList: true, subtree: true });
  });
}

// Presses the drawn name of the location at LOCATIONPATH with the mouse on its
// first line of words, opening Files first where a narrow page keeps it in a
// closed drawer; a narrow page shows a wrapped name only in part. A comparison
// arriving at any moment renames the button, so the press locates it by path,
// never by name.
export async function pressLocationName(locationPath: string) {
  await locationNameDrawn(locationPath);
  await fileLayout().showFiles();
  await revealLocationAncestors(locationPath);
  const name = presentElement(locationNameElement(locationPath));
  name.scrollIntoView({ block: "nearest", inline: "nearest" });
  const words = document.createRange();
  words.selectNodeContents(name);
  const line = presentElement(words.getClientRects()[0]);
  const point = {
    x: line.left + line.width / 2,
    y: line.top + line.height / 2,
  };
  expect(name.contains(document.elementFromPoint(point.x, point.y))).toBe(true);
  await pressAt(point);
}

export const folderNameControl = (folderName: string) =>
  page.elementLocator(
    presentElement(
      [
        ...document.querySelectorAll<HTMLElement>(
          "button.story-review-folder-name",
        ),
      ].find((button) => button.textContent.includes(folderName)),
    ),
  );

// How many of the Files column's controls are selected.
export const pressedFileCount = () =>
  document.querySelectorAll('.intent-locations [aria-pressed="true"]').length;
