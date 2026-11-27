// The worker preparation plan
// (../../test-support/support/workerPreparationFixtures.ts): every
// worker input, kept histories included, is one registration of the pool
// every page spec takes, so kept and ordinary cases share a worker, and each
// takes cold preparation's worker allowance. A case opts into a kept history
// by overriding only its own `originRepository`, whose kept worker fixture is
// resolved before the case's private origin starts from it.
import { expect, test } from "vitest";
import { startingFromKeptComparedStoryBranch } from "../../test-support/support/keptComparedStoryBranch.ts";
import {
  startingFromKeptIntentStory,
  startingFromKeptStory,
  startingFromKeptSummaryComparisonStory,
} from "../../test-support/support/keptPublishedStory.ts";
import {
  keptStoryWorkerFixtures,
  workerPreparationFixtures,
} from "../../test-support/support/workerPreparationFixtures.ts";
import {
  coldInputPreparation,
  pinnedWatcherCodexPreparation,
} from "../../test-support/support/publishedMainWorkerFixtures.ts";

test("kept and ordinary histories are worker preparations of one pool, each in the cold allowance", () => {
  const registrations = Object.entries(workerPreparationFixtures).filter(
    ([, registration]) =>
      !(Array.isArray(registration) && registration[1].option),
  );
  expect(registrations.map(([name]) => name)).toEqual(
    expect.arrayContaining([
      ...Object.keys(keptStoryWorkerFixtures),
      "keptComparedStoryBranch",
      "launchJourney",
      "dashboardServerInputsReady",
    ]),
  );
  for (const [name, registration] of registrations)
    expect(Array.isArray(registration) && registration[1], name).toEqual(
      name === "pinnedWatcherCodex"
        ? pinnedWatcherCodexPreparation
        : coldInputPreparation,
    );
});

type OptIn = {
  originRepository: (
    fixtures: Record<string, unknown>,
    use: (description: unknown) => Promise<void>,
  ) => Promise<void>;
};

test.each([
  ["keptStory", startingFromKeptStory, (kept: object) => kept],
  ["keptIntentStory", startingFromKeptIntentStory, (kept: object) => kept],
  [
    "keptSummaryComparisonStory",
    startingFromKeptSummaryComparisonStory,
    (kept: object) => kept,
  ],
  [
    "keptComparedStoryBranch",
    startingFromKeptComparedStoryBranch,
    (kept: object) => ({ description: kept }),
  ],
] as const)(
  "a case's private origin starts from its finished %s",
  async (name, optIn, prepared) => {
    const ordinary = { origin: "ordinary" };
    const kept = { origin: name };
    let startsFrom: unknown;
    await (optIn as unknown as OptIn).originRepository(
      { originRepository: ordinary, [name]: prepared(kept) },
      (description) => {
        startsFrom = description;
        return Promise.resolve();
      },
    );
    expect(startsFrom).toBe(kept);
  },
);
