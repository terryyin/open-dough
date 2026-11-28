// A test whose dashboard uses the machine of a real bare origin
// (./startOrigin.ts) with the installed starts, and the page publishing that
// origin's committed stories.

import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { test as base } from "../dashboardTest.ts";
import {
  queuedOriginRepository,
  startOrigin,
  type StartOrigin,
  type StartOriginFixtures,
} from "./startOrigin.ts";

export const test = base.extend<StartOriginFixtures>({
  originRepository: queuedOriginRepository,
  origin: async ({ originRepository }, use) => {
    const origin = await startOrigin(originRepository);
    await use(origin);
    origin.cleanup();
  },
  machine: async ({ origin }, use) => {
    await use(origin.machine);
  },
});

// Publishes the origin's main as the page's committed stories, following it,
// and answers the revision published.
export async function publishOrigin(page: Page, origin: StartOrigin) {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  return revision;
}
