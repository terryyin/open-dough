// Saved continuation context on the open Codex card entry and closed Claude
// Recently done entry of the mixed-host story.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { shellCommand } from "../src/sessionCapabilities.ts";
import type { CodexSession } from "../src/agentLaunch.ts";

export async function expectMixedContinuation(
  page: Page,
  card: Locator,
  continuation: NonNullable<CodexSession["continuation"]>,
  notice?: string,
) {
  const codex = cardSessions(card).filter({
    hasText: "Refinement started in Codex",
  });
  await expect(codex.locator("p", { hasText: /^Workspace / })).toHaveText(
    `Workspace ${continuation.workspace}`,
  );
  await expect(codex.locator("p", { hasText: /^Continue in / })).toHaveText(
    `Continue in Codex: ${shellCommand(continuation.args)}`,
  );
  if (notice !== undefined)
    await expect(codex.getByText(notice, { exact: true })).toBeVisible();
  else await expect(codex.locator("p.quiet")).toHaveCount(0);
  await expect(
    parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: "Refinement started in Codex" }),
  ).toHaveCount(0);
  const claude = parts(page).recentlyDone.getByRole("article").filter({
    hasText: "Refinement started in Claude Code",
  });
  // A Claude session marked done to allow the Codex launch leaves the card;
  // Recently done still lists it.
  await expect(claude.locator("p", { hasText: /^Continue in / })).toHaveCount(
    0,
  );
  await expect(
    claude.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();
}
