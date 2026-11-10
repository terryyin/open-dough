// Timing fields reported by the three GitHub Actions attempts in SEED-256,
// and their comparison fixture across the three endpoints.
import { defaultMixedProofs } from "./storyCiComparisonEntryProofs.ts";
import {
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";

const observed = (
  date: string,
  created: string,
  rows: readonly (readonly [
    name: string,
    start: string,
    end: string,
    created?: string,
  ])[],
) =>
  rows.map(([name, start, end, rowCreated], index) => ({
    id: index + 1,
    name,
    conclusion: "success",
    created_at: `${date}T${rowCreated ?? created}Z`,
    started_at: `${date}T${start}Z`,
    completed_at: `${date}T${end}Z`,
  }));

// Run 42341688832, attempt 1.
export const observedBaselineJobs = observed("2026-11-07", "05:11:50", [
  ["lint", "05:11:52", "05:14:26"],
  ["test (1/3)", "05:11:53", "05:15:20"],
  ["test (2/3)", "05:11:52", "05:14:34"],
  ["test (3/3)", "05:11:52", "05:15:17"],
  ["dashboard (1/12)", "05:11:52", "05:16:06"],
  ["dashboard (2/12)", "05:11:52", "05:15:25"],
  ["dashboard (3/12)", "05:11:52", "05:15:40"],
  ["dashboard (4/12)", "05:11:52", "05:15:40"],
  ["dashboard (5/12)", "05:11:52", "05:15:02"],
  ["dashboard (6/12)", "05:11:52", "05:15:21"],
  ["dashboard (7/12)", "05:11:52", "05:15:56"],
  ["dashboard (8/12)", "05:11:52", "05:15:08"],
  ["dashboard (9/12)", "05:11:52", "05:16:34"],
  ["dashboard (10/12)", "05:11:52", "05:15:34"],
  ["dashboard (11/12)", "05:11:52", "05:15:20"],
  ["dashboard (12/12)", "05:11:52", "05:15:56"],
  ["ci-proof", "05:16:36", "05:16:49", "05:16:34"],
]);

// Run 42346356441, attempt 1.
export const observedBranchJobs = observed("2026-11-07", "06:17:43", [
  ["lint", "06:18:18", "06:20:43"],
  ["test (1/3)", "06:20:14", "06:23:45"],
  ["test (2/3)", "06:19:10", "06:21:21"],
  ["test (3/3)", "06:20:09", "06:23:12"],
  ["dashboard (1/12)", "06:22:05", "06:25:26"],
  ["dashboard (2/12)", "06:18:18", "06:22:26"],
  ["dashboard (3/12)", "06:26:20", "06:30:53"],
  ["dashboard (4/12)", "06:26:16", "06:30:34"],
  ["dashboard (5/12)", "06:23:51", "06:27:39"],
  ["dashboard (6/12)", "06:21:21", "06:25:08"],
  ["dashboard (7/12)", "06:25:28", "06:28:56"],
  ["dashboard (8/12)", "06:23:50", "06:28:09"],
  ["dashboard (9/12)", "06:20:39", "06:25:11"],
  ["dashboard (10/12)", "06:20:08", "06:23:22"],
  ["dashboard (11/12)", "06:23:54", "06:26:58"],
  ["dashboard (12/12)", "06:20:45", "06:23:49"],
  ["ci-proof", "06:30:55", "06:31:09", "06:30:53"],
]);

// Run 42196943419, attempt 2. Rows carried over from attempt 1 retain
// start and completion times earlier than their recorded creation.
export const observedRerunJobs = observed("2026-11-06", "10:05:21", [
  ["lint", "09:41:47", "09:43:22", "10:05:28"],
  ["test (1/3)", "09:41:47", "09:44:46"],
  ["test (2/3)", "09:41:47", "09:44:31"],
  ["test (3/3)", "09:41:47", "09:45:14", "10:05:30"],
  ["dashboard (1/12)", "09:41:47", "09:45:59", "10:05:28"],
  ["dashboard (2/12)", "09:41:47", "09:45:52"],
  ["dashboard (3/12)", "09:41:47", "09:45:11"],
  ["dashboard (4/12)", "09:41:47", "09:45:25"],
  ["dashboard (5/12)", "09:41:48", "09:46:08", "10:05:29"],
  ["dashboard (6/12)", "09:41:47", "09:45:53"],
  ["dashboard (7/12)", "09:41:47", "09:45:55"],
  ["dashboard (8/12)", "09:41:47", "09:45:57"],
  ["dashboard (9/12)", "09:41:47", "09:46:03"],
  ["dashboard (10/12)", "09:41:47", "09:45:28"],
  ["dashboard (11/12)", "09:41:47", "09:45:16"],
  ["dashboard (12/12)", "10:05:23", "10:10:18"],
  ["ci-proof", "10:10:20", "10:10:37", "10:10:18"],
]);

const baselineCreatedAt = "2026-11-07T05:11:50Z";

export function observedFirstAttempts(
  baseline: string,
  branch: string,
  branchRunId: number,
  baselineStartedAt = baselineCreatedAt,
) {
  const baselineRunId = 101;
  return {
    runs: {
      [baseline]: [
        {
          ...wall(
            baseline,
            baselineRunId,
            baselineStartedAt,
            "2026-11-07T05:16:49Z",
          ),
          createdAt: baselineCreatedAt,
        },
      ],
      [branch]: [
        wall(
          branch,
          branchRunId,
          "2026-11-07T06:17:42Z",
          "2026-11-07T06:31:09Z",
        ),
      ],
    },
    jobs: {
      [`${String(baselineRunId)}/1`]: observedBaselineJobs,
      [`${String(branchRunId)}/1`]: observedBranchJobs,
    },
  };
}

export function serveObservedComparisonAttempts(
  setup: StoryCiComparisonSetup,
  landed: "rerun" | "jobs-unavailable" | "running" | "ambiguous",
): void {
  const branch = setup.branchAncestor ?? setup.branchSide;
  const landedRevision = setup.landingMerge ?? setup.completion;
  // A distinct reported start makes the first attempt's own start bound observable.
  const firstAttempts = observedFirstAttempts(
    setup.baseline,
    branch,
    102,
    "2026-11-07T05:11:52Z",
  );
  setup.serveRuns({
    ...firstAttempts.runs,
    [landedRevision]: [
      {
        ...wall(
          landedRevision,
          103,
          "2026-11-06T10:05:19Z",
          "2026-11-06T10:10:38Z",
          undefined,
          landed === "running" ? "in_progress" : "completed",
        ),
        attempt: 2,
        createdAt: "2026-11-06T10:05:20Z",
      },
    ],
  });
  const landedJobs =
    landed === "ambiguous"
      ? [
          ...observedRerunJobs,
          ...observedRerunJobs.slice(0, 1).map((job) => ({ ...job, id: 100 })),
        ]
      : observedRerunJobs;
  setup.serveJobs({
    ...firstAttempts.jobs,
    ...(landed === "rerun" || landed === "ambiguous"
      ? { "103/2": landedJobs }
      : {}),
  });
  setup.serveProofs(
    defaultMixedProofs({
      baseline: setup.baseline,
      branchSide: branch,
      completion: landedRevision,
      landedAttempt: 2,
    }),
  );
}
