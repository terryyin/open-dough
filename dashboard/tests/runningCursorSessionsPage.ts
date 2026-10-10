// The Sessions sidebar's Running Cursor sessions section, and the setup its
// specs share: one session the Cursor runner holds, launched as the page
// would, and the page showing the published Open Dough project. The held
// client and the cursor-agent are the fixture ./support/cursorStart.ts uses.
import type { Page, Request } from "@playwright/test";
import { launch } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { expect } from "./support/cursorStart.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { FakeCursor } from "./support/fakeCursor.ts";
import type { StartOrigin } from "./support/startOrigin.ts";

export const instruction = "hold this session";

// Launches an ad hoc Cursor session the runner holds; returns its client's
// process.
export async function holdSession(
  dashboard: DashboardServer,
  cursor: FakeCursor,
): Promise<number> {
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction,
  });
  expect(launched.status).toBe(200);
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  return cursor.attaches()[0]?.pid ?? 0;
}

export async function showPage(page: Page, origin: StartOrigin): Promise<void> {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Start session in Open Dough" }),
  ).toBeVisible();
}

export function runningCursorParts(page: Page) {
  const { sidebar, button, entries } = sidebarParts(page);
  const region = sidebar.getByRole("region", {
    name: "Running Cursor sessions",
  });
  return {
    sidebar,
    button,
    entries,
    heading: sidebar.getByRole("heading", { level: 2, name: "Sessions" }),
    region,
    header: region.getByRole("button", { name: "Running Cursor sessions" }),
    // The two areas that scroll on their own.
    list: sidebar.locator(".sidebar-sessions"),
    body: region.locator(".running-cursor-body"),
  };
}

// Opens the sidebar and expands Running Cursor sessions.
export async function openRunningList(page: Page) {
  const shown = runningCursorParts(page);
  await shown.button.click();
  await shown.header.click();
  return shown;
}

// Requests other than reads: a launch, an attach, a done mark, a delete, or
// a runner control.
export function changesAsked(page: Page): readonly string[] {
  const asked: string[] = [];
  page.on("request", (request: Request) => {
    if (request.method() !== "GET") asked.push(request.url());
  });
  return asked;
}
