// A committed Open Dough origin whose queued Story C has a long title
// (./launchJourney.ts fixtures), and its Start refinement dialog opened on a
// project that installs the real refinement skill's options
// (./launchCardPage.ts).

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import {
  backlogFile,
  createPreparationTrunk,
  git,
  lsRemoteSha,
  seedC,
} from "../../src/skills/dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { installRefinementSkill } from "./launchCardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";

export const longTitle =
  "Let developers read a very long queued story title that wraps across several lines without widening the dialog: Supercalifragilisticexpialidocious-session-options-with-an-unbroken-name";

export interface LongTitleOrigin {
  readonly origin: string;
  readonly revision: string;
  readonly cleanup: () => Promise<void>;
}

export async function publishLongTitleOrigin(): Promise<LongTitleOrigin> {
  const trunk = await createPreparationTrunk();
  const { integration } = trunk;
  for (const file of [seedC, backlogFile]) {
    const at = path.join(integration, file);
    writeFileSync(
      at,
      readFileSync(at, "utf8").replaceAll("Story C", longTitle),
    );
  }
  await git(integration, "commit", "--quiet", "-am", "retitle story C");
  await git(integration, "push", "--quiet", "origin", "main");
  const revision = await lsRemoteSha(trunk.origin, "refs/heads/main");
  if (revision === undefined) throw new Error("origin has no main");
  return { origin: trunk.origin, revision, cleanup: trunk.cleanup };
}

// Opens the dashboard on the published origin, ready for its launchers.
export async function openLongTitleOrigin(
  page: Page,
  home: string,
  published: LongTitleOrigin,
) {
  installRefinementSkill(home);
  await publishCommittedOrigin(page, {
    repoDir: published.origin,
    revision: published.revision,
    repository: "terryyin/open-dough",
  });
  await openUntilRead(page);
}

export async function openRefinement(
  page: Page,
  home: string,
  published: LongTitleOrigin,
) {
  await openLongTitleOrigin(page, home, published);
  const card = parts(page).backlog.getByRole("article", { name: longTitle });
  const launcher = card.getByRole("button", { name: "Start refinement" });
  await launcher.click();
  const dialog = page.getByRole("dialog", {
    name: "Start refinement in Claude Code",
  });
  await expect(dialog).toBeVisible();
  return { launcher, dialog };
}
