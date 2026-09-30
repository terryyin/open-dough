// The page the Backlog card launch specs start from: the launch journey's
// origin once Story A is taken (./launchJourney.ts), with Story B Ready for
// execution and Story C not refined in the Backlog, read and settled, and
// where each card's launch actions and dialogs are found, and the project
// actions row's Start session button and dialog.

import { expect, type Locator, type Page } from "@playwright/test";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "./launchJourney.ts";

export async function openTakenBacklog(page: Page, journey: LaunchJourney) {
  await publishCommittedOrigin(page, {
    repoDir: journey.origin,
    revision: journey.taken,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const { backlog, taken } = parts(page);
  await expectMembership(page, {
    taken: [takenStory],
    backlog: [readyStory, notRefinedStory],
  });
  await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  const card = (title: string) => backlog.getByRole("article", { name: title });
  return {
    card,
    takenCard: taken.getByRole("article", { name: takenStory }),
    start: (title: string) =>
      card(title).getByRole("button", { name: "Start execution" }),
    dialog: page.getByRole("dialog", {
      name: "Start execution in Claude Code",
    }),
    refine: (title: string) =>
      card(title).getByRole("button", { name: "Start refinement" }),
    refinementDialog: page.getByRole("dialog", {
      name: "Start refinement in Claude Code",
    }),
  };
}

export const startSession = (page: Page, project: string) =>
  page.getByRole("button", { name: `Start session in ${project}` });

export const startSessionDialog = (page: Page, project: string) =>
  page.getByRole("dialog", {
    name: `Start a session in ${project} in Claude Code`,
  });

export const startSessionField = (dialog: Locator) =>
  dialog.getByRole("textbox", {
    name: "What would you like to talk about? (optional)",
  });
