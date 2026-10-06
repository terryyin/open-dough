// The page the Backlog card launch specs start from: the launch journey's
// origin once Story A is taken (./launchJourney.ts), with Story B Ready for
// execution and Story C not refined in the Backlog, read and settled, and
// where each card's launch actions and dialogs are found, and the project
// actions row's Start session button and dialog.

import { cpSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import { launchWaitMs } from "./support/launchWait.ts";
import { repoRoot } from "./support/repositoryRoot.ts";

// Installs the real refinement skill's references, its options definition
// among them, in the project the dashboard reads (under `home`); its scripts
// stay out, so the project does not establish a preparation and a launch only
// starts the session. Answers the file of the options definition.
const refinementSkill = "dough-story-refinement";
const shippedReferences = path.join(
  repoRoot,
  "src",
  "skills",
  refinementSkill,
  "references",
);

export function installRefinementSkill(home: string) {
  const installed = path.join(home, "git", "open-dough", ".claude", "skills");
  cpSync(
    shippedReferences,
    path.join(installed, refinementSkill, "references"),
    {
      recursive: true,
    },
  );
  return path.join(
    installed,
    refinementSkill,
    "references",
    "refinement-options.json",
  );
}

// The options definition the real refinement skill ships.
export function shippedRefinementDefinition() {
  return JSON.parse(
    readFileSync(
      path.join(shippedReferences, "refinement-options.json"),
      "utf8",
    ),
  ) as Record<
    "options" | "focuses",
    { flag: string; label: string; summary: string }[]
  >;
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
  await expectSettledPage(page, {
    taken: [takenStory],
    backlog: [readyStory, notRefinedStory],
  });
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

// Opens a launch dialog's options disclosure, which starts closed; an open
// one stays open.
export async function showOptions(dialog: Locator) {
  const summary = dialog.page().locator("summary", { hasText: "options" });
  const disclosure = dialog.locator("details", { has: summary });
  if ((await disclosure.getAttribute("open")) === null) {
    await disclosure.locator("summary").click();
  }
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

// The session a Start session dialog started, as Recently done lists it
// once the start answered. A read during the start may already list the
// session, still without the start's outcome, so this waits for the answer's
// announcement, as long as the start itself may (./support/launchWait.ts).
export async function startedSession(page: Page): Promise<Locator> {
  await expect(
    page.getByRole("log").filter({ hasText: "Ad hoc session started" }),
  ).toBeVisible({ timeout: launchWaitMs });
  const recent = parts(page).recentlyDone.getByRole("article");
  await expect(recent).toHaveCount(1);
  return recent;
}
