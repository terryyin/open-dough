// The Sessions sidebar's Running Cursor sessions section as a reader meets it:
// its header, the runner's sentence and held rows, and the divider beside the
// session list. Browser-only: it starts no runner, held client or server, so
// synthetic-answer journeys share it with native-runner ones. Opening the
// section asks for the runner's held sessions but waits for no answer; a
// journey holding that read still answers it where its scenario says.
import { expect, type Page } from "@playwright/test";
import {
  openSessionsSidebar,
  sessionsSidebarParts,
} from "./sessionsSidebarPage.ts";

export function runningCursorParts(page: Page) {
  const { sidebar, button, entries, heading, list } =
    sessionsSidebarParts(page);
  const region = sidebar.getByRole("region", {
    name: "Running Cursor sessions",
  });
  return {
    sidebar,
    button,
    entries,
    heading,
    region,
    header: region.getByRole("button", { name: "Running Cursor sessions" }),
    // The two areas that scroll on their own.
    list,
    body: region.locator(".running-cursor-body"),
    // The divider between them, while expanded.
    divider: sidebar.getByRole("separator", {
      name: "Running Cursor sessions divider",
      exact: true,
    }),
    // Every held session the section lists.
    listed: region.getByRole("listitem"),
    // The rows of held sessions in the project the caller names; a row says
    // what was started and the runner's label, and choosing it opens that
    // session's client.
    heldRows: (project: RegExp) =>
      region.getByRole("button", { name: project }),
  };
}

export type RunningCursorParts = ReturnType<typeof runningCursorParts>;

// Opens the Sessions sidebar and expands Running Cursor sessions, pressing
// Sessions and the section header only where either is still closed.
export async function openRunningList(page: Page): Promise<RunningCursorParts> {
  const shown = runningCursorParts(page);
  await openSessionsSidebar(page);
  if ((await shown.header.getAttribute("aria-expanded")) !== "true")
    await shown.header.click();
  return shown;
}

// Collapses the expanded section by its header; its content leaves.
export async function collapseRunningList(
  shown: RunningCursorParts,
): Promise<void> {
  await shown.header.click();
  await expect(shown.body).toHaveCount(0);
}
