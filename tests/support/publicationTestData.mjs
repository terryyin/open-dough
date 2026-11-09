// @ts-check
// The published histories a preservation-aware publication combines.
import { copyFacts } from "./factBuilder.mjs";

/** @typedef {Parameters<typeof import("../../src/skills/dough-execute-plan/scripts/history-preserving-publish.mjs").publishHistoryPreservingCandidate>[0]} HistoryPreservingPublication */
/** @typedef {Record<keyof Pick<HistoryPreservingPublication, "publishedTip" | "branch">, string> & Partial<Record<keyof Pick<HistoryPreservingPublication, "targetRef">, string>>} PublishedIntegration */

export class PublishedIntegrationBuilder {
  /** @template {PublishedIntegration} Facts @param {Facts} facts */
  with(facts) {
    return copyFacts(facts);
  }
}
