// Every worker-scoped fixture of the suite, which ./pageTest.ts registers in
// the one pool every page spec takes: the published-main ones come from
// ./publishedMainWorkerFixtures.ts, the server and origin inputs from
// ./serverInputWorkerFixtures.ts, and the kept histories and launch journeys'
// origin are declared below. Why one pool, and why each preparation takes
// cold preparation's worker allowance, is in ./pageTest.ts.

import type { Fixtures } from "@playwright/test";
import type { LaunchJourney } from "../launchJourney.ts";
import type { KeptComparedStoryBranch } from "./keptComparedStoryBranch.ts";
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

type KeptStoryWorkerFixtures = {
  keptStory: StartRepository;
  keptIntentStory: StartRepository;
  keptSummaryComparisonStory: StartRepository;
};

// Story A published as completed and kept (./keptPublishedStory.ts), on the
// queued trunk, on Intent's and on the summary comparison's: the worker that
// takes one prepares it before its first such case and answers the
// description those cases' origins start from, so none publishes the story in
// its own time.
export const keptStoryWorkerFixtures: Fixtures<
  object,
  KeptStoryWorkerFixtures
> = {
  keptStory: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { prepareKeptStory } = await import("./keptPublishedStory.ts");
      await use(await prepareKeptStory("queued"));
    },
    coldInputPreparation,
  ],
  keptIntentStory: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { prepareKeptStory } = await import("./keptPublishedStory.ts");
      await use(await prepareKeptStory("intent"));
    },
    coldInputPreparation,
  ],
  keptSummaryComparisonStory: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { prepareKeptStory } = await import("./keptPublishedStory.ts");
      await use(await prepareKeptStory("summary comparison"));
    },
    coldInputPreparation,
  ],
};

export type WorkerPreparationFixtures = PublishedMainWorkerFixtures &
  ServerInputWorkerFixtures &
  KeptStoryWorkerFixtures & {
    launchJourney: LaunchJourney;
    keptComparedStoryBranch: KeptComparedStoryBranch;
  };

// Every input the pool prepares once per worker, each in cold preparation's
// own worker allowance, beside the options that select among them. A new
// worker input preparation joins this record, whose every registration
// ../../backend-tests/runtime/kept-history-worker.spec.ts checks.
export const workerPreparationFixtures: Fixtures<
  object,
  WorkerPreparationFixtures
> = {
  ...serverInputWorkerFixtures,
  ...publishedMainWorkerFixtures,
  ...keptStoryWorkerFixtures,
  // The real-CLI compared Story Branch history (./keptComparedStoryBranch.ts),
  // completed before the first case that asks for it; a spec selects it per
  // case through
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
    coldInputPreparation,
  ],
};
