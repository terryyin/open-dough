// A test whose dashboard uses the machine of a real bare origin
// (./startOrigin.ts) with the installed starts, and the page publishing that
// origin's committed stories.

import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { test as base } from "../dashboardTest.ts";
import { startOrigin, type StartOrigin } from "./startOrigin.ts";

export const test = base.extend<{ origin: StartOrigin }>({
  // eslint-disable-next-line no-empty-pattern
  origin: async ({}, use) => {
    const origin = await startOrigin();
    await use(origin);
    origin.cleanup();
  },
  machine: async ({ origin }, use) => {
    await use(origin.machine);
  },
});

// Publishes the origin's main as the page's committed stories, following it.
export async function publishOrigin(page: Page, origin: StartOrigin) {
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
}
