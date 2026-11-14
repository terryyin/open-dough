// @ts-check
// Adapter queue-entry construction for MakeMe. Queue progress has no attempt
// identity or verdict; the authority is
// `Distribution/src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs`.
import { copyFacts } from "./factBuilder.mjs";

/**
 * One queue entry as a CI adapter's discover answers it
 * (`targetCommandQueue` in ci-command-adapter). Optional check/context stay
 * absent when the case omits them. Valid states are queued, running, and
 * retrying; keep deliberate invalid forms literal at the call site.
 * @typedef {{
 *   sha: string,
 *   branch: string,
 *   state: "queued" | "running" | "retrying",
 *   check?: string,
 *   context?: string,
 * }} CiAdapterQueueEntry
 */

/**
 * Stated queue-entry facts exactly, preserving omitted optionals.
 * @returns {import("./factBuilder.mjs").FactBuilder<CiAdapterQueueEntry>}
 */
export function aCiQueueEntry() {
  return { with: copyFacts };
}
