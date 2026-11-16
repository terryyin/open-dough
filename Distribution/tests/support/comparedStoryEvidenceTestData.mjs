// @ts-check
// The proof a compared story (./comparedStoryTestData.mjs) publishes: each
// run's proof answer, the entries its endpoints hold, the scope that reads
// them, and the endpoint slots' published proofs made of those entries.
import { CiProofBuilder } from "./ciProofTestData.mjs";
import { CiProofEntryBuilder } from "./ciProofEntryTestData.mjs";
import {
  ComparedAnswerBuilder,
  checkedAt,
  endpoints,
  revisions,
} from "./comparedStoryAnswerTestData.mjs";
import {
  summaryScope,
  summaryScopeEntries,
} from "./comparedStorySummaryScopeTestData.mjs";

/** @typedef {import("../../../dashboard/src/ciProof.ts").CiProof} CiProof */
/** @typedef {import("../../../dashboard/src/ciProof.ts").CiProofEntry} CiProofEntry */
/** @typedef {import("./comparedStoryAnswerTestData.mjs").ComparisonAnswer} ComparisonAnswer */
/** @typedef {import("./comparedStoryAnswerTestData.mjs").Endpoint} Endpoint */
/** @typedef {import("../../../dashboard/server/intentCiProofRead.ts").IntentCiProofAnswer & import("../../../dashboard/src/ciProof.ts").CiProofRun} IntentCiProofAnswer */
/** @typedef {[CiProofEntry[], CiProofEntry[], CiProofEntry[]]} EndpointEntries */
/** @typedef {{ path: string, scope?: "location" | "folder" | "file", caseTarget?: string }} ScopeSelection */
/** @typedef {import("../../../dashboard/src/authenticatedIntentRead.ts").IntentLocation} IntentLocation */
/** @typedef {import("../../../dashboard/src/storyReviewFiles.ts").ReviewedFile} ReviewedFile */
/**
 * @typedef {object} ComparisonScope
 * @property {readonly IntentLocation[]} locations
 * @property {readonly ReviewedFile[]} changed
 * @property {string} revision
 * @property {ScopeSelection} selection
 */

/**
 * Run `runId`'s proof answer at `revision`: one `dashboard/tests` entry.
 * @param {number} runId @param {string} revision @param {number} count @param {number} ms
 * @returns {IntentCiProofAnswer}
 */
export function runProof(runId, revision, count, ms) {
  return {
    runId,
    runAttempt: 1,
    revision,
    checkedAt,
    proof: new CiProofBuilder()
      .summaryFor({ runId, runAttempt: 1, revision }, [
        new CiProofEntryBuilder()
          .at("dashboard/tests")
          .counting(count)
          .timed(ms)
          .please(),
      ])
      .please(),
  };
}

/** @param {number} runId The run of an endpoint build. */
export function endpointRunProof(runId) {
  const revision = revisions[runId - 1];
  if (revision === undefined)
    throw new Error("An unarranged proof was requested");
  return runProof(runId, revision, runId + 1, runId * 1_000);
}

/** @param {string} path @param {number} ms @param {number} count @param {"case" | "file"} [unit] */
function timedEntry(path, ms, count, unit = "case") {
  return new CiProofEntryBuilder()
    .at(path)
    .counting(count, unit)
    .timed(ms)
    .please();
}

/** @returns {EndpointEntries} */
function mixedEntries() {
  return [
    [
      timedEntry("dashboard/tests", 240_000, 2090),
      timedEntry("tests", 120_000, 5, "file"),
    ],
    [
      timedEntry("dashboard/tests", 270_000, 2092),
      timedEntry("tests", 90_000, 5, "file"),
      timedEntry("src/skills", 30_000, 3, "file"),
    ],
    [
      timedEntry("dashboard/tests", 300_000, 2092),
      timedEntry("tests", 60_000, 5, "file"),
      timedEntry("src/skills", 30_000, 3, "file"),
    ],
  ];
}

/**
 * Each endpoint slot's published proof holding that endpoint's entries:
 * Baseline, Branch (or the provisional build), Landed; undefined where the
 * slot has no build proof.
 * @param {ComparisonAnswer} answer
 * @param {EndpointEntries} entries
 * @param {string} repository
 * @returns {(CiProof | undefined)[]}
 */
