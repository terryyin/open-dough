// Shared wording of a selected-check judgment (`../server/baseCiJudgment.ts`)
// for the launch dialog's base-CI confirmation (`./LaunchBaseCi.tsx`) and
// Intent's CI status tab (`./IntentCiStatus.tsx`): state names, the judged
// revision's short SHA, how many later commits have no result of their own,
// and a running judgment's nearest completed ancestor.

import type {
  BaseCiCompletedAncestor,
  BaseCiState,
} from "./baseCiConfirmation.ts";

export type JudgedState = "pass" | BaseCiState;

export function judgedStateName(state: JudgedState): string {
  if (state === "pass") return "Passed";
  if (state === "failed") return "Failed";
  if (state === "running") return "Running";
  return "Could not be read";
}

export function shortSha(revision: string): string {
  return revision.slice(0, 7);
}

// Empty when every commit after the judged revision has a result.
export function laterWithoutResultLine(count: number): string {
  if (count === 0) return "";
  return count === 1
    ? "One later commit has no result of its own."
    : `${String(count)} later commits have no result of their own.`;
}

export function completedAncestorLine(
  ancestor: BaseCiCompletedAncestor,
): string {
  return `Nearest completed ancestor: ${shortSha(ancestor.revision)} (${ancestor.subject}) — ${ancestor.state === "pass" ? "passed" : "failed"}.`;
}

export const noCompletedAncestorLine =
  "No completed ancestor result of the selected check was found in the readable history.";
