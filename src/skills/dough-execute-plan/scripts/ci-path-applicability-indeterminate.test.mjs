import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { classifyRevisionApplicability } from "./ci-path-applicability.mjs";
import {
  acceptedWorkflow,
  applicableBase,
  commitAll,
  describedRepository,
  git,
} from "./ci-path-applicability-test-fixtures.mjs";

// Conservative fail-closed cases: any evidence gap or ambiguity classifies as
// `indeterminate` rather than an assumed `not_required` reuse.

test("classifyRevisionApplicability: a mixed change (ignored + non-ignored) is indeterminate", async (t) => {
  const {
    repo,
    revisions: { base: shaA, mixed: shaB },
  } = await describedRepository(
    t,
    applicableBase()
      .withRevision("mixed", {
        files: {
          "docs/readme.md": "docs\n",
          "app.js": "console.log('changed');\n",
        },
      })
      .please(),
  );

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: shaB,
    candidateShas: [shaA],
  });
  assert.deepEqual(result, { result: "indeterminate", reason: "mixed-paths" });
});

test("classifyRevisionApplicability: a non-ancestor candidate basis is indeterminate", async (t) => {
  const {
    repo,
    revisions: { base: shaBase, ignored: shaRegistered },
  } = await describedRepository(
    t,
    applicableBase()
      .withRevision("ignored", { files: { ".planning/note.md": "note\n" } })
      .please(),
  );

  await git(repo, "checkout", "-q", "-b", "diverged", shaBase);
  writeFileSync(join(repo, "diverged.js"), "console.log('diverged');\n");
  const shaDiverged = await commitAll(repo, "diverged branch commit");

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
  const {
    repo,
    revisions: { base: shaA, deleted: shaB },
  } = await describedRepository(
    t,
    applicableBase()
      .withRevision("deleted", { remove: ["app.js"] })
      .please(),
  );

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
  const app = `${"x".repeat(200)}\n`;
  const {
    repo,
    revisions: { base: shaA, renamed: shaB },
  } = await describedRepository(
    t,
    applicableBase(acceptedWorkflow, app)
      .withRevision("renamed", {
        remove: ["app.js"],
        files: { "docs/app.js": app },
      })
      .please(),
  );

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
  const {
    repo,
    revisions: { base: shaA, ignored: shaB },
  } = await describedRepository(
    t,
    applicableBase(
      acceptedWorkflow.replace(
        "      - '.planning/**'",
        "      - ${{ env.IGNORED }}",
      ),
    )
      .withRevision("ignored", { files: { ".planning/note.md": "note\n" } })
      .please(),
  );

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
  const {
    repo,
    revisions: { base: shaA },
  } = await describedRepository(t, applicableBase().please());

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
  const {
    repo,
    revisions: { ignored: shaB },
  } = await describedRepository(
    t,
    applicableBase()
      .withRevision("ignored", { files: { ".planning/note.md": "note\n" } })
      .please(),
  );

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
