import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { appendedRecords } from "../../tests/support/appendedRecords.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  proofDirectory,
  readProof,
  removeProofDirectories,
  startProofRun,
} from "../../tests/support/proofRecordRun.ts";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";
import { startOriginArtifactKey } from "../../tests/support/startOriginPreparation.ts";

test.afterEach(removeProofDirectories);

test("a failed Git preparation cannot remove a different completed layout", async () => {
  const directory = proofDirectory();
  const trace = path.join(directory, "artifacts.jsonl");
  const git = path.join(directory, "git");
  writeFileSync(
    git,
    [
      "#!/bin/sh",
      "set -eu",
      'if [ "$1" = clone ] && [ "$2" = --bare ] && [ "$3" = --no-local ]; then',
      '  case "$5" in',
      "    */codex)",
      '      mkdir "$5"',
      '      touch "$5/partial"',
      '      printf "%s\\n" "$5" > "$DOUGH_ARTIFACT_PROOF_BROKEN_ORIGIN"',
      "      ;;",
      "  esac",
      "fi",
      'exec "$DOUGH_ARTIFACT_PROOF_REAL_GIT" "$@"',
      "",
    ].join("\n"),
    { mode: 0o755 },
  );
  const run = startProofRun({
    directory,
    spec: "origins.proof.ts",
    config: {
      testDir: path.join(repoRoot, "dashboard/tests/fixtures/artifact-demand"),
      globalSetup: path.join(
        repoRoot,
        "dashboard/tests/support/globalSetup.ts",
      ),
    },
    env: {
      PATH: [directory, process.env["PATH"]].join(path.delimiter),
      LC_ALL: "C",
      DOUGH_ARTIFACT_PROOF_REAL_GIT: execFileSync("which", ["git"], {
        encoding: "utf8",
      }).trim(),
      DOUGH_ARTIFACT_PROOF_BROKEN_ORIGIN: path.join(directory, "broken-origin"),
      OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE: trace,
    },
  });
  try {
    const result = await run.result;
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
    const proof = readProof(run.recordPath);
    expect(proof.selectedCount).toBe(1);
    expect(proof.terminal?.strictStatus).toBe("passed");
    const events = appendedRecords<{
      event: string;
      key: string;
      directory?: string;
    }>(readFileSync(trace, "utf8"));
    // The run also prepares the story-columns history at its start; this case
    // observes the installed origin layouts.
    const claude = startOriginArtifactKey("claude");
    const codex = startOriginArtifactKey("codex");
    const layouts = events.filter(({ key }) => key === claude || key === codex);
    const started = layouts.filter(({ event }) => event === "start");
    expect(started.map(({ key }) => key)).toEqual([claude, codex]);
    const paths = started.flatMap((entry) => entry.directory ?? []);
    expect(new Set(paths).size).toBe(2);
    expect(paths.map((artifactPath) => existsSync(artifactPath))).toEqual([
      false,
      false,
    ]);
    expect(
      layouts.filter(({ event }) => event === "complete").map(({ key }) => key),
    ).toEqual([claude]);
  } finally {
    await run.stop();
  }
});
