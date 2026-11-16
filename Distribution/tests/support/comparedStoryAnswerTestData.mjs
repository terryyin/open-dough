// @ts-check
// The comparison answer of a compared story (./comparedStoryTestData.mjs): a
// done story's three passed endpoint builds, the steps that state their
// facts, and how that answer reads once the story is Taken on trunk or on its
// story branch instead.
import { PublishedSourceBuilder } from "./publishedSourceTestData.mjs";

/** @typedef {import("../../../dashboard/src/storyCiComparison.ts").StoryCiComparisonAnswer} StoryCiComparisonAnswer */
/** @typedef {import("../../../dashboard/src/storyCiComparison.ts").StoryCiComparisonSlot} StoryCiComparisonSlot */
/** @typedef {Extract<StoryCiComparisonAnswer, { kind: "comparison" }>} ComparisonAnswer */
/** @typedef {Extract<StoryCiComparisonSlot, { kind: "build" }>} BuildSlot */
/** @typedef {"baseline" | "branch" | "landed"} Endpoint */

export const firstStory = "SEED-A#a";
export const secondStory = "SEED-B#b";
export const checkedAt = "2026-11-09T00:00:00.000Z";
// Story start, Branch build and completion revisions: Baseline, Branch, Landed.
export const revisions = /** @type {const} */ ([
  "a".repeat(40),
  "b".repeat(40),
  "c".repeat(40),
]);
/** @type {readonly Endpoint[]} */
export const endpoints = ["baseline", "branch", "landed"];

/** @type {StoryCiComparisonSlot} */
const notLanded = {
  kind: "not-landed",
  explanation: "The story has not landed yet.",
};

/**
 * The passed build of run `index + 1` at the endpoint's revision.
 * @param {number} index Baseline 0, Branch 1, Landed 2.
 * @returns {BuildSlot}
 */
export function passedBuild(index) {
  return {
    kind: "build",
    revision: /** @type {string} */ (revisions[index]),
    subject: /** @type {string} */ (
      endpoints[index] === "baseline" ? "before" : endpoints[index]
    ),
    state: "pass",
    selection: "exact",
    laterWithoutResult: 0,
    runId: index + 1,
    runAttempt: 1,
    startedAt: "2026-11-09T00:00:00Z",
    completedAt: "2026-11-09T00:04:00Z",
    timeWithoutRunnerWaits: { milliseconds: 120_000 },
  };
}

/** @returns {ComparisonAnswer} */
export function doneAnswer() {
  return {
    kind: "comparison",
    phase: "done",
    mode: "story-branch",
    identity: firstStory,
    storyStart: revisions[0],
    completion: revisions[2],
    checkedAt,
    baseline: passedBuild(0),
    branch: passedBuild(1),
    landed: passedBuild(2),
  };
}

/**
 * Taken in Trunk Mode: the Branch build becomes the provisional trunk build,
 * with no Branch build and no Landed build yet.
 * @param {ComparisonAnswer} answer @param {string} identity
 * @returns {ComparisonAnswer}
 */
export function takenOnTrunk(answer, identity) {
  const { baseline, storyStart, branch } = answer;
  return {
    kind: "comparison",
    phase: "taken",
    mode: "trunk",
    identity,
    storyStart,
    checkedAt,
    baseline,
    branch: {
      kind: "not-applicable",
      explanation: "Trunk Mode has no Branch build.",
    },
    landed: notLanded,
    provisional: branch,
  };
}

/**
 * Taken on its story branch: no completion revision and no Landed build yet.
 * @param {ComparisonAnswer} answer @returns {ComparisonAnswer}
 */
export function takenOnStoryBranch(answer) {
  const started = { ...answer };
  delete started.completion;
  return { ...started, phase: "taken", landed: notLanded };
}

/**
 * The slot's build identified by a CI adapter attempt on `main` instead of a
 * GitHub run.
 * @param {StoryCiComparisonSlot} slot
 * @param {{ attemptId: string, runId?: string, ambiguous?: boolean }} attempt
 * @param {Record<string, unknown>} facts
 */
function adapterAttemptSlot(slot, attempt, facts) {
  const rest = /** @type {Record<string, unknown>} */ ({ ...slot });
  delete rest["runId"];
  delete rest["runAttempt"];
  return {
    ...rest,
    runBranch: "main",
    ...facts,
    adapterAttempt: {
      runId: attempt.runId ?? "pipeline",
      attemptId: attempt.attemptId,
      ...(attempt.ambiguous === true ? { ambiguous: true } : {}),
    },
  };
}

/** The published source and the comparison answer read from it. */
export class ComparedAnswerBuilder {
  /** @protected */
  source = new PublishedSourceBuilder()
    .with({ id: "example", label: "Example", repository: "example/project" })
    .please();
  /** @protected */
  answer = doneAnswer();

  /**
   * Baseline, Branch and Landed builds completed 3 min, 3 min 20 s and 4 min
   * after they started, against 2 min each without runner waits.
   */
  wallTimed() {
    const startedAt = Date.parse("2026-11-09T00:00:00Z");
    [180_000, 200_000, 240_000].forEach((ms, at) =>
      this.#endpoint(/** @type {Endpoint} */ (endpoints[at]), {
        completedAt: new Date(startedAt + ms).toISOString(),
      }),
    );
    return this;
  }

  /** @param {Partial<ComparisonAnswer>} facts */
  withAnswer(facts) {
    this.answer = /** @type {ComparisonAnswer} */ ({
      ...this.answer,
      ...facts,
    });
    return this;
  }

  /** @param {Record<string, unknown>} facts */
  withBaseline(facts) {
    return this.#endpoint("baseline", facts);
  }

  /** @param {Record<string, unknown>} facts */
  withBranch(facts) {
    return this.#endpoint("branch", facts);
  }

  /** @param {Record<string, unknown>} facts */
  withLanded(facts) {
    return this.#endpoint("landed", facts);
  }

  /**
   * The endpoint's build is identified by a CI adapter attempt on `main`
   * instead of a GitHub run.
   * @param {Endpoint} endpoint
   * @param {{ attemptId: string, runId?: string, ambiguous?: boolean }} attempt
   * @param {Record<string, unknown>} [facts]
   */
  withAdapterAttemptAt(endpoint, attempt, facts = {}) {
    return this.withAnswer({
      [endpoint]: adapterAttemptSlot(this.answer[endpoint], attempt, facts),
    });
  }

  /** @param {Endpoint} endpoint @param {Record<string, unknown>} facts */
  #endpoint(endpoint, facts) {
    return this.withAnswer({
      [endpoint]: { ...this.answer[endpoint], ...facts },
    });
  }
}
