// Shared driver of the real comparison read; only external acquisition is supplied.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect } from "../../tests/support/pageTest.ts";
import { performIntentCiComparisonRead } from "../../server/intentCiComparisonRead.ts";
import { clearCiComparisonAnswers } from "../../server/intentCiComparisonAnswers.ts";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";
import type { storyCiComparisonEvidence } from "./storyCiComparisonEvidence.ts";

export const baseline = "a".repeat(40),
  start = "b".repeat(40),
  branch = "c".repeat(40),
  landing = "d".repeat(40),
  completion = "e".repeat(40),
  later = "f".repeat(40);
export const workflow =
  "on:\n  push:\n    paths-ignore:\n      - 'docs/**'\njobs:\n  test:\n    runs-on: ubuntu-latest\n";
export const comparisonProject = makeMe.aPublishedSource
  .with({
    id: "comparison",
    label: "Comparison",
    repository: "example/project",
  })
  .please();
const read = {
  kind: "intent-ci-comparison",
  identity: "SEED-1#story",
} as const;

export async function answer(
  evidence: ReturnType<typeof storyCiComparisonEvidence>,
): Promise<StoryCiComparisonAnswer> {
  clearCiComparisonAnswers();
  try {
    const result = await performIntentCiComparisonRead(
      comparisonProject,
      read,
      new AbortController().signal,
      evidence.source,
    );
    expect(result.kind).toBe("answered");
    if (result.kind !== "answered")
      throw new Error("Comparison did not answer");
    return result.answer as StoryCiComparisonAnswer;
  } finally {
    clearCiComparisonAnswers();
  }
}
