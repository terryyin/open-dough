import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import { copiedLayer } from "./repository-revision-files.mjs";
import { candidateIdentity } from "./native-admission-reuse.mjs";
import { uncoveredSupervisionRoots } from "./native-supervision-inputs.mjs";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const cli = join(root, "Distribution/tests/support/native-admission-reuse.mjs");
const context = {
  host: "codex",
  version: "controlled-v1",
  model: "controlled-model",
  runtimeSettings: "controlled permissions and settings",
  promptHash: "a".repeat(64),
};
const sourcePathspecs = [
  "Distribution/src",
  "Distribution/tests/support",
  "Distribution/tests/helpers",
  "dashboard/server",
  "dashboard/src",
  "install.sh",
  "VERSION",
  "CHANGELOG.md",
  "package.json",
  "Distribution/tests/git-publication-native.sh",
];
const sourcePaths = spawnSync(
  "git",
  [
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
    "-z",
    "--",
    ...sourcePathspecs,
    ...uncoveredSupervisionRoots(root, sourcePathspecs),
  ],
  { cwd: root, encoding: "utf8" },
);
assert.equal(sourcePaths.status, 0, sourcePaths.stderr);
const sourceLayer = copiedLayer(
  root,
  sourcePaths.stdout.split("\0").filter(Boolean),
);

export async function setup(t, host = "codex") {
  const work = mkdtempSync(join(tmpdir(), "admission-comparison-test."));
  t.after(() => rmSync(work, { recursive: true, force: true }));
  // Required source bytes are an immutable harness layer. The shared
  // repository harness builds it once; every case owns a mutable copy.
  const repository = await materializeLocalCheckout(
    t,
    makeMe.aRepository.withRevision("captured", { backlog: null }).please(),
    { parent: work, layer: sourceLayer, gitTemplates: false },
  );
  const candidate = repository.integration;
  const identity = candidateIdentity(candidate, host);
  const currentContext = { ...context, host };
  const attemptId =
    host === "claude" ? "20261108T072449-17c1" : "20261108T072654-1f30";
  const corpus = join(
    root,
    `Distribution/tests/fixtures/native-streams/${host}/publication/admission-investigation/${attemptId}`,
  );
  const attempt = join(work, "retained");
  mkdirSync(attempt);
  for (const file of ["events.jsonl.gz", "observations.txt", "response.md"])
    cpSync(join(corpus, file), join(attempt, file));
  writeFileSync(join(attempt, "stderr.log"), "");
  writeFileSync(
    join(attempt, "record"),
    makeMe.aNativeEvidenceRecord
      .with({
        host,
        caseId: "publication/admission-investigation",
        sourceRevision: repository.trunkSha,
        identity,
        promptHash: context.promptHash,
        version: context.version,
        model: context.model,
        runtimeSettings: context.runtimeSettings,
      })
      .please(),
  );
  const contextPath = join(work, "context.json");
  writeFileSync(contextPath, JSON.stringify(currentContext));
  return { work, candidate, attempt, identity, contextPath };
}

export function compare(fixture) {
  const run = spawnSync(
    process.execPath,
    [
      cli,
      "--attempt",
      fixture.attempt,
      "--candidate",
      fixture.candidate,
      "--context",
      fixture.contextPath,
    ],
    { encoding: "utf8" },
  );
  assert.equal(run.status, 0, run.stderr);
  return JSON.parse(run.stdout);
}

export const change = (candidate, path, content) =>
  writeFileSync(join(candidate, path), content);
