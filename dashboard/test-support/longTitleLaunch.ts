// A queued story's long title that wraps across several lines in a launch
// dialog and on the Board without widening either, offered for refinement
// with the real shipped refinement options (./launchStoryCardPage.ts).

import type { Page } from "@playwright/test";
import { expect } from "./support/frontendApp.ts";
import {
  machineOffering,
  putFrontendStories,
  type FrontendServiceState,
} from "./support/frontendServiceState.ts";
import {
  backlogLaunchers,
  shippedRefinementDefinition,
} from "./launchStoryCardPage.ts";

export const longTitle =
  "Let developers read a very long queued story title that wraps across several lines without widening the dialog: Supercalifragilisticexpialidocious-session-options-with-an-unbroken-name";

// The long-titled story waits for refinement in a project whose machine
// offers the shipped refinement options.
export function offerLongTitleRefinement(services: FrontendServiceState) {
  putFrontendStories(services, { notRefinedTitle: longTitle });
  services.answerMachine(machineOffering(shippedRefinementDefinition()));
}

// Opens Start refinement on the long-titled story.
export async function openLongTitleRefinement(
  page: Page,
  services: FrontendServiceState,
) {
  offerLongTitleRefinement(services);
  await page.goto("/");
  const { refine, refinementDialog: dialog } = backlogLaunchers(page);
  const launcher = refine(longTitle);
  await launcher.click();
  await expect(dialog).toBeVisible();
  return { launcher, dialog };
}
