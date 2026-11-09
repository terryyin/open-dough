// @ts-check
// A story's preparation assessment, built separately from its planning record.
import { copyFacts } from "./factBuilder.mjs";
/** @typedef {Omit<Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-story-state-home.mjs").recordPreparation>[1], "identity" | "href" | "expectedBasis">} StoryPreparation */

export class StoryPreparationBuilder {
  /**
   * @template {StoryPreparation} Facts
   * @param {Facts} facts
   */
  with(facts) {
    return copyFacts(facts);
  }
  /** A refined story planned in a path relative to its seed.
   * @param {string} plan
   */
  plannedIn(plan) {
    return this.with({
      refinement: /** @type {const} */ ("refined"),
      approach: /** @type {const} */ ("planned"),
      plan,
    });
  }
}
