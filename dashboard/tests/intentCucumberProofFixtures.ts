// Published Pygardon-like Gherkin features and committed Cucumber proof for
// the Intent Proof journey (`./intent-cucumber-proof.spec.ts`): a full run
// yesterday on the earlier file version, a focused run today on the
// published one, and the same observations as two run files or one
// consolidated file.

import { gitBlobSha } from "./listingAnswers.ts";

export const featurePath = "e2e_test/features/jobs.feature";
export const otherPath = "e2e_test/features/disk_space.feature";
export const proofDirectory = "e2e_test/proof";

const earlierFeature = `Feature: Jobs
  Scenario: List jobs
    Given two jobs
    Then I see two jobs

  Scenario: Cancel a job
    Given a running job
    When I cancel it
    Then it stops

  Scenario Outline: Retry a job after <failure>
    Given a job that failed with <failure>
    Then it is retried <times> times

    Examples:
      | failure | times |
      | timeout | 3     |
      | crash   | 1     |
`;

// Published now: the earlier text with a scenario added at the end.
export const publishedFeature = `${earlierFeature}
  Scenario: Archive a job
    Given a finished job
    When I archive it
    Then it leaves the list
`;

export const otherFeature = `Feature: Disk space
  Scenario: Report free space
    Given a disk
    Then I see its free space
`;

export const yesterdayCommit = "a1b2c3d4".repeat(5);
export const todayCommit = "e5f6a7b8".repeat(5);
const earlierBlob = gitBlobSha(earlierFeature);
const publishedBlob = gitBlobSha(publishedFeature);
type Observation = Record<string, unknown>;

function observed(
  scenario: string,
  fields: {
    readonly example?: readonly string[];
    readonly outcome: string;
    readonly attempts?: number;
    readonly durationMs: number;
    readonly finishedAt: string;
    readonly commit: string;
    readonly featureBlob: string;
    readonly feature?: string;
  },
): Observation {
  const { feature = featurePath, attempts = 1, ...rest } = fields;
  return { feature, scenario, attempts, ...rest };
}

const yesterday = (scenario: string, durationMs: number, example?: string[]) =>
  observed(scenario, {
    ...(example === undefined ? {} : { example }),
    outcome: "passed",
    durationMs,
    finishedAt: "2026-10-31T09:00:00.000Z",
    commit: yesterdayCommit,
    featureBlob: earlierBlob,
  });

// A full run yesterday on the earlier file version: everything passed.
const yesterdayRun = [
  yesterday("List jobs", 1200),
  yesterday("Cancel a job", 800),
  yesterday("Retry a job after <failure>", 2000, ["timeout", "3"]),
  yesterday("Retry a job after <failure>", 350, ["crash", "1"]),
  observed("Report free space", {
    feature: otherPath,
    outcome: "passed",
    durationMs: 90,
    finishedAt: "2026-10-31T09:00:00.000Z",
    commit: yesterdayCommit,
    featureBlob: gitBlobSha(otherFeature),
  }),
];

// A focused run today on the published file version: one scenario now
// fails, and one outline row passed only on retry.
const todayRun = [
  observed("Cancel a job", {
    outcome: "failed",
    durationMs: 65_000,
    finishedAt: "2026-11-01T10:00:00.000Z",
    commit: todayCommit,
    featureBlob: publishedBlob,
  }),
  observed("Retry a job after <failure>", {
    example: ["timeout", "3"],
    outcome: "passed",
    attempts: 2,
    durationMs: 4100,
    finishedAt: "2026-11-01T10:01:00.000Z",
    commit: todayCommit,
    featureBlob: publishedBlob,
  }),
];

const proofFile = (observations: readonly Observation[]) =>
  `${JSON.stringify({ version: 1, observations }, null, 2)}\n`;

export const runFiles = {
  [`${proofDirectory}/20261031T085500Z-worktree-a-4f1c.json`]:
    proofFile(yesterdayRun),
  [`${proofDirectory}/20261101T095900Z-worktree-b-9d2e.json`]:
    proofFile(todayRun),
};

// The same observations consolidated: the latest of each scenario only.
export const consolidatedFiles = {
  [`${proofDirectory}/20261101T110000Z-consolidated-7a3b.json`]: proofFile([
    yesterdayRun[0] as Observation,
    ...todayRun,
    yesterdayRun[3] as Observation,
    yesterdayRun[4] as Observation,
  ]),
};

export const settings = JSON.stringify(
  {
    intent: {
      locations: [
        { path: "e2e_test/features", kind: "gherkin", proof: proofDirectory },
      ],
    },
  },
  null,
  2,
);
