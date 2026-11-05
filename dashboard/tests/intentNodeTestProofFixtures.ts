// Committed node:test proof for the published Open Dough-like files
// (`./intentNodeTestSourceFixtures.ts`) and the settings declaring their
// `src/skills` location with `runner: "node:test"`, `proof` and
// `proofGeneration`, for `./intent-node-test-proof.spec.ts`: observations
// for the land-rerun describe path, a loop-generated host name kept in the
// snapshot without a row, a parent with folded subtests, a renamed stale
// observation, and a Cucumber-shaped snapshot; plus settings without
// `proof`, with `proof` but no `runner`, and without either.

import { gitBlobSha } from "./listingAnswers.ts";
import {
  hostLoopPath,
  landRerunPath,
  locationPath,
  sources,
  withSubtestsPath,
} from "./intentNodeTestSourceFixtures.ts";

const proofDirectory = "tests/proof";
export const snapshotPath = `${proofDirectory}/latest.json`;
export const generationCommand =
  "RECORD_NODE_TEST_PROOF=1 bash scripts/test.sh <files>";

export const recordedCommit = "bc26ca5f".repeat(5);

type Observation = Record<string, unknown>;

const passed = (
  file: string,
  test: readonly string[],
  fields: {
    readonly durationMs: number;
    readonly finishedAt?: string;
  },
): Observation => {
  const { finishedAt = "2026-11-04T09:00:00.000Z", durationMs } = fields;
  return {
    file,
    test,
    outcome: "passed",
    attempts: 1,
    durationMs,
    finishedAt,
    commit: recordedCommit,
    fileBlob: gitBlobSha(sources[file as keyof typeof sources]),
  };
};

const observations: readonly Observation[] = [
  passed(
    landRerunPath,
    ["land rerun", "keeps resources after a push conflict"],
    {
      durationMs: 120,
    },
  ),
  passed(landRerunPath, ["land rerun", "reruns after resolution once"], {
    durationMs: 80,
  }),
  passed(landRerunPath, ["reports a failed refresh"], {
    durationMs: 45,
  }),
  // Stale: the published file no longer defines this title path.
  passed(landRerunPath, ["land rerun", "renamed away"], {
    durationMs: 9000,
  }),
  // Loop-generated title: stays in the snapshot, no row on the host file.
  passed(hostLoopPath, ["codex: records a focused pass"], {
    durationMs: 15,
  }),
  passed(hostLoopPath, ["listed host check"], {
    durationMs: 20,
  }),
  // Parent observation includes folded subtest duration; subtests themselves
  // are not listed as cases.
  passed(withSubtestsPath, ["parent folds subtests"], {
    durationMs: 23,
  }),
  passed(withSubtestsPath, ["sibling keeps its own row"], {
    durationMs: 18,
  }),
];

const proofFile = (entries: readonly Observation[]) =>
  `${JSON.stringify({ version: 1, observations: entries }, null, 2)}\n`;

export const snapshotFiles = { [snapshotPath]: proofFile(observations) };

// The same snapshot in Cucumber's fields: not valid node:test (Vitest-shaped) proof.
export const cucumberShapedFiles = {
  [snapshotPath]: proofFile(
    observations.map(({ file, test, fileBlob, ...rest }) => ({
      feature: file,
      scenario: (test as string[]).join(" > "),
      featureBlob: fileBlob,
      ...rest,
    })),
  ),
};

const location = {
  path: locationPath,
  kind: "javascript",
  include: ["**/*.test.mjs"],
};

const shellLocation = { path: "scripts", kind: "shell", include: ["*.sh"] };

const settingsOf = (skills: Record<string, unknown>) =>
  JSON.stringify({ intent: { locations: [skills, shellLocation] } }, null, 2);

export const settings = settingsOf({
  ...location,
  runner: "node:test",
  proof: proofDirectory,
  proofGeneration: { command: generationCommand },
});

export const settingsWithoutProof = settingsOf({
  ...location,
  runner: "node:test",
});

export const settingsWithoutRunnerOrProof = settingsOf(location);

export const settingsWithoutRunner = settingsOf({
  ...location,
  proof: proofDirectory,
  proofGeneration: { command: generationCommand },
});
