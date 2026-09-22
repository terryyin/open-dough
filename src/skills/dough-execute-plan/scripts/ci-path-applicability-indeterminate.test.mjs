import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { classifyRevisionApplicability } from "./ci-path-applicability.mjs";
import {
  acceptedWorkflow,
  commitAll,
  exec,
  git,
  initRepo,
  writeWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";

// Conservative fail-closed cases: any evidence gap or ambiguity classifies as
// `indeterminate` rather than an assumed `not_required` reuse.

test("classifyRevisionApplicability: a mixed change (ignored + non-ignored) is indeterminate", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, acceptedWorkflow);
  const shaA = await commitAll(repo, "base");

  await exec("mkdir", ["-p", join(repo, "docs")]);
  writeFileSync(join(repo, "docs", "readme.md"), "docs\n");
  writeFileSync(join(repo, "app.js"), "console.log('changed');\n");
  const shaB = await commitAll(repo, "mixed change");

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: shaB,
    candidateShas: [shaA],
  });
  assert.deepEqual(result, { result: "indeterminate", reason: "mixed-paths" });
});

test("classifyRevisionApplicability: a non-ancestor candidate basis is indeterminate", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, acceptedWorkflow);
  await commitAll(repo, "base");

  await git(repo, "checkout", "-q", "-b", "diverged");
  writeFileSync(join(repo, "diverged.js"), "console.log('diverged');\n");
  const shaDiverged = await commitAll(repo, "diverged branch commit");

  await git(repo, "checkout", "-q", "main");
  await exec("mkdir", ["-p", join(repo, ".planning")]);
  writeFileSync(join(repo, ".planning", "note.md"), "note\n");
  const shaRegistered = await commitAll(repo, "ignored-only on main");

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: shaRegistered,
    candidateShas: [shaDiverged],
  });
  assert.deepEqual(result, {
    result: "indeterminate",
    reason: "no-ancestor-basis",
  });
});

test("classifyRevisionApplicability: deleting a non-ignored path is indeterminate even alone", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, acceptedWorkflow);
  const shaA = await commitAll(repo, "base");

  await exec("rm", [join(repo, "app.js")]);
  const shaB = await commitAll(repo, "delete non-ignored file");

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: shaB,
    candidateShas: [shaA],
  });
  assert.deepEqual(result, {
    result: "indeterminate",
    reason: "non-ignored-delete",
  });
});

test("classifyRevisionApplicability: renaming a non-ignored path into an ignored-looking path is indeterminate", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  writeFileSync(join(repo, "app.js"), `${"x".repeat(200)}\n`);
  writeWorkflow(repo, acceptedWorkflow);
  const shaA = await commitAll(repo, "base");

  await exec("mkdir", ["-p", join(repo, "docs")]);
  await exec("git", ["mv", "app.js", "docs/app.js"], { cwd: repo });
  const shaB = await commitAll(repo, "rename non-ignored path under docs");

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: shaB,
    candidateShas: [shaA],
  });
  assert.deepEqual(result, {
    result: "indeterminate",
    reason: "non-ignored-rename",
  });
});

test("classifyRevisionApplicability: an unsupported workflow policy at the registered revision is indeterminate", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(
    repo,
    acceptedWorkflow.replace(
      "      - '.planning/**'",
      "      - ${{ env.IGNORED }}",
    ),
  );
  const shaA = await commitAll(repo, "unsupported workflow policy");

  await exec("mkdir", ["-p", join(repo, ".planning")]);
  writeFileSync(join(repo, ".planning", "note.md"), "note\n");
  const shaB = await commitAll(repo, "ignored-only change");

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: shaB,
    candidateShas: [shaA],
  });
  assert.deepEqual(result, {
    result: "indeterminate",
    reason: "unsupported-workflow-policy",
  });
});

test("classifyRevisionApplicability: an unreadable registered revision is indeterminate", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, acceptedWorkflow);
  const shaA = await commitAll(repo, "base");

  const bogusSha = "f".repeat(40);
  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: bogusSha,
    candidateShas: [shaA],
  });
  assert.deepEqual(result, {
    result: "indeterminate",
    reason: "unreadable-revision",
  });
});

test("classifyRevisionApplicability: no candidate SHAs at all is indeterminate", async (t) => {
  const repo = await initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, acceptedWorkflow);
  await commitAll(repo, "base");

  await exec("mkdir", ["-p", join(repo, ".planning")]);
  writeFileSync(join(repo, ".planning", "note.md"), "note\n");
  const shaB = await commitAll(repo, "ignored-only change");

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: shaB,
    candidateShas: [],
  });
  assert.deepEqual(result, {
    result: "indeterminate",
    reason: "no-ancestor-basis",
  });
});
