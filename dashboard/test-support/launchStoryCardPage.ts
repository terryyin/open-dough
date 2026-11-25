// The page the Backlog card launch specs start from: the launch journey's
// origin once Story A is taken (./launchJourney.ts), with Story B Ready for
// execution and Story C not refined in the Backlog, read and settled, and
// where each card's launch actions and dialogs are found, and the project
// actions row's Start session button and dialog.

import { cpSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import {
  expectSettledPage,
  parts,
  sessionEntriesIn,
  storyCardSessions,
} from "./dashboardPage.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { optionsDefinitionSchema } from "../src/commandOptions.ts";
import { launchWaitMs } from "./support/launchWait.ts";
import { sessionDetails } from "./support/sessionEntryDisclosure.ts";
import { repoRoot } from "./support/repositoryRoot.ts";

// Installs the real refinement skill's references, its options definition
// among them, in the project the dashboard reads (under `home`); its scripts
// stay out, so the project does not establish a preparation and a launch only
// starts the session. Answers the file of the options definition.
const refinementSkill = "dough-story-refinement";
const shippedReferences = path.join(
  repoRoot,
  "Distribution",
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

// The options definition the real refinement skill ships, with the fields
// only its agent reads, and focuses listed even when it has none.
export function shippedRefinementDefinition() {
  const shipped: unknown = JSON.parse(
    readFileSync(
      path.join(shippedReferences, "refinement-options.json"),
      "utf8",
    ),
  );
  const definition = optionsDefinitionSchema.parse(shipped);
  return {
    ...(shipped as object),
    ...definition,
    focuses: definition.focuses ?? [],
  };
}

export const groupedOptions = makeMe.anOptionsDefinition
  .withExclusiveApproachExample()
  .please();

// Where origin places the launch journey's stories; session state never
// moves one.
export const takenBacklogStories = {
  taken: [takenStory],
  backlog: [readyStory, notRefinedStory],
};

export async function openTakenBacklog(page: Page, journey: LaunchJourney) {
  await publishCommittedOrigin(page, {
    repoDir: journey.origin,
    revision: journey.taken,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  await expectSettledPage(page, takenBacklogStories);
  return backlogLaunchers(page);
}

// Where the settled Taken/Backlog board's launch actions and their Claude Code
// dialogs are found.
export function backlogLaunchers(page: Page) {
  const { backlog, taken } = parts(page);
  const card = (title: string) => backlog.getByRole("article", { name: title });
  return {
    card,
    takenStoryCard: taken.getByRole("article", { name: takenStory }),
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
    async showsRecordedRefinementOptions(title: string, expected: string) {
      const entry = storyCardSessions(card(title));
      await expect(entry).toHaveCount(1);
      await sessionDetails(entry);
      await expect(entry.getByText(expected, { exact: true })).toBeVisible();
    },
  };
}

export async function expectNoLaunchDialog(page: Page) {
  await expect(page.getByRole("dialog")).toHaveCount(0);
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

export function storyLaunchChoices(dialog: Locator) {
  const option = (name: string) =>
    dialog.getByRole("checkbox", { name, exact: true });
  const model = dialog.getByRole("combobox", { name: "Model" });
  return {
    async chooseOption(name: string) {
      await showOptions(dialog);
      await option(name).check();
    },
    chooseHost: (host: string) =>
      dialog.getByRole("combobox", { name: "Host" }).selectOption(host),
    chooseModel: (alias: string) => model.selectOption(alias),
    async showsRemovedOption(name: string, explanation: string) {
      await expect(dialog).toContainText(explanation);
      await expect(option(name)).toHaveCount(0);
    },
    async showsModels(selected: string, labels: string[]) {
      await expect(model).toHaveValue(selected);
      await expect(model.locator("option")).toHaveText(labels);
    },
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

// A story launch dialog's instruction field.
export const instructionField = (dialog: Locator) =>
  dialog.getByRole("textbox", { name: "Instruction (optional)" });

// After an ad-hoc Start finishes local startup, the project actions row shows
// neither progress nor a success log. Waits as long as the start itself may
// (./support/launchWait.ts).
export async function expectQuietAdHocActionsRow(page: Page): Promise<void> {
  await expect(
    parts(page).projectActions.getByText("Local startup in progress."),
  ).toHaveCount(0, { timeout: launchWaitMs });
  await expect(parts(page).adHocStarted).toHaveCount(0);
}

// The session a Start session dialog started, as local Taken lists it once
// startup progress has cleared. A read during the start may already list the
// session while Local startup is still in progress, so this waits for that
// quiet settlement, as long as the start itself may.
export async function startedSession(page: Page): Promise<Locator> {
  await expectQuietAdHocActionsRow(page);
  const recent = sessionEntriesIn(parts(page).taken);
  await expect(recent).toHaveCount(1, { timeout: launchWaitMs });
  return recent;
}
