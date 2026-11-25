// Saved continuation context on the open Codex card entry and closed Claude
// Done-history entry of the mixed-host story.
import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import {
  parts,
  shownDoneSessionEntriesOf,
  storyCardSessions,
} from "./dashboardPage.ts";
import { shellCommand } from "../src/sessionCapabilities.ts";
import type { CodexSession } from "../src/agentLaunch.ts";
import { sessionDetails } from "./support/sessionEntryDisclosure.ts";
import { openTerminalControl, terminalPanel } from "./terminalScreenPage.ts";
import { storyCard } from "./storyCardControls.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";

export async function openOnlySidebarSession(page: Page, state: string) {
  const sidebar = sessionsSidebarParts(page);
  await sidebar.button.click();
  await expect(sidebar.entries).toHaveCount(1);
  await expect(sidebar.entries.filter({ hasText: state })).toHaveCount(1);
  await sidebar.entries.getByRole("button").click();
  const panel = terminalPanel(page);
  await expect(panel).toHaveCount(1);
  return panel;
}

export async function expectMixedContinuation(
  page: Page,
  story: string,
  continuation: NonNullable<CodexSession["continuation"]>,
  workspaceShown: string,
  notice?: string,
) {
  const card = storyCard(parts(page).board, story);
  const codex = storyCardSessions(card).filter({
    hasText: "Refinement started in Codex",
  });
  await sessionDetails(codex);
  await expect(codex.locator("p", { hasText: /^Workspace / })).toHaveText(
    `Workspace ${workspaceShown}`,
  );
  await expect(
    codex.locator("p", { hasText: /^Continue in / }).locator("code"),
  ).toHaveText(shellCommand(continuation.args));
  await expect(codex.locator("p", { hasText: /^Continue in / })).toBeVisible();
  if (notice !== undefined)
    await expect(codex.getByText(notice, { exact: true })).toBeVisible();
  else await expect(codex.locator("p.quiet")).toHaveCount(0);
  await expect(
    parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: "Refinement started in Codex" }),
  ).toHaveCount(0);
  // A Claude session marked done to allow the Codex launch stays Done.
  const claude = await shownDoneSessionEntriesOf(
    page,
    story,
    "Refinement started in Claude Code",
  );
  await expect(claude.locator("p", { hasText: /^Continue in / })).toHaveCount(
    0,
  );
  await expect(openTerminalControl(claude)).toBeVisible();
}
