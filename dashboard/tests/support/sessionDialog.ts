// What the session-choice dialog specs share: Story A's Backlog card on a
// page reading the real bare origin as GitHub would (./committedOrigin.ts),
// origin's trunk, and a Session choice's radio.

import type { Locator, Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import type { StartOrigin } from "./startOrigin.ts";

export async function originMain(origin: StartOrigin) {
  return (await origin.originGit("rev-parse", "main")).trim();
}

export async function openBacklog(page: Page, origin: StartOrigin) {
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: await originMain(origin),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  return parts(page).backlog.getByRole("article", { name: "Story A" });
}

export const radio = (dialog: Locator, group: string, name: string) =>
  dialog
    .getByRole("group", { name: group })
    .getByRole("radio", { name, exact: true });
