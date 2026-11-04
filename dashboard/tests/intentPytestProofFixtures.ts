// Committed pytest proof for the published Pygardon-like files
// (`./intentPytestSourceFixtures.ts`) and the settings declaring their
// `tests` location as a `python` location with that proof and its
// generation command, for the pytest Proof journeys
// (`./intent-pytest-proof.spec.ts`, `./intent-pytest-proof-summary.spec.ts`,
// `./intent-pytest-proof-absent.spec.ts`): one snapshot in which only some
// of a parametrized function's ids passed, a function has no proof, a
// `Test*` class method was observed on an earlier file version, and a
// renamed function keeps a stale observation; the same snapshot in
// Cucumber's fields; and settings without declared proof, beside a
// `frontend/src` typescript location Intent reads no proof for.

import { gitBlobSha } from "./listingAnswers.ts";
import {
  corsPath,
  corsSource,
  earlierCors,
  healthPath,
  healthSource,
  searchFiltersPath,
  searchFiltersSource,
  searchRunFilePath,
  searchRunSource,
  testsPath,
} from "./intentPytestSourceFixtures.ts";

export const proofDirectory = `${testsPath}/proof`;
export const snapshotPath = `${proofDirectory}/latest.json`;
export const generationCommand =
  "RECORD_PYTEST_PROOF=1 nix develop -c scripts/check-worktree.sh pytest";

export const recordedCommit = "a1b2c3d4".repeat(5);
export const earlierCommit = "e5f6a7b8".repeat(5);

type Observation = Record<string, unknown>;

const passed = (
  file: string,
  test: string,
  fields: {
    readonly parameterId?: string;
    readonly durationMs: number;
    readonly fileBlob: string;
    readonly commit?: string;
    readonly finishedAt?: string;
  },
): Observation => {
  const {
    commit = recordedCommit,
    finishedAt = "2026-11-04T09:00:00.000Z",
    ...rest
  } = fields;
  return {
    file,
    test,
    ...rest,
    outcome: "passed",
    attempts: 1,
    finishedAt,
    commit,
  };
};

const corsBlob = gitBlobSha(corsSource);

// One maintained snapshot: `[down]` failed in the last run, so only `[up]`
// and `[even]` of `test_rounding` keep proof, and `test_rejects_unknown_origin`
// has none.
const observations: readonly Observation[] = [
  passed(corsPath, "test_allows_listed_origin", {
    durationMs: 120,
    fileBlob: corsBlob,
  }),
  passed(corsPath, "test_rounding", {
    parameterId: "up",
    durationMs: 2400,
    fileBlob: corsBlob,
  }),
  passed(corsPath, "test_rounding", {
    parameterId: "even",
    durationMs: 80,
    fileBlob: corsBlob,
  }),
  passed(corsPath, "test_preflight", { durationMs: 45, fileBlob: corsBlob }),
  passed(corsPath, "TestCredentials::test_sends_credentials", {
    durationMs: 300,
    fileBlob: gitBlobSha(earlierCors),
    commit: earlierCommit,
    finishedAt: "2026-11-03T12:00:00.000Z",
  }),
  // Renamed since: the published file no longer defines it.
  passed(corsPath, "test_old_origin_name", {
    durationMs: 9000,
    fileBlob: gitBlobSha(earlierCors),
    commit: earlierCommit,
    finishedAt: "2026-11-03T12:00:00.000Z",
  }),
  passed(healthPath, "test_health", {
    durationMs: 30,
    fileBlob: gitBlobSha(healthSource),
  }),
  passed(searchRunFilePath, "test_runs_search", {
    durationMs: 1200,
    fileBlob: gitBlobSha(searchRunSource),
  }),
  passed(searchRunFilePath, "test_runs_twice", {
    parameterId: "a",
    durationMs: 300,
    fileBlob: gitBlobSha(searchRunSource),
  }),
  passed(searchRunFilePath, "test_runs_twice", {
    parameterId: "b",
    durationMs: 500,
    fileBlob: gitBlobSha(searchRunSource),
  }),
  passed(searchFiltersPath, "test_filters", {
    durationMs: 100,
    fileBlob: gitBlobSha(searchFiltersSource),
  }),
];

const proofFile = (entries: readonly Observation[]) =>
  `${JSON.stringify({ version: 1, observations: entries }, null, 2)}\n`;

export const snapshotFiles = { [snapshotPath]: proofFile(observations) };

// The same snapshot in Cucumber's fields: not valid pytest proof.
export const cucumberShapedFiles = {
  [snapshotPath]: proofFile(
    observations.map(({ file, test, parameterId, fileBlob, ...rest }) => ({
      feature: file,
      scenario: test,
      ...(parameterId === undefined ? {} : { example: [parameterId] }),
      featureBlob: fileBlob,
      ...rest,
    })),
  ),
};

const frontendLocation = {
  path: "frontend/src",
  kind: "typescript",
  include: ["**/*.test.ts"],
};

const testsLocation = {
  path: testsPath,
  kind: "python",
  include: ["**/test_*.py"],
};

export const settings = JSON.stringify(
  {
    intent: {
      locations: [
        frontendLocation,
        {
          ...testsLocation,
          proof: proofDirectory,
          proofGeneration: { command: generationCommand },
        },
      ],
    },
  },
  null,
  2,
);

export const settingsWithoutProof = JSON.stringify(
  { intent: { locations: [frontendLocation, testsLocation] } },
  null,
  2,
);
