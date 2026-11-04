// Committed Playwright proof for the published Open Dough-like files
// (`./intentPlaywrightSourceFixtures.ts`) and the settings declaring their
// `dashboard/tests` location with `runner: "playwright"`, `proof` and
// `proofGeneration`, for `./intent-playwright-proof.spec.ts`: observations
// for the board spec's describe paths, a loop-generated quiet name kept in
// the snapshot without a row, a helper-defined case under the boundary file,
// a renamed stale observation, and a Cucumber-shaped snapshot; plus settings
// without `proof` and with `proof` but no `runner`.

import { gitBlobSha } from "./listingAnswers.ts";
import {
  boardPath,
  helperCasePath,
  locationPath,
  quietPath,
  sources,
} from "./intentPlaywrightSourceFixtures.ts";

const proofDirectory = `${locationPath}/proof`;
export const snapshotPath = `${proofDirectory}/latest.json`;
export const generationCommand =
  "RECORD_PLAYWRIGHT_PROOF=1 npm run --silent test:dashboard -- <files>";

export const recordedCommit = "c0ffee12".repeat(5);

type Observation = Record<string, unknown>;

const passed = (
  file: string,
  test: readonly string[],
  fields: {
    readonly durationMs: number;
    readonly attempts?: number;
    readonly finishedAt?: string;
  },
): Observation => {
  const {
    attempts = 1,
    finishedAt = "2026-11-04T09:00:00.000Z",
    durationMs,
  } = fields;
  return {
    file,
    test,
    outcome: "passed",
    attempts,
    durationMs,
    finishedAt,
    commit: recordedCommit,
    fileBlob: gitBlobSha(sources[file as keyof typeof sources]),
  };
};

const observations: readonly Observation[] = [
  passed(boardPath, ["touch reading", "keeps a long story readable"], {
    durationMs: 120,
  }),
  passed(boardPath, ["touch reading", "selects detail through rotation"], {
    durationMs: 80,
  }),
  passed(boardPath, ["rotation order", "visits the first column"], {
    durationMs: 45,
  }),
  passed(boardPath, ["opens the board from the tree"], {
    durationMs: 30,
  }),
  // Stale: the published file no longer defines this title path.
  passed(boardPath, ["touch reading", "renamed away"], {
    durationMs: 9000,
  }),
  // Loop-generated title: stays in the snapshot, no row on the quiet file.
  passed(quietPath, ["quiet pass for alpha"], {
    durationMs: 15,
  }),
  passed(quietPath, ["listed quiet check"], {
    durationMs: 20,
  }),
  // Helper-defined case recorded under the boundary file; the published
  // source lists only its own top-level test.
  passed(helperCasePath, ["helper defined elsewhere"], {
    durationMs: 25,
  }),
  passed(helperCasePath, ["boundary keeps helper proof unlisted"], {
    durationMs: 18,
  }),
];

const proofFile = (entries: readonly Observation[]) =>
  `${JSON.stringify({ version: 1, observations: entries }, null, 2)}\n`;

export const snapshotFiles = { [snapshotPath]: proofFile(observations) };

// The same snapshot in Cucumber's fields: not valid Playwright (Vitest-shaped) proof.
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
  kind: "typescript",
  include: ["**/*.spec.ts"],
};

const shellLocation = { path: "scripts", kind: "shell", include: ["*.sh"] };

const settingsOf = (dashboard: Record<string, unknown>) =>
  JSON.stringify(
    { intent: { locations: [dashboard, shellLocation] } },
    null,
    2,
  );

export const settings = settingsOf({
  ...location,
  runner: "playwright",
  proof: proofDirectory,
  proofGeneration: { command: generationCommand },
});

export const settingsWithoutProof = settingsOf({
  ...location,
  runner: "playwright",
});

export const settingsWithoutRunner = settingsOf({
  ...location,
  proof: proofDirectory,
  proofGeneration: { command: generationCommand },
});
