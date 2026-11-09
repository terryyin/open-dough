// @ts-check
// The configured published-reading source used across dashboard journeys.
/** @typedef {import("../../dashboard/src/publishedSource.ts").PublishedSource} PublishedSource */

export class PublishedSourceBuilder {
  /** @param {Omit<PublishedSource, "ref" | "backlogPath"> & Partial<Pick<PublishedSource, "ref" | "backlogPath">>} facts */
  with({
    ref = "main",
    backlogPath = ".planning/PRODUCT-BACKLOG.md",
    ...facts
  }) {
    return { please: () => ({ ...facts, ref, backlogPath }) };
  }
}
