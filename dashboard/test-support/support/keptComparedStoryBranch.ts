// A compared Story Branch's real-CLI history
// (./storyCiComparisonDoneFixture.ts), completed once by a worker before its
// first case that asks for it (./workerPreparationFixtures.ts declares it in
// the common pool) and kept under its own description, so the queued slot it
// starts from stays the ordinary queued trunk. Each case's origin, checkout,
// HOME and server are an independent copy that already holds the history;
// the case publishes its own GitHub answers with publishComparedHistory.
import type { Fixtures } from "@playwright/test";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { startOrigin, type StartOriginFixtures } from "./startOrigin.ts";
import {
  keepStartedOrigin,
  type StartRepository,
} from "./startOriginPreparation.ts";
import {
  completeComparedStoryHistory,
  type ComparedStoryHistory,
} from "./storyCiComparisonDoneFixture.ts";

export type KeptComparedStoryBranch = {
  readonly description: StartRepository;
  readonly history: ComparedStoryHistory;
};

export async function prepareKeptComparedStoryBranch(): Promise<KeptComparedStoryBranch> {
  const description: StartRepository & { readonly preparedHistory: string } = {
    ...queuedReadyRepository().please(),
    preparedHistory: "completed compared Story Branch",
  };
  const started = await startOrigin(description);
  try {
    const history = await completeComparedStoryHistory(started);
    keepStartedOrigin("claude", description, started);
    return { description, history };
  } finally {
    started.cleanup();
  }
}

// What a test extends itself with (`test.extend(…)`) so that each case's
// origin starts from the worker's kept compared history, after whatever the
// test's own `originRepository` waits for. Only the case's own fixture is
// overridden, so its specs share a worker with every other page spec.
export const startingFromKeptComparedStoryBranch: Fixtures<
  object,
  object,
  Pick<StartOriginFixtures, "originRepository">,
  { keptComparedStoryBranch: KeptComparedStoryBranch }
> = {
  originRepository: async (
    { originRepository, keptComparedStoryBranch },
    use,
  ) => {
    await Promise.resolve(originRepository);
    await use(keptComparedStoryBranch.description);
  },
};
