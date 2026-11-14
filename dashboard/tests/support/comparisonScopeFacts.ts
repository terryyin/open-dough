// Canonical file evidence for the existing entry → folder → file comparison.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { CiProofEntry } from "../../src/ciProof.ts";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";
import { preparedComparison } from "./comparisonMountFacts.ts";
import type { ComparisonServices } from "./comparisonMountPage.ts";

export function serveComparison(
  services: ComparisonServices,
  facts: {
    readonly answer: StoryCiComparisonAnswer;
    readonly proof: ReturnType<typeof preparedComparison>["proof"];
  },
  entries: readonly (readonly CiProofEntry[])[],
) {
  Object.assign(services, {
    comparison: () => ({ json: facts.answer }),
    proof: (params: URLSearchParams) => {
      const run = Number(params.get("run"));
      const endpoint = facts.proof(run);
      const selected = entries[run - 1];
      if (selected === undefined) throw new Error(`Unarranged proof ${run}`);
      return {
        json: {
          ...endpoint,
          proof: makeMe.aCiProof.summaryFor(endpoint, selected).please(),
        },
      };
    },
  });
}

export function summaryScopeFacts() {
  const facts = preparedComparison();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      baseline: {
        ...facts.answer.baseline,
        selection: "ancestor",
        laterWithoutResult: 1,
        requestedStatus: {
          kind: "no-build",
          explanation: `No build at ${facts.answer.storyStart}: the workflow at that revision could not be read.`,
        },
      },
    })
    .please();
  const location = makeMe.anIntentLocation
    .at("dashboard/tests")
    .ofKind("typescript", ["**/*.spec.ts"])
    .selecting(
      "dashboard/tests/folder/a.spec.ts",
      "dashboard/tests/folder/nested/c.spec.ts",
      "dashboard/tests/root.spec.ts",
      "dashboard/tests/added.spec.ts",
      "dashboard/tests/renamed.spec.ts",
    )
    .please();
  const changed = [
    makeMe.aReviewedFile
      .with({ kind: "modified", path: "dashboard/tests/folder/a.spec.ts" })
      .please(),
    makeMe.aReviewedFile
      .with({ kind: "added", path: "dashboard/tests/added.spec.ts" })
      .please(),
    makeMe.aReviewedFile
      .with({ kind: "deleted", path: "dashboard/tests/gone.spec.ts" })
      .please(),
    makeMe.aReviewedFile
      .with({
        kind: "renamed",
        path: "dashboard/tests/renamed.spec.ts",
        oldPath: "tests/old.sh",
      })
      .please(),
  ];
  const entries = ["baseline", "branch", "landed"].map((at) => [
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .holding(
        makeMe.aCiProofEvidence
          .brokenDown(
            {
              path: "dashboard/tests/folder/a.spec.ts",
              passed: at === "branch" ? 2 : 1,
              durationMs:
                at === "baseline" ? 10_000 : at === "branch" ? 17_000 : 14_000,
            },
            {
              path: "dashboard/tests/folder/nested/c.spec.ts",
              passed: 1,
              durationMs: at === "baseline" ? 340 : 410,
            },
            {
              path: "dashboard/tests/root.spec.ts",
              passed: 1,
              durationMs: 1_200,
            },
            ...(at === "baseline"
              ? [
                  {
                    path: "dashboard/tests/gone.spec.ts",
                    passed: 1,
                    durationMs: 500,
                  },
                ]
              : [
                  {
                    path: "dashboard/tests/added.spec.ts",
                    passed: 1,
                    durationMs: 800,
                  },
                  {
                    path: "dashboard/tests/renamed.spec.ts",
                    passed: 1,
                    durationMs: 2_100,
                  },
                ]),
          )
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry
      .at("tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("file")
          .brokenDown(
            { path: "tests/check.sh", passed: 1, durationMs: 500 },
            ...(at === "baseline"
              ? [{ path: "tests/old.sh", passed: 1, durationMs: 2_000 }]
              : []),
          )
          .please(),
      )
      .please(),
  ]);
  return {
    ...facts,
    answer,
    scope: {
      locations: [location],
      changed,
      revision: facts.work.revision,
      selection: { path: location.path, scope: "location" as const },
    },
    entries,
  };
}
