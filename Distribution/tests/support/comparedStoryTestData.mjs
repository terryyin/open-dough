// @ts-check
// A completed story's CI comparison as the Intent comparison reads it: the
// published source and work, the comparison answer with its three endpoint
// builds (./comparedStoryAnswerTestData.mjs), each run's proof answer, and,
// when a case states them, the scope and the proof entries each endpoint
// published (./comparedStoryEvidenceTestData.mjs).
import { CiProofBuilder } from "./ciProofTestData.mjs";
import {
  firstStory,
  passedBuild,
  revisions,
  secondStory,
  takenOnStoryBranch,
  takenOnTrunk,
} from "./comparedStoryAnswerTestData.mjs";
import {
  ComparedEvidenceBuilder,
  endpointRunProof,
  runProof,
} from "./comparedStoryEvidenceTestData.mjs";
import {
  catalogued,
  publishedWork,
  queuedBacklog,
  takenListing,
} from "./comparedStoryWorkTestData.mjs";

/** @typedef {import("./comparedStoryAnswerTestData.mjs").BuildSlot} BuildSlot */
/** @typedef {import("./comparedStoryEvidenceTestData.mjs").IntentCiProofAnswer} IntentCiProofAnswer */
/** @typedef {import("./comparedStoryWorkTestData.mjs").PublishedWork} PublishedWork */
/**
 * @typedef {object} ComparedStory
 * @property {import("./comparedStoryWorkTestData.mjs").PublishedSource} source
 * @property {PublishedWork} work
 * @property {string} identity
 * @property {import("./comparedStoryAnswerTestData.mjs").ComparisonAnswer} answer
 * @property {(runId: number) => IntentCiProofAnswer} proof
 *   The proof answer the run `runId` read answers.
 * @property {(runId: number) => IntentCiProofAnswer} entryProof
 *   That proof answer holding the entries the story states for the run's
 *   endpoint, as a served proof read answers it.
 * @property {import("./comparedStoryEvidenceTestData.mjs").ComparisonScope | undefined} scope
 * @property {import("./comparedStoryEvidenceTestData.mjs").EndpointEntries | undefined} entries
 *   The entries each endpoint's proof holds, Baseline, Branch, Landed.
 * @property {(import("../../../dashboard/src/ciProof.ts").CiProof | undefined)[] | undefined} proofs
 *   Each endpoint slot's published proof, Baseline, Branch (or the
 *   provisional build), Landed; undefined where the slot has no build proof.
 */

export class ComparedStoryBuilder extends ComparedEvidenceBuilder {
  #identity = firstStory;
  /** @type {Partial<PublishedWork>} */
  #work = { done: catalogued(firstStory, "d".repeat(40)) };
  /** @type {Map<number, IntentCiProofAnswer>} */
  #runProofs = new Map();

  /**
   * The story is Taken in Trunk Mode: its trunk build is provisional, with no
   * Branch build and no Landed build yet, and the published work lists it.
   */
  takenOnTrunk() {
    this.answer = takenOnTrunk(this.answer, this.#identity);
    const provisional = /** @type {BuildSlot} */ (this.answer.provisional);
    return this.#taken(provisional.revision, "trunk", "main");
  }

  /**
   * After `takenOnTrunk()`: the trunk head moved on to the completion
   * revision, whose passed build, run 3, is now the provisional build.
   */
  trunkHeadAdvanced() {
    this.#work = { ...this.#work, revision: revisions[2] };
    return this.withAnswer({ provisional: passedBuild(2) });
  }

  /**
   * The story is Taken on its story branch `name` (`feature/a`): it has not
   * landed yet, and the published work lists it.
   * @param {string} [name]
   */
  takenOnStoryBranch(name = "feature/a") {
    this.answer = takenOnStoryBranch(this.answer);
    const branch = /** @type {BuildSlot} */ (this.answer.branch);
    return this.#taken(branch.revision, "story-branch", name);
  }

  /**
   * A second completed story, `SEED-B#b`, whose Baseline build is run 4 at
   * its own revision; the published work catalogues it instead.
   */
  ofAnotherStory() {
    const revision = "d".repeat(40);
    this.#identity = secondStory;
    this.#runProofs.set(4, runProof(4, revision, 10, 10_000));
    this.#work = {
      ...this.#work,
      done: catalogued(secondStory, "e".repeat(40)),
    };
    const baseline = { ...this.answer.baseline, revision, runId: 4 };
    return this.withAnswer({ identity: secondStory, baseline });
  }

  /**
   * The selection is a second story, `SEED-B#b`, queued in the published
   * backlog, while the comparison answer stays the first story's.
   */
  ofQueuedStory() {
    this.#identity = secondStory;
    this.#work = { ...this.#work, backlog: queuedBacklog(secondStory) };
    return this;
  }

  /** @param {Partial<PublishedWork>} facts */
  withWork(facts) {
    this.#work = { ...this.#work, ...facts };
    return this;
  }

  /** @returns {ComparedStory} */
  please() {
    const source = this.source;
    const runProofs = new Map(this.#runProofs);
    const entries = this.entries;
    /** @param {number} runId */
    const proof = (runId) => runProofs.get(runId) ?? endpointRunProof(runId);
    return {
      source,
      identity: this.#identity,
      work: { ...publishedWork(source), ...this.#work },
      answer: this.answer,
      proof,
      entryProof: (runId) => {
        const held = entries?.[runId - 1];
        if (held === undefined)
          throw new Error(`Arrange the proof entries of run ${runId}`);
        const read = proof(runId);
        return {
          ...read,
          proof: new CiProofBuilder().summaryFor(read, held).please(),
        };
      },
      scope: this.scope,
      entries,
      proofs: this.publishedProofs(),
    };
  }

  /**
   * The published work, at `revision`, lists the story as Taken by the
   * engineer in `mode` on `branch`, and catalogues no Done story.
   * @param {string} revision
   * @param {"trunk" | "story-branch"} mode
   * @param {string} branch
   */
  #taken(revision, mode, branch) {
    const work = { ...this.#work };
    delete work.done;
    const taken = takenListing(this.#identity, mode, branch);
    this.#work = { ...work, revision, taken };
    return this;
  }
}

/**
 * @typedef {object} ComparedStoryMakeMe
 * @property {ComparedStoryBuilder} aComparedStory
 */

/** @returns {PropertyDescriptorMap} */
export function comparedStoryMakeMeProperties() {
  return {
    aComparedStory: {
      enumerable: true,
      get() {
        return new ComparedStoryBuilder();
      },
    },
  };
}
