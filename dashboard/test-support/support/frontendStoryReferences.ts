// Frontend answers for following an active story reference
// (../../frontend-tests/navigation/story-reference-navigation.spec.ts): Story A
// waits on Story B and needs a decision about Story C, published as the
// substitute's backlog and files.

import type { Page } from "@playwright/test";
import {
  storyB,
  storySeed,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { twoDependencies } from "../storyDependencyFixture.ts";
import { controlFrontendAuthenticatedRead } from "./frontendAuthenticatedReadControl.ts";
import { openDoughSource } from "./frontendPublishedFixtures.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { putFrontendDependencies } from "./frontendStoryDependencies.ts";

const supplierSeedPath = ".planning/seeds/B.md";

// Publishes Story A's agreements with Story B's seed long enough to scroll to
// its section, and answers GitHub pages with a heading. Returns the canonical
// record's blob URL at the published revision.
export async function putFrontendActiveReference(
  page: Page,
  services: FrontendServiceState,
): Promise<string> {
  putFrontendDependencies(services, twoDependencies());
  Object.assign(services.files, {
    [supplierSeedPath]: storySeed(
      storyB,
      "A detailed example of the published endpoint contract.\n\n"
        .repeat(24)
        .trimEnd(),
    ),
  });
  await page.context().route("https://github.com/**", (route) =>
    route.fulfill({
      body: "<h1>Source evidence</h1>",
      contentType: "text/html",
    }),
  );
  return `https://github.com/${openDoughSource.repository}/blob/${services.revision}/${supplierSeedPath}#b`;
}

// Story B's seed read fails as GitHub's missing file does at the boundary:
// an actionable failure, outside the page's transient recovery.
export async function failFrontendSupplierSeed(page: Page): Promise<void> {
  const seed = await controlFrontendAuthenticatedRead(
    page,
    (params) => params.get("path") === supplierSeedPath,
  );
  seed.respond({ error: `GitHub could not find ${supplierSeedPath}.` }, 502);
}
