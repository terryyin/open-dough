// The CI homepage's projects and the Files column, location and folder
// controls its cases operate.
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { intentLocationIdPrefix } from "../../src/intentLocationIds.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { intentViewTab } from "./intent-candidates-page.ts";
import { fullSha } from "./intent-ci-status-fixtures.ts";

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

// Opens the location and each of its closed folders; already open ones stay
// open.
export async function expandLocationAndFolders(locationPath: string) {
  const bodyId = `${intentLocationIdPrefix(locationPath)}-body`;
  const locationToggle = () =>
    document.querySelector<HTMLButtonElement>(
      `button.intent-location-toggle[aria-controls="${bodyId}"]`,
    );
  const closed = () =>
    document.querySelector<HTMLElement>(
      `button.intent-location-toggle[aria-controls="${bodyId}"][aria-expanded="false"], #${CSS.escape(bodyId)} button.story-review-folder[aria-expanded="false"]`,
    );
  await expect.poll(() => locationToggle() !== null).toBe(true);
  for (let toggle = closed(); toggle !== null; toggle = closed()) {
    await userEvent.click(page.elementLocator(toggle));
    // Located again: the opened toggle's name says Collapse.
    await expect
      .element(page.elementLocator(toggle))
      .toHaveAttribute("aria-expanded", "true");
  }
  return locationToggle;
}

export const locationNameControl = (locationPath: string) =>
  page.elementLocator(
    presentElement(
      document.querySelector<HTMLElement>(
        `button.intent-location-name[data-location-path="${locationPath}"]`,
      ),
    ),
  );

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
