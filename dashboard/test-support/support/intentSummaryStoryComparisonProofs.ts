import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
// Endpoint proof summaries for Intent Summary CI timing comparison
// (./intentSummaryStoryComparisonFixture.ts): file-breakdown proofs for
// baseline / branch / landed, a baseline without breakdowns, and a landed
// proof whose figures hold what no Summary row shows.

import { proofSummaryForEntries } from "./ciProofArtifacts.ts";
import {
  collectedSummary,
  playwrightRecord,
  type Producer,
} from "./ciProofCollected.ts";
import {
  proofRun,
  type ComparisonProofServe,
} from "./storyCiComparisonEntryProofs.ts";

function dashboardTests(
  at: "baseline" | "branch" | "landed",
): [string, "expected", number[]][] {
  const aMs = at === "baseline" ? 10_000 : 14_000;
  const cMs = at === "baseline" ? 340 : 410;
  const tests: [string, "expected", number[]][] = [
    ["dashboard/tests/folder/a.spec.ts", "expected", [aMs]],
    ["dashboard/tests/folder/nested/c.spec.ts", "expected", [cMs]],
    ["dashboard/tests/root.spec.ts", "expected", [1_200]],
  ];
  // Branch measures a second a.spec.ts test, so Branch and Landed differ in
  // count and duration at that file, its folder and the entry.
  if (at === "branch") {
    tests.push(["dashboard/tests/folder/a.spec.ts", "expected", [3_000]]);
  }
  if (at === "baseline") {
    tests.push(["dashboard/tests/gone.spec.ts", "expected", [500]]);
  } else {
    tests.push(["dashboard/tests/added.spec.ts", "expected", [800]]);
    tests.push(["dashboard/tests/renamed.spec.ts", "expected", [2_100]]);
  }
  return tests;
}

function dashboardProducer(at: "baseline" | "branch" | "landed"): Producer {
  return {
    entries: ["dashboard/tests"],
    part: 1,
    of: 1,
    byFile: true,
    record: playwrightRecord(dashboardTests(at)),
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
      unit: "file",
    };
  }
  return {
    entries: ["tests"],
    part: 1,
    of: 1,
    byFile: true,
    outcomes: "passed\ttests/check.sh\n",
    times: "0.5\ttests/check.sh\n",
    unit: "file",
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
      { entry: "dashboard/tests", parts: 1 },
      { entry: "tests", parts: 1 },
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
      summary: JSON.parse(breakdownSummary(101, args.baseline, "baseline")),
    },
    102: {
      kind: "summary",
      artifactId: 1002,
      summary: JSON.parse(breakdownSummary(102, args.branchSide, "branch")),
    },
    103: {
      kind: "summary",
      artifactId: 1003,
      summary: JSON.parse(breakdownSummary(103, args.completion, "landed")),
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
      summary: proofSummaryForEntries(baselineRun, [
        makeMe.aCiProofEntry
          .at("dashboard/tests")
          .counting(4, "case")
          .timed(12_040)
          .please(),
        makeMe.aCiProofEntry
          .at("tests")
          .counting(2, "file")
          .timed(2_500)
          .please(),
      ]),
    },
    102: {
      kind: "summary",
      artifactId: 1002,
      summary: JSON.parse(breakdownSummary(102, args.branchSide, "branch")),
    },
    103: {
      kind: "summary",
      artifactId: 1003,
      summary: JSON.parse(breakdownSummary(103, args.completion, "landed")),
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
      summary: JSON.parse(breakdownSummary(200, args.baseline, "baseline")),
    },
    201: {
      kind: "summary",
      artifactId: 2002,
      summary: JSON.parse(breakdownSummary(201, args.implementation, "landed")),
    },
  };
}

// Landed holds what no Summary row shows: in dashboard/tests a file the tree
// does not list and a second part without a file breakdown, and a tests
// entry without any file breakdown. Baseline and Branch keep breakdowns.
export function outsideLandedProofs(args: {
  readonly baseline: string;
  readonly branchSide: string;
  readonly completion: string;
}): Record<number, ComparisonProofServe> {
  const landed = collectedSummary(
    proofRun(103, args.completion),
    [
      { entry: "dashboard/tests", parts: 2 },
      { entry: "tests", parts: 1 },
    ],
    [
      {
        entries: ["dashboard/tests"],
        part: 1,
        of: 2,
        byFile: true,
        record: playwrightRecord([
          ...dashboardTests("landed"),
          ["dashboard/tests/ghost.spec.ts", "expected", [700]],
        ]),
      },
      {
        entries: ["dashboard/tests"],
        part: 2,
        of: 2,
        byFile: false,
        record: playwrightRecord([
          ["dashboard/tests/folder/a.spec.ts", "expected", [900]],
        ]),
      },
      { ...testsProducer("landed"), byFile: false },
    ],
  );
  return {
    ...breakdownProofs(args),
    103: {
      kind: "summary",
      artifactId: 1003,
      summary: JSON.parse(landed),
    },
  };
}
