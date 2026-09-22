import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  classifyRevisionApplicability,
  readWorkflowContentAtRevision,
} from "./ci-path-applicability.mjs";
import {
  acceptedWorkflow,
  commitAll,
  exec,
  initRepo,
  writeWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";

test("classifyRevisionApplicability: an ignored-only descendant is not_required with the applicable ancestor as basis", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, acceptedWorkflow);
  const shaA = await commitAll(repo, "base code and workflow");

  // Ignored-only descendant: only .planning/** and docs/** change.
  await exec("mkdir", ["-p", join(repo, ".planning")]);
  writeFileSync(join(repo, ".planning", "note.md"), "note\n");
  await exec("mkdir", ["-p", join(repo, "docs")]);
  writeFileSync(join(repo, "docs", "readme.md"), "docs\n");
  const shaB = await commitAll(repo, "ignored-only change");

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: shaB,
    candidateShas: [shaA],
  });
  assert.deepEqual(result, { result: "not_required", basis: { sha: shaA } });
});

test("classifyRevisionApplicability: a clean non-ignored change is required", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, acceptedWorkflow);
  const shaA = await commitAll(repo, "base");

  writeFileSync(join(repo, "app.js"), "console.log('changed');\n");
  const shaB = await commitAll(repo, "code-only change");

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: shaB,
    candidateShas: [shaA],
  });
  assert.deepEqual(result, { result: "required" });
});

test("classifyRevisionApplicability: an event trigger without any paths-ignore filter is always required", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  const noFilterWorkflow = [
    "name: CI",
    "",
    "on:",
    "  push:",
    "  pull_request:",
    "  workflow_dispatch:",
    "",
    "jobs:",
    "  check:",
    "    runs-on: ubuntu-24.04",
    "",
  ].join("\n");
  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, noFilterWorkflow);
  const shaA = await commitAll(repo, "base");

  await exec("mkdir", ["-p", join(repo, ".planning")]);
  writeFileSync(join(repo, ".planning", "note.md"), "note\n");
  const shaB = await commitAll(repo, "ignored-shaped change, but no filter");

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: shaB,
    candidateShas: [shaA],
  });
  assert.deepEqual(result, { result: "required" });
});

test("readWorkflowContentAtRevision reads the workflow text at a named revision and returns null when unreadable", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, acceptedWorkflow);
  const shaA = await commitAll(repo, "base");

  assert.equal(readWorkflowContentAtRevision(repo, shaA), acceptedWorkflow);
  assert.equal(readWorkflowContentAtRevision(repo, "f".repeat(40)), null);
  assert.equal(
    readWorkflowContentAtRevision(repo, shaA, "missing/path.yml"),
    null,
  );
});
