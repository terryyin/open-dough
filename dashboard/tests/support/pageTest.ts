// The test every dashboard spec runs under, directly or through a fixture
// module built on it (../dashboardTest.ts and the modules extending that).
//
// A spec waits for the event it depends on and never waits out a deadline
// (../README.md, "Synchronization"); when the state it needs leaves no trace
// the test can see, it adds an observation of its own, such as a test-side
// loader in the server, rather than a sleep.
//
// One such event is shared by every page spec: the page's intercepted reads
// finishing. A route handler may still be reading its fetched answer when the
// test's last assertion passes, and Playwright disposes those answers with the
// context. So the `page` fixture finishes every handler of the page before it
// is torn down, and no spec needs a teardown of its own for it. Another is
// the answer to a read the page sent on opening: every page of the test's
// context notes its requests from before its own scripts run
// (../pageRequestNotes.ts), whichever server the spec opens it at, so a first
// check after an open can wait for that answer. Specs import `test` from
// here; the lint configuration rejects a direct import of `test` from
// `@playwright/test` under `dashboard/tests/`.
//
// Every worker-scoped fixture of the suite is declared here, whichever specs
// take it; the published-main ones come from ./publishedMainWorkerFixtures.ts
// and the server and origin inputs from ./serverInputWorkerFixtures.ts.
// Playwright runs a test only in a worker whose fixture pool
// declares the same worker-scoped fixtures (the worker hash is the set of
// those registrations, not the fixtures a test uses), so a worker-scoped
// fixture declared in one fixture module but not another splits the specs
// into worker populations that cannot share a worker, and each switch
// between them stops a worker and starts a fresh one. A `test.use` of a
// worker-scoped option (`launchOptions`) has the same effect, with one
// population per distinct value object; that value also replaces the
// configured browser arguments, so it spreads them in (./browserArgs.ts).

import { test as base } from "@playwright/test";
import type {
  ComparisonRenderer,
  ComparisonRenderOptions,
} from "./comparisonRendering.ts";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";
import type { LaunchJourney } from "../launchJourney.ts";
import { noteRequestsInEveryPage } from "../pageRequestNotes.ts";
import type { KeptComparedStoryBranch } from "./keptComparedStoryBranch.ts";
import { endDescendantsAtExit } from "./processGroup.ts";
import {
  coldInputPreparation,
  publishedMainWorkerFixtures,
  type PublishedMainWorkerFixtures,
} from "./publishedMainWorkerFixtures.ts";
import {
  serverInputWorkerFixtures,
  type ServerInputWorkerFixtures,
} from "./serverInputWorkerFixtures.ts";
import type { StartRepository } from "./startOriginPreparation.ts";

export { expect } from "@playwright/test";
export type { FixtureServerMode } from "./serverInputWorkerFixtures.ts";

// No process a test started outlives its worker (./processGroup.ts).
endDescendantsAtExit();

// Playwright's worker-only extension takes an empty test-fixture type.
const workerTest = base.extend<
  object,
  PublishedMainWorkerFixtures &
    ServerInputWorkerFixtures & {
      launchJourney: LaunchJourney;
      comparisonRenderer: ComparisonRenderer;
      keptStory: StartRepository;
      keptIntentStory: StartRepository;
      keptSummaryComparisonStory: StartRepository;
      keptComparedStoryBranch: KeptComparedStoryBranch;
    }
>({
  ...serverInputWorkerFixtures,
  ...publishedMainWorkerFixtures,
  // Story A published as completed and kept (./keptPublishedStory.ts), on the
  // queued trunk, on Intent's and on the summary comparison's: the worker
  // that takes one prepares it before its first such case and answers the
  // description those cases' origins start from, so none publishes the story
  // in its own time.
  keptStory: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { prepareKeptStory } = await import("./keptPublishedStory.ts");
      await use(await prepareKeptStory("queued"));
    },
    { scope: "worker" },
  ],
  keptIntentStory: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { prepareKeptStory } = await import("./keptPublishedStory.ts");
      await use(await prepareKeptStory("intent"));
    },
    { scope: "worker" },
  ],
  keptSummaryComparisonStory: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { prepareKeptStory } = await import("./keptPublishedStory.ts");
      await use(await prepareKeptStory("summary comparison"));
    },
    { scope: "worker" },
  ],
  // The real-CLI compared Story Branch history (./keptComparedStoryBranch.ts),
  // completed in cold preparation's own worker allowance before the first
  // case that asks for it; a spec selects it per case through
  // `startingFromKeptComparedStoryBranch`.
  keptComparedStoryBranch: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { prepareKeptComparedStoryBranch } =
        await import("./keptComparedStoryBranch.ts");
      await use(await prepareKeptComparedStoryBranch());
    },
    coldInputPreparation,
  ],
  comparisonRenderer: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { createComparisonRenderer } =
        await import("./comparisonRendering.ts");
      const renderer = await createComparisonRenderer();
      try {
        await use(renderer);
      } finally {
        await renderer.close();
      }
    },
    { scope: "worker" },
  ],
  // The launch journeys' origin (../launchJourney.ts says what it publishes),
  // published once per worker and read, never written, by every journey the
  // worker runs from it (../launchStoryCardPage.ts serves it as GitHub would).
  // `fullyParallel` runs a `beforeAll` once per worker per file, so this
  // shared read-only origin is a worker fixture. Only a worker that takes
  // the fixture loads the publishing code.
  launchJourney: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { publishLaunchJourney } = await import("../launchJourney.ts");
      const journey = await publishLaunchJourney();
      await use(journey);
      await journey.cleanup();
    },
    { scope: "worker" },
  ],
  context: async ({ context }, use) => {
    await noteRequestsInEveryPage(context);
    await use(context);
  },
  page: async ({ page }, use) => {
    await use(page);
    // A spec that closed its page has no handler left to finish.
    if (!page.isClosed()) await page.unrouteAll({ behavior: "wait" });
  },
});

// Renders a compared story (`makeMe.aComparedStory`) into the page through
// the worker's comparison renderer, answering the comparison region; the
// tree form renders the Intent file tree's comparison readings.
export const test = workerTest.extend<{
  renderComparison: (
    story: ComparedStory,
    options?: ComparisonRenderOptions,
  ) => ReturnType<typeof import("./comparisonRendering.ts").renderComparison>;
  renderComparisonTree: (story: ComparedStory) => Promise<void>;
}>({
  renderComparison: async ({ page, comparisonRenderer }, use) => {
    const { renderComparison } = await import("./comparisonRendering.ts");
    await use((story, options) =>
      renderComparison(page, comparisonRenderer, story, options),
    );
  },
  renderComparisonTree: async ({ page, comparisonRenderer }, use) => {
    const { renderComparisonTree } = await import("./comparisonRendering.ts");
    await use((story) => renderComparisonTree(page, comparisonRenderer, story));
  },
});
