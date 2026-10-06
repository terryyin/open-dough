// Delay raw fact-group answers and choose success or failure on release. The
// records and path classification stay with each journey's publication fixture.

import { noConnection } from "../originAnswers.ts";
import type { RepositoryAnswerer } from "./fakeGitHub.ts";
import type { GhRequest } from "./ghRequest.ts";
import { holdingAnswer } from "./heldGitHubAnswer.ts";

export type FactGroup = "preparation" | "profiles" | "done";
export const factGroups: readonly FactGroup[] = [
  "preparation",
  "profiles",
  "done",
];
type Outcome = "success" | "failure";

export function holdFactGroupAnswers(
  published: RepositoryAnswerer,
  groupOf: (request: GhRequest) => FactGroup | undefined,
  heldGroups: readonly FactGroup[] = factGroups,
) {
  const failed = new Set<FactGroup>();
  let answer: RepositoryAnswerer = (call) => {
    const group = groupOf(call.request);
    return group !== undefined && failed.has(group)
      ? Promise.resolve(noConnection)
      : published(call);
  };
  const releases = new Map<FactGroup, () => void>();
  for (const group of heldGroups) {
    const held = holdingAnswer(answer, (request) => groupOf(request) === group);
    answer = held.answer;
    releases.set(group, held.release);
  }
  const release = (group: FactGroup, outcome: Outcome = "success") => {
    if (outcome === "failure") failed.add(group);
    releases.get(group)?.();
  };
  return {
    answer,
    release,
    releaseAll: (outcome: Outcome = "success") => {
      for (const group of heldGroups) release(group, outcome);
    },
  };
}
