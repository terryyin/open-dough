import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import {
  classifyPathChanges,
  classifyRevisionApplicability,
  parseDiffNameStatus,
  readWorkflowContentAtRevision,
} from "./ci-path-applicability.mjs";
import {
  acceptedWorkflow,
  allBranchesWorkflow,
  applicableBase,
  describedRepository,
  workflowPath,
} from "./ci-path-applicability-test-fixtures.mjs";

const ignoredOnly = [".planning/**", "docs/**"];

test("classifyPathChanges: ignored-only rows are not_required", () => {
  assert.deepEqual(
    classifyPathChanges(
      [
        ["A", ".planning/note.md"],
        ["M", "docs/readme.md"],
      ],
      ignoredOnly,
    ),
    { verdict: "not_required" },
  );
});

test("classifyPathChanges: a clean non-ignored change is required", () => {
  assert.deepEqual(classifyPathChanges([["M", "app.js"]], ignoredOnly), {
    verdict: "required",
  });
});

test("classifyPathChanges: mixed ignored and non-ignored is indeterminate", () => {
  assert.deepEqual(
    classifyPathChanges(
      [
        ["A", ".planning/note.md"],
        ["M", "app.js"],
      ],
      ignoredOnly,
    ),
    { verdict: "indeterminate", reason: "mixed-paths" },
  );
});

test("classifyPathChanges: a null entry list is unreadable-diff", () => {
  assert.deepEqual(classifyPathChanges(null, ignoredOnly), {
    verdict: "indeterminate",
    reason: "unreadable-diff",
  });
});

test("parseDiffNameStatus splits name-status -M stdout", () => {
  assert.deepEqual(parseDiffNameStatus("A\t.planning/note.md\nM\tapp.js\n"), [
    ["A", ".planning/note.md"],
    ["M", "app.js"],
  ]);
  assert.deepEqual(parseDiffNameStatus(""), []);
});

test("classifyRevisionApplicability: an ignored-only descendant is not_required with the applicable ancestor as basis", async (t) => {
  // Ignored-only descendant: only .planning/** and docs/** change.
  const { repo, revisions } = await describedRepository(
    t,
    applicableBase()
      .withRevision("ignored", {
        files: { ".planning/note.md": "note\n", "docs/readme.md": "docs\n" },
      })
      .please(),
  );

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: revisions.ignored,
    candidateShas: [revisions.base],
  });
  assert.deepEqual(result, {
    result: "not_required",
    basis: { sha: revisions.base },
  });
});

test("classifyRevisionApplicability: a clean non-ignored change is required", async (t) => {
  const { repo, revisions } = await describedRepository(
    t,
    applicableBase()
      .withRevision("code", {
        files: { "app.js": "console.log('changed');\n" },
      })
      .please(),
  );

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: revisions.code,
    candidateShas: [revisions.base],
  });
  assert.deepEqual(result, { result: "required" });
});

test("classifyRevisionApplicability: an event trigger without any paths-ignore filter is always required", async (t) => {
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
  const { repo, revisions } = await describedRepository(
    t,
    applicableBase(noFilterWorkflow)
      .withRevision("ignoredShaped", {
        files: { ".planning/note.md": "note\n" },
      })
      .please(),
  );

  const result = classifyRevisionApplicability({
    repoDir: repo,
    event: "push",
    registeredSha: revisions.ignoredShaped,
    candidateShas: [revisions.base],
  });
  assert.deepEqual(result, { result: "required" });
});

test("readWorkflowContentAtRevision reads the workflow text at a named revision and returns null when unreadable", async (t) => {
  const { repo, revisions } = await describedRepository(
    t,
    applicableBase(acceptedWorkflow).please(),
  );
  const shaA = revisions.base;

  assert.equal(readWorkflowContentAtRevision(repo, shaA), acceptedWorkflow);
  assert.equal(readWorkflowContentAtRevision(repo, "f".repeat(40)), null);
  assert.equal(
    readWorkflowContentAtRevision(repo, shaA, "missing/path.yml"),
    null,
  );
});

for (const paths of [[".planning"], ["docs"], [".planning", "docs"], ["src"]]) {
  test(`all-branches push policy classifies changes under ${paths.join(" and ")} using ancestor evidence`, async (t) => {
    const { repo, revisions } = await describedRepository(
      t,
      makeMe.aRepository
        .withRevision("workflow", {
          backlog: undefined,
          files: { [workflowPath]: allBranchesWorkflow },
        })
        .withRevision("change", {
          files: Object.fromEntries(
            paths.map((path) => [`${path}/note.md`, "changed\n"]),
          ),
        })
        .please(),
    );
    const ancestor = revisions.workflow;
    const registeredSha = revisions.change;
    assert.deepEqual(
      classifyRevisionApplicability({
        repoDir: repo,
        event: "push",
        registeredSha,
        candidateShas: [ancestor],
      }),
      paths.includes("src")
        ? { result: "required" }
        : { result: "not_required", basis: { sha: ancestor } },
    );
    assert.deepEqual(
      classifyRevisionApplicability({
        repoDir: repo,
        event: "push",
        registeredSha,
        candidateShas: [],
      }),
      { result: "indeterminate", reason: "no-ancestor-basis" },
    );
  });
}
