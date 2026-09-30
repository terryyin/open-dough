// The page the Backlog card launch specs start from: the launch journey's
// origin once Story A is taken (./launchJourney.ts), with Story B Ready for
// execution and Story C not refined in the Backlog, read and settled, and
// where each card's launch actions and dialogs are found, and the project
// actions row's Start session button and dialog.

import { cpSync } from "node:fs";
import path from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "./launchJourney.ts";

// Installs the real refinement skill in the project the dashboard reads
// (under `home`); answers the file of its options definition.
export function installRefinementSkill(home: string) {
  const skill = "dough-story-refinement";
  const installed = path.join(home, "git", "open-dough", ".claude", "skills");
  cpSync(path.join("src", "skills", skill), path.join(installed, skill), {
    recursive: true,
  });
  return path.join(installed, skill, "references", "refinement-options.json");
}

const groupedEntry = (flag: string) => ({
  flag,
  label: flag.slice(2).toUpperCase(),
  summary: `${flag}.`,
  instruction: `${flag}.`,
});
// A refinement options definition with A and B in the exclusive group
// "Approach", and C outside any group.
export const groupedOptions = {
  command: "dough-story-refinement",
  options: [groupedEntry("--a"), groupedEntry("--b"), groupedEntry("--c")],
  groups: [
    {
      id: "approach",
      label: "Approach",
      selection: "exclusive",
      flags: ["--a", "--b"],
    },
  ],
};

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
