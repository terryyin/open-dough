// Guidance structure: retained proof survives large output and runner cleanup.
// This observes the published contract, not whether an agent follows it.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../support/markdown-section.mjs";

const skills = fileURLToPath(new URL("../../../src/skills/", import.meta.url));
const read = (path) => readFileSync(join(skills, path), "utf8");
const execute = (path) => read(`dough-execute-plan/${path}`);
const evidence = execute("references/proof-evidence.md");

test("one checkout-bound uncommitted location keeps every proof output until retirement", () => {
  const location = section(evidence, "## Evidence location");
  assert.match(
    location,
    /From the execution checkout, resolve `git rev-parse --git-path open-dough\/evidence`/,
  );
  assert.match(location, /create that directory/);
  assert.match(
    location,
    /logs, exit files, run records\s+and worker reports there, uncommitted and bound to that checkout/,
  );
  assert.match(location, /outside any directory the test runner clears/);
  assert.match(
    location,
    /Preserve the evidence\s+until the checkout is retired/,
  );
  assert.match(location, /fresh name for each run/);
});

test("the run record supplies command, revision and terminal result and identifies continuation", () => {
  const record = section(evidence, "## Read the run record");
  assert.match(
    record,
    /Place `--log` and `--exit-file` in the evidence location/,
  );
  assert.match(record, /`<log>\.run\.json` beside the log/);
  for (const field of [
    "command",
    "revision",
    "uncommittedChanges",
    "startedAt",
    "log",
    "exitFile",
  ]) {
    assert.ok(record.includes(`\`${field}\``), `launch record names ${field}`);
  }
  assert.match(record, /literal command and arguments/);
  assert.match(
    record,
    /After the command ends, it gains `endedAt` and `exitStatus`\s+before the exit file is written/,
  );
  assert.match(
    record,
    /Take the command, revision and terminal result from the record/,
  );
  assert.match(record, /path with the host's supported continuation handle/);
  assert.match(record, /no\s+`exitStatus` has no recorded terminal result yet/);
  assert.match(record, /continue the existing command/);
  assert.match(record, /rather than launching a\s+second run/);
  assert.match(record, /does not replace the host's continuation facility/);
});

test("a decisive artifact is preserved before rerun and survival is tried before expensive diagnosis", () => {
  const artifacts = section(evidence, "## Preserve decisive artifacts");
  assert.match(
    artifacts,
    /decision rests on a diagnostic artifact the runner may remove or\s+overwrite/,
  );
  assert.match(
    artifacts,
    /direct it to the evidence location or copy it there before starting\s+another run/,
  );
  assert.match(
    artifacts,
    /Before an expensive diagnostic run, first confirm on a small run\s+that the artifact survives runner cleanup in that location/,
  );
});

test("large-output retrieval takes only the needed failing assertion or summary", () => {
  const retrieval = section(evidence, "## Read large output selectively");
  assert.match(
    retrieval,
    /Read from the log only the failing assertion or summary needed for the\s+decision/,
  );
  assert.match(retrieval, /\[targeted retrieval\]\(disposable-research\.md\)/);
  assert.match(
    retrieval,
    /Do not load the whole log or rerun the suite to recover\s+the command, revision or result already retained in the run record/,
  );
});

test("run, wait, overdue, expensive-proof and delegation entry points reach the single owner", () => {
  const passages = [
    section(execute("references/oversized-slice.md"), "## Track active time"),
    execute("references/wait-for-proof.md"),
    execute("references/overdue-delegated-verification.md"),
    section(
      execute("references/delegation.md"),
      "## List promises and assign the agent",
    ),
    section(
      read("dough-story-refinement/references/executable-proof.md"),
      "## Choose expensive proof before launch",
    ),
  ];
  for (const passage of passages) {
    assert.match(passage, /\]\([^)]*proof-evidence\.md(?:#[^)]+)?\)/);
  }
  const firstDelegation = execute("SKILL.md")
    .split("\n")
    .find((line) =>
      line.startsWith("| Before first implementation delegation"),
    );
  assert.match(firstDelegation, /\]\(references\/proof-evidence\.md\)/);

  const overdue = execute("references/overdue-delegated-verification.md");
  assert.match(overdue, /run record.*as the retained\s+command identity/);
  assert.match(overdue, /command and revision, the log so far/);
  assert.match(overdue, /whether\s+`exitStatus` is present/);
  assert.match(
    overdue,
    /continue the same command through\s+its supported continuation/,
  );
  assert.match(
    overdue,
    /rather than starting another solely because no\s+terminal status is recorded/,
  );
});
