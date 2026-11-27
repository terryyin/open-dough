// Each runner owning one group decides its own settings, selection and run
// directory from the environment it is handed: Dashboard Frontend Test
// through its npm group run's settings
// (../../test-support/support/runnerSettings.mjs),
// Dashboard Backend Test and E2E Test through their Playwright configuration
// (../../test-support/support/runnerConfig.mjs), which resolves its group from
// its own location, so a direct config from another working directory decides
// the same. Real runs started beside each other are
// Distribution/tests/test-runner/dashboard-concurrent-runs.sh's.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { browserGroupSelection } from "../../test-support/support/browserTestGroups.mjs";
import {
  groupRunnerExamples,
  type GroupRunnerExample,
} from "../../test-support/support/groupRunnerExamples.ts";
import { focusedRun } from "../../test-support/support/runnerConfig.mjs";
import {
  groupRunSettings,
  runnerVariables,
  vitestRunDirectory,
} from "../../test-support/support/runnerSettings.mjs";
import { selectedFiles } from "../../test-support/support/testFiles.mjs";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import {
  requestRunArtifact,
  startRunArtifacts,
} from "../../test-support/support/runArtifacts.ts";

const records = "/runs";
const startedAt = "2026-11-27T10:00:00.000Z";

// A group's specs as its selection sees them: the target and one other spec,
// and, for a sharded group, a declaration whose first shard claims only the
// other spec, so the target runs in the last.
function groupSpecs({ group, spec }: GroupRunnerExample) {
  const files = [
    path.posix.join(group.root, spec),
    path.posix.join(group.root, "elsewhere/other.spec.ts"),
  ];
  const label = (file: string) =>
    path.posix.join(
      path.relative(repoRoot, fileURLToPath(group.directory)),
      file,
    );
  const declaration = {
    file: ".github/workflows/ci.yml",
    shares: ["1", "2"],
    patterns: new Map([["1", [label(files[1] ?? "")]]]),
  };
  return group.sharded === false ? { files } : { files, declaration };
}

// Every other runner's settings as its CI shard sets them: a share that
// would exclude the target from this runner's own shard, a record, a times
// file and a deadline already passed. Reading any of them would deselect the
// target, write elsewhere or fail the run.
function othersSettings({ group }: GroupRunnerExample) {
  return Object.fromEntries(
    groupRunnerExamples
      .map((other) => other.group.prefix)
      .filter((prefix) => prefix !== group.prefix)
      .flatMap((prefix) => [
        [`${prefix}_SPLIT`, "1/2"],
        [`${prefix}_PROOF_RECORD`, `${records}/${prefix}.json`],
        [`${prefix}_TIMES`, `${records}/${prefix}-times.txt`],
        [`${prefix}_DEADLINE_MS`, "1"],
      ]),
  );
}

// What one run started at `startedAt` as process `pid` decides: the record
// and times it writes, whether it is bounded, the run directory and CI
// report directory it keeps and whether it selects the target spec.
function ownRun(
  runner: GroupRunnerExample,
  env: Record<string, string>,
  pid: number,
) {
  const { group, spec } = runner;
  const specs = groupSpecs(runner);
  const target = path.join(fileURLToPath(group.directory), group.root, spec);
  if (group.config === undefined) {
    const settings = groupRunSettings(group, env);
    return {
      record: settings.proofRecord,
      times: settings.times,
      bounded: settings.deadline !== undefined,
      runDirectory: vitestRunDirectory(group, startedAt, pid),
      report: undefined,
      selected: selectedFiles(group.directory, settings.split, {
        ...browserGroupSelection(group),
        ...specs,
      }).includes(path.join(group.root, spec)),
    };
  }
  const run = focusedRun(
    group,
    {
      ...env,
      [runnerVariables(group.prefix).runStamp]:
        `${startedAt.replaceAll(":", "-")}-${String(pid)}`,
    },
    specs,
  );
  const [[, reporter], html] = run.options.reporter as [
    [string, { proofRecord?: string; times?: string }],
    [string, { outputFolder: string }]?,
  ];
  return {
    record: reporter.proofRecord,
    times: reporter.times,
    bounded: run.options.globalTimeout !== undefined,
    runDirectory: run.options.outputDir,
    report: html?.[1].outputFolder,
    selected: run.testMatch.some((pattern) => pattern.test(target)),
  };
}

test.each(groupRunnerExamples)(
  "$name runs started beside each other each record only their own selection under their own settings in their own run directory",
  (runner) => {
    const { group } = runner;
    const root = path.join(fileURLToPath(group.directory), group.root);
    const ownRecord = `${records}/${group.prefix}-own.json`;
    const env = {
      ...othersSettings(runner),
      [`${group.prefix}_PROOF_RECORD`]: ownRecord,
    };
    // Two runs started in the same millisecond, the second one CI's.
    const [local, ci] = [
      ownRun(runner, env, 1),
      ownRun(runner, { ...env, CI: "true" }, 2),
    ];
    for (const run of [local, ci])
      expect(run).toMatchObject({
        record: ownRecord,
        times: undefined,
        bounded: false,
        selected: true,
      });
    const directories = [local.runDirectory, ci.runDirectory];
    expect(
      directories.map((directory) => path.dirname(directory ?? "")),
    ).toEqual([
      path.join(root, "test-results"),
      path.join(root, "test-results"),
    ]);
    expect(new Set(directories).size).toBe(2);
    // Under CI each Playwright run keeps its HTML report beside its run
    // directory, under its own root's playwright-report/<stamp>/.
    expect([local.report, ci.report]).toEqual([
      undefined,
      group.config === undefined
        ? undefined
        : path.join(
            root,
            "playwright-report",
            path.basename(ci.runDirectory ?? ""),
          ),
    ]);
  },
);

test("a spec asking for an artifact its run's setup does not register fails naming it", async () => {
  const stop = await startRunArtifacts(new Map());
  try {
    await expect(
      requestRunArtifact("unregistered-proof-artifact"),
    ).rejects.toThrow(
      "Could not prepare dashboard artifact unregistered-proof-artifact: this run's setup does not register it.",
    );
  } finally {
    await stop();
  }
});
