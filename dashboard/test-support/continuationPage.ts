// Saved continuation context on the open Codex card entry and closed Claude
// Done-history entry of the mixed-host story.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import {
  doneSessionsOnCard,
  parts,
  storyCardSessions,
} from "./dashboardPage.ts";
import { shellCommand } from "../src/sessionCapabilities.ts";
import type { CodexSession } from "../src/agentLaunch.ts";
import { sessionDetails } from "./support/sessionEntryDisclosure.ts";
import { openTerminalControl } from "./terminalScreenPage.ts";

export async function expectMixedContinuation(
  page: Page,
  card: Locator,
  continuation: NonNullable<CodexSession["continuation"]>,
  notice?: string,
) {
  const codex = storyCardSessions(card).filter({
    hasText: "Refinement started in Codex",
  });
  await sessionDetails(codex);
  await expect(codex.locator("p", { hasText: /^Workspace / })).toHaveText(
    `Workspace ${continuation.workspace}`,
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
  // A Claude session marked done to allow the Codex launch stays on this
  // unfinished card under Done history.
  const claude = await doneSessionsOnCard(
    card,
    "Refinement started in Claude Code",
  );
  await expect(claude.locator("p", { hasText: /^Continue in / })).toHaveCount(
    0,
  );
  await expect(openTerminalControl(claude)).toBeVisible();
}
