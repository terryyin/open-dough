// Endpoint proof summaries for Intent Summary CI timing comparison
// (./intentSummaryStoryComparisonFixture.ts): file-breakdown proofs for
// baseline / branch / landed, and a baseline without breakdowns.

import { counts, proofSummary } from "./ciProofArtifacts.ts";
import {
  collectedSummary,
  playwrightRecord,
  type Producer,
} from "./ciProofCollected.ts";
import {
  proofRun,
  type ComparisonProofServe,
} from "./storyCiComparisonEntryProofs.ts";

function dashboardProducer(at: "baseline" | "branch" | "landed"): Producer {
  const aMs = at === "baseline" ? 10_000 : 14_000;
  const cMs = at === "baseline" ? 340 : 410;
  const tests: [string, "expected", number[]][] = [
    ["dashboard/tests/folder/a.spec.ts", "expected", [aMs]],
    ["dashboard/tests/folder/nested/c.spec.ts", "expected", [cMs]],
    ["dashboard/tests/root.spec.ts", "expected", [1_200]],
  ];
  if (at === "baseline") {
    tests.push(["dashboard/tests/gone.spec.ts", "expected", [500]]);
  } else {
    tests.push(["dashboard/tests/added.spec.ts", "expected", [800]]);
    tests.push(["dashboard/tests/renamed.spec.ts", "expected", [2_100]]);
  }
  return {
    entries: ["dashboard/tests"],
    part: 1,
    of: 1,
    byFile: true,
    record: playwrightRecord(tests),
  };
}

function testsProducer(at: "baseline" | "branch" | "landed"): Producer {
  if (at === "baseline") {
    return {
      entries: ["tests"],
      part: 1,
      of: 1,
      byFile: true,
      outcomes: "passed\ttests/old.sh\npassed\ttests/check.sh\n",
      times: "2.0\ttests/old.sh\n0.5\ttests/check.sh\n",
    };
  }
  return {
    entries: ["tests"],
    part: 1,
    of: 1,
    byFile: true,
    outcomes: "passed\ttests/check.sh\n",
    times: "0.5\ttests/check.sh\n",
  };
}

function breakdownSummary(
  runId: number,
  revision: string,
  at: "baseline" | "branch" | "landed",
): string {
  return collectedSummary(
    proofRun(runId, revision),
    [
      ["dashboard/tests", 1],
      ["tests", 1],
    ],
    [dashboardProducer(at), testsProducer(at)],
  );
}

export function breakdownProofs(args: {
  readonly baseline: string;
  readonly branchSide: string;
  readonly completion: string;
}): Record<number, ComparisonProofServe> {
  return {
    101: {
      kind: "summary",
      artifactId: 1001,
      summary: JSON.parse(
        breakdownSummary(101, args.baseline, "baseline"),
      ) as unknown,
    },
    102: {
      kind: "summary",
      artifactId: 1002,
      summary: JSON.parse(
        breakdownSummary(102, args.branchSide, "branch"),
      ) as unknown,
    },
    103: {
      kind: "summary",
      artifactId: 1003,
      summary: JSON.parse(
        breakdownSummary(103, args.completion, "landed"),
      ) as unknown,
    },
  };
}

// Baseline without file breakdowns: entry totals only (as 2026-11-04 summaries).
export function noBreakdownBaselineProofs(args: {
  readonly baseline: string;
  readonly branchSide: string;
  readonly completion: string;
}): Record<number, ComparisonProofServe> {
  const baselineRun = proofRun(101, args.baseline);
  return {
    101: {
      kind: "summary",
      artifactId: 1001,
      summary: proofSummary(
        baselineRun,
        [
          ["dashboard/tests", 1],
          ["tests", 1],
        ],
        [
          ["dashboard/tests", 1, 1, "tests", counts(4), 12_040],
          ["tests", 1, 1, "checks", counts(2), 2_500],
        ],
      ),
    },
    102: {
      kind: "summary",
      artifactId: 1002,
      summary: JSON.parse(
        breakdownSummary(102, args.branchSide, "branch"),
      ) as unknown,
    },
    103: {
      kind: "summary",
      artifactId: 1003,
      summary: JSON.parse(
        breakdownSummary(103, args.completion, "landed"),
      ) as unknown,
    },
  };
}

export function trunkModeProofs(args: {
  readonly baseline: string;
  readonly implementation: string;
}): Record<number, ComparisonProofServe> {
  return {
    200: {
      kind: "summary",
      artifactId: 2001,
      summary: JSON.parse(
        breakdownSummary(200, args.baseline, "baseline"),
      ) as unknown,
    },
    201: {
      kind: "summary",
      artifactId: 2002,
      summary: JSON.parse(
        breakdownSummary(201, args.implementation, "landed"),
      ) as unknown,
    },
  };
}
