// A committed Open Dough origin whose queued Story C has a long title
// (./launchJourney.ts fixtures), and its Start refinement dialog opened on a
// project that installs the real refinement skill's options
// (./launchStoryCardPage.ts).

import type { Page } from "@playwright/test";
import { materializeRepository } from "../../Distribution/tests/support/repository-fixture.mjs";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { queuedDashboardRepository } from "./launchJourney.ts";
import { installRefinementSkill } from "./launchStoryCardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";

export const longTitle =
  "Let developers read a very long queued story title that wraps across several lines without widening the dialog: Supercalifragilisticexpialidocious-session-options-with-an-unbroken-name";

export interface LongTitleOrigin {
  readonly origin: string;
  readonly revision: string;
  readonly cleanup: () => Promise<void>;
}

export async function publishLongTitleOrigin(): Promise<LongTitleOrigin> {
  const { origin, trunkSha, cleanup } = await materializeRepository(
    queuedDashboardRepository(longTitle).please(),
  );
  return { origin, revision: trunkSha, cleanup };
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
