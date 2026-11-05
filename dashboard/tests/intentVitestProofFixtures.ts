// Committed Vitest proof for the published Doughnut-like files
// (`./intentVitestSourceFixtures.ts`) and the settings declaring their
// `frontend/tests` location as a `typescript` location with `runner:
// "vitest"`, `proof` and `proofGeneration`, for the Vitest Proof journeys
// (`./intent-vitest-proof.spec.ts`, `./intent-vitest-proof-summary.spec.ts`,
// `./intent-vitest-proof-absent.spec.ts`): one snapshot holding the `%s`
// template's observations in reverse code-point order, the touch spec's
// under `chromium-touch`, the two-project spec's with `chromium-touch` first,
// and a renamed test's stale observation, with no proof for "formats an
// empty pattern"; a pytest-shaped snapshot, and settings without `proof`,
// with `proof` but no `runner`, and with a runner Intent reads no proof for,
// each beside a `shell` location.

import { gitBlobSha } from "./listingAnswers.ts";
import {
  datesPath,
  locationPath,
  sources,
  titlePatternPath,
  toolbarPath,
  touchPath,
} from "./intentVitestSourceFixtures.ts";

const proofDirectory = `${locationPath}/proof`;
export const snapshotPath = `${proofDirectory}/latest.json`;
export const generationCommand =
  "RECORD_VITEST_PROOF=1 ./scripts/run.sh pnpm -C frontend test";

export const recordedCommit = "f08c51e4".repeat(5);
export const earlierCommit = "e5f6a7b8".repeat(5);

type Observation = Record<string, unknown>;

const passed = (
  file: string,
  test: readonly string[],
  fields: {
    readonly project?: string;
    readonly durationMs: number;
    readonly attempts?: number;
    readonly commit?: string;
    readonly finishedAt?: string;
  },
): Observation => {
  const {
    project,
    attempts = 1,
    commit = recordedCommit,
    finishedAt = "2026-11-04T09:00:00.000Z",
    durationMs,
  } = fields;
  return {
    file,
    test,
    ...(project === undefined ? {} : { project }),
    outcome: "passed",
    attempts,
    durationMs,
    finishedAt,
    commit,
    fileBlob: gitBlobSha(sources[file as keyof typeof sources]),
  };
};

const title = (...names: string[]) => ["renderTitleFromPattern", ...names];
const chromium = "chromium";
const touch = "chromium-touch";

// One maintained snapshot: the `%s` template's observations in reverse
// code-point order, a both-project spec with `chromium-touch` first, and a
// renamed test's stale observation; "formats an empty pattern" has none.
const observations: readonly Observation[] = [
  passed(titlePatternPath, title("replaces {{date}} with yyyy-MM-dd"), {
    project: chromium,
    durationMs: 120,
  }),
  passed(
    titlePatternPath,
    title("unknown placeholders", "leaves them unchanged"),
    { project: chromium, durationMs: 30 },
  ),
  passed(titlePatternPath, title("renders émile titles"), {
    project: chromium,
    durationMs: 2400,
  }),
  passed(titlePatternPath, title("renders alpha titles"), {
    project: chromium,
    durationMs: 80,
  }),
  passed(titlePatternPath, title("renders Beta titles"), {
    project: chromium,
    durationMs: 45,
  }),
  passed(titlePatternPath, title("renders equivalent escapes"), {
    project: chromium,
    durationMs: 300,
    attempts: 2,
  }),
  // Renamed since: the published file no longer defines it.
  passed(titlePatternPath, title("replaces {{date}} with ISO dates"), {
    project: chromium,
    durationMs: 9000,
  }),
  passed(datesPath, ["formatDate", "pads months"], {
    project: chromium,
    durationMs: 10.4,
  }),
  passed(datesPath, ["formatDate", "pads days"], {
    project: chromium,
    durationMs: 19.6,
  }),
  passed(datesPath, ["formatDate", "pads years"], {
    project: chromium,
    durationMs: 30,
  }),
  passed(
    touchPath,
    ["Donut menu touch search", "prepares input synchronously from Search"],
    {
      project: touch,
      durationMs: 15,
    },
  ),
  passed(
    touchPath,
    [
      "Donut menu touch search",
      "prepares input synchronously from Open search",
    ],
    {
      project: touch,
      durationMs: 50,
    },
  ),
  passed(toolbarPath, ["Toolbar", "opens the menu"], {
    project: touch,
    durationMs: 250,
    commit: earlierCommit,
    finishedAt: "2026-11-03T12:00:00.000Z",
  }),
  passed(toolbarPath, ["Toolbar", "opens the menu"], {
    project: chromium,
    durationMs: 200,
  }),
  passed(toolbarPath, ["Toolbar", "closes on escape"], {
    project: touch,
    durationMs: 70,
  }),
  passed(toolbarPath, ["Toolbar", "closes on escape"], {
    project: chromium,
    durationMs: 60,
  }),
];

const proofFile = (entries: readonly Observation[]) =>
  `${JSON.stringify({ version: 1, observations: entries }, null, 2)}\n`;

export const snapshotFiles = { [snapshotPath]: proofFile(observations) };

// The same snapshot in pytest's fields: not valid Vitest proof.
export const pytestShapedFiles = {
  [snapshotPath]: proofFile(
    observations.map(({ test, project, ...rest }) => ({
      ...rest,
      test: (test as string[]).join("::"),
      ...(project === undefined ? {} : { parameterId: project }),
    })),
  ),
};

const location = {
  path: locationPath,
  kind: "typescript",
  include: ["**/*.spec.ts"],
};

const shellLocation = { path: "scripts", kind: "shell", include: ["*.sh"] };

const settingsOf = (frontend: Record<string, unknown>) =>
  JSON.stringify({ intent: { locations: [frontend, shellLocation] } }, null, 2);

export const settings = settingsOf({
  ...location,
  runner: "vitest",
  proof: proofDirectory,
  proofGeneration: { command: generationCommand },
});

export const settingsWithoutProof = settingsOf(location);

export const settingsWithoutRunner = settingsOf({
  ...location,
  proof: proofDirectory,
  proofGeneration: { command: generationCommand },
});

export const settingsWithUnreadRunner = settingsOf({
  ...location,
  runner: "jest",
  proof: proofDirectory,
});
