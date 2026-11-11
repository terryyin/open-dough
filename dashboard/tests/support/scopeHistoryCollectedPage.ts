import { comparisonReading } from "../intentCiComparisonPage.ts";
// Open a published Done story with historical sessions, finish its existing
// comparison reads, then let the case count local history navigation.
import { readFileSync, writeFileSync } from "node:fs";
import { historyFile as collectedHistoryFile } from "./collectedScopeHistory.ts";
import type { Locator, Page } from "@playwright/test";
import { shortSha } from "../../src/baseCiWording.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { showColumn } from "../boardPage.ts";
import { parts } from "../dashboardPage.ts";
import { chooseStoryTab } from "./intentStoryPage.ts";
import { expect } from "./preparationPage.ts";

export async function openCollectedHistoryStory(page: Page, address = "/") {
  await page.goto(address);
  await showColumn(page, "Recently done");
  const { recentlyDone, intentChoice, intent } = parts(page);
  const card = recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  // The card also contains historical session headings. Select its own
  // heading, which names the published Done story above those sessions.
  await card.locator(":scope > h3").click();
  await expect(card).toHaveClass(/story-card-selected/);
  await intentChoice.click();
  const panel = intent.getByRole("region", {
    name: "CI timing comparison",
    exact: true,
  });
  // Explicitly finish the enclosing comparison/endpoint Proof reads before
  // counting historical navigation. Their legitimate reads are separate; use
  // the established comparison journey's bounded read readiness contract.
  await expect(panel).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  await expect(panel.locator(".intent-ci-reading")).toHaveCount(0, {
    timeout: readWaitLimitMs + 15_000,
  });
  await expect(comparisonReading(panel).entryTable).toBeVisible({
    timeout: readWaitLimitMs + 15_000,
  });
  await chooseStoryTab(intent, "Changed tests");
  return { intent, panel, card };
}

// Observe common build evidence, declared facets and keyboard order at phone width.
export async function expectCollectedEntryHistory(
  page: Page,
  history: Locator,
  expected: {
    readonly selected: string;
    readonly excluded: string;
    readonly extent: string;
    readonly rows: readonly string[];
  },
) {
  await expect(history).toContainText(
    `Selected landing ${shortSha(expected.selected)}`,
  );
  await expect(history).toContainText(expected.extent);
  const evidence = history.getByRole("list", {
    name: "Test execution history evidence",
  });
  await expect(evidence.getByRole("listitem")).toHaveText([...expected.rows]);
  await expect(history).not.toContainText(shortSha(expected.excluded));
  await expect(history).not.toContainText("Run 104");
  await expect(
    history.getByRole("img", {
      name: "Test execution time for test cases by build date; selected landing marked",
    }),
  ).toBeVisible();
  await expect(
    history.locator("svg text.intent-ci-history-selected"),
  ).toHaveText(["Selected", "Selected"]);
  await expect(
    history.getByRole("img", {
      name: "Test execution time for test files by build date; selected landing marked",
    }),
  ).toBeVisible();
  await expect(evidence.getByRole("listitem")).toHaveCount(2);
  const build = evidence.getByRole("link", { name: "Run 103 · attempt 1" });
  await expect(build).toHaveAttribute("href", "https://ci.invalid/runs/103");
  await history.locator("summary").focus();
  await page.keyboard.press("Tab");
  await expect(
    evidence.getByRole("link", { name: "Run 101 · attempt 1" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(build).toBeFocused();
  await expectNoSidewaysScrollIn(page, history);
}

// Corrupt the actual local store, then restore exact bytes through the view's Retry.
export async function expectCollectedHistoryRecovery({
  home,
  history,
  read,
  reopen,
  expectPreserved,
  expectRecovered,
}: {
  readonly home: string;
  readonly history: Locator;
  readonly read: () => Promise<{
    readonly status: number;
    readonly body: unknown;
  }>;
  readonly reopen: () => Promise<void>;
  readonly expectPreserved: () => Promise<void>;
  readonly expectRecovered: () => Promise<void>;
}) {
  const historyFile = collectedHistoryFile(home);
  const retainedText = readFileSync(historyFile, "utf8");
  try {
    writeFileSync(historyFile, "{broken collected history", "utf8");
    const failed = await read();
    expect(failed.status).toBe(502);
    expect(failed.body).toMatchObject({
      error:
        "The collected CI history could not be read. Retry the local history read.",
    });
    await reopen();
    await expect(history.getByRole("alert")).toContainText(
      "The collected CI history could not be read.",
    );
    await expect(history.getByRole("alert")).not.toContainText("gh auth");
    await expectPreserved();
    writeFileSync(historyFile, retainedText, "utf8");
    await history.getByRole("button", { name: "Retry history" }).click();
    await expect(history.getByRole("alert")).toHaveCount(0);
    await expectRecovered();
  } finally {
    writeFileSync(historyFile, retainedText, "utf8");
  }
}