function endpointProofs(answer, entries, repository) {
  const slots = [
    answer.baseline,
    answer.provisional ?? answer.branch,
    answer.landed,
  ];
  return slots.map((slot, at) => {
    if (slot.kind !== "build") return undefined;
    const held = entries[at] ?? [];
    const adapter = slot.adapterAttempt;
    if (adapter !== undefined) {
      if (slot.runBranch === undefined || adapter.ambiguous === true)
        return undefined;
      return new CiProofBuilder()
        .summaryForAdapter(
          { attemptId: adapter.attemptId, revision: slot.revision },
          held,
          repository,
        )
        .please();
    }
    if (slot.runId === undefined || slot.runAttempt === undefined)
      return undefined;
    const { runId, runAttempt, revision } = slot;
    return new CiProofBuilder()
      .summaryFor({ runId, runAttempt, revision }, held, repository)
      .please();
  });
}

/** The scope and the endpoint proofs a compared story publishes. */
export class ComparedEvidenceBuilder extends ComparedAnswerBuilder {
  /** @protected @type {ComparisonScope | undefined} */
  scope;
  /** @protected @type {EndpointEntries | undefined} */
  entries;
  /** @type {(CiProof | undefined)[] | undefined} */
  #proofs;

  /**
   * The Summary scope's location, changed files and per-file proof, with the
   * Baseline build an ancestor of the story start, which had no build.
   */
  inSummaryScope() {
    this.scope = summaryScope();
    this.entries = summaryScopeEntries();
    return this.withBaseline({
      selection: "ancestor",
      laterWithoutResult: 1,
      requestedStatus: {
        kind: "no-build",
        explanation: `No build at ${this.answer.storyStart}: the workflow at that revision could not be read.`,
      },
    });
  }

  /** Endpoint entries with case and file counts, one added at Branch. */
  withMixedEntries() {
    return this.withEntries(mixedEntries());
  }

  /** @param {readonly (readonly CiProofEntry[])[]} entries Baseline, Branch, Landed. */
  withEntries(entries) {
    this.entries = /** @type {EndpointEntries} */ (
      [0, 1, 2].map((at) => [...(entries[at] ?? [])])
    );
    return this;
  }

  /** @param {Endpoint} endpoint @param {readonly CiProofEntry[]} entries */
  withEntriesAt(endpoint, entries) {
    const all = this.entries ?? [[], [], []];
    return this.withEntries(
      all.map((held, at) => (endpoints[at] === endpoint ? entries : held)),
    );
  }

  /** @param {...(CiProof | undefined)} proofs Each endpoint slot's proof as published. */
  withProofs(...proofs) {
    this.#proofs = proofs;
    return this;
  }

  /**
   * One endpoint slot's proof as published; the others keep the proofs
   * already stated or made of their entries.
   * @param {Endpoint} endpoint @param {CiProof | undefined} proof
   */
  withProofAt(endpoint, proof) {
    const proofs = [...(this.publishedProofs() ?? [])];
    proofs[endpoints.indexOf(endpoint)] = proof;
    return this.withProofs(...proofs);
  }

  /** @param {string} path @param {ScopeSelection["scope"]} [scope] @param {string} [caseTarget] */
  selecting(path, scope, caseTarget) {
    const selection = {
      path,
      ...(scope === undefined ? {} : { scope }),
      ...(caseTarget === undefined ? {} : { caseTarget }),
    };
    this.scope = { ...this.#requiredScope(), selection };
    return this;
  }

  /** @param {...IntentLocation} locations Locations read beside the scope's own. */
  withLocations(...locations) {
    const scope = this.#requiredScope();
    this.scope = { ...scope, locations: [...scope.locations, ...locations] };
    return this;
  }

  /** @param {...ReviewedFile} changed Files the story changed beside the scope's own. */
  withChanged(...changed) {
    const scope = this.#requiredScope();
    this.scope = { ...scope, changed: [...scope.changed, ...changed] };
    return this;
  }

  /**
   * Each endpoint slot's proof as stated, or else made of its entries.
   * @protected
   */
  publishedProofs() {
    if (this.#proofs !== undefined) return this.#proofs;
    if (this.entries === undefined) return undefined;
    return endpointProofs(this.answer, this.entries, this.source.repository);
  }

  /** @returns {ComparisonScope} */
  #requiredScope() {
    if (this.scope === undefined)
      throw new Error("State the comparison's scope, as inSummaryScope()");
    return this.scope;
  }
}
