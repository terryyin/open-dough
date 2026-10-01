// A held kept-start retry must expose its saved Codex host through actual HTTP
// progress and through a new page with its independent default host selection.
import type { Locator, Page } from "@playwright/test";
import { expect } from "../dashboardTest.ts";
import { runningStarts } from "../agentLaunchBoundary.ts";
import { queuedIdentity } from "./startOrigin.ts";
import type { DashboardServer } from "./dashboardServer.ts";

export async function expectCodexRetryProgress(
  page: Page,
  card: Locator,
  dashboard: DashboardServer,
  workflow: "execution" | "refinement",
): Promise<Page> {
  await expect
    .poll(() => runningStarts(dashboard))
    .toEqual([
      {
        host: "codex",
        workflow,
        source: "open-dough",
        identity: queuedIdentity,
        phase: "launching",
      },
    ]);
  const words = `Starting ${workflow} in Codex…`;
  await expect(card).toContainText(words);
  const observer = await page.context().newPage();
  await observer.goto(dashboard.baseURL);
  const retryCard = observer.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await expect(retryCard).toContainText(words);
  await observer.reload();
  await expect(retryCard).toContainText(words);
  return observer;
}
