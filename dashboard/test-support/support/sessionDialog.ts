// What the session-choice dialog specs share: Story A's Backlog card on a
// page reading the real bare origin as GitHub would (./committedOrigin.ts),
// origin's trunk, and a Session choice's radio.

import type { Locator, Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { git } from "./startOriginObservation.ts";

// A bare origin a Board reads: a start origin, or an installed catalog
// project's origin (./catalogProjectOrigin.ts).
export type BoardOrigin = { readonly origin: string };

export const originMain = (origin: BoardOrigin) =>
  git(origin.origin, "rev-parse", "main");

// Story A's card on a Board published at the origin's main as it is now.
export async function openBacklog(page: Page, origin: BoardOrigin) {
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
