// The trunk fixture creates real commits without losing existing facts.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { commitTrunkChanges } from "../../dashboard/tests/support/trunkCommitBatch.ts";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import { makeMe } from "./makeMe.mjs";

test("trunk batches retain pending facts, declared file bytes and their real first-parent chain", async (t) => {
  const repository = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        files: { "staged.txt": "base\n", "run.sh": "old\n" },
        executables: ["run.sh"],
      })
      .please(),
  );
  const project = repository.integration;
  const git = (...args) =>
    execFileSync("git", args, { cwd: project, encoding: "utf8" });
  // These are the pending Git states the construction operation must keep.
  writeFileSync(path.join(project, "staged.txt"), "index\n");
  git("add", "staged.txt");
  writeFileSync(path.join(project, "staged.txt"), "worktree\n");
  writeFileSync(path.join(project, "untracked.txt"), "pending\n");
  // The exact native file/protocol inputs are exercised outside the builder.
  const changes = [
    { message: "First code", file: "first.txt", content: "first\n" },
    { message: "Executable code", file: "run.sh", content: "new\n" },
    { message: "Planning", file: ".planning/plan.md", content: "plan\n" },
    {
      message: "CI workflow",
      file: ".github/workflows/ci.yml",
      content: "name: Checks\n",
    },
    {
      message: "Quoted UTF8 path",
      file: 'quoted "雪"\tfile.txt',
      content: "snow 雪\n",
    },
  ];

  const committed = commitTrunkChanges(project, changes);

  assert.equal(committed.length, 5);
  const [first] = committed;
  assert.ok(first);
  assert.equal(git("show", `${first.revision}:staged.txt`), "worktree\n");
  assert.equal(git("show", `${first.revision}:untracked.txt`), "pending\n");
  assert.equal(git("show", `${first.revision}:run.sh`), "old\n");
  assert.equal(first.parent, repository.trunkSha);
  assert.deepEqual(
    git(
      "rev-list",
      "--first-parent",
      "--reverse",
      `${repository.trunkSha}..HEAD`,
    )
      .trim()
      .split("\n"),
    committed.map(({ revision }) => revision),
  );
  for (const { revision, parent } of committed)
    assert.equal(git("rev-parse", `${revision}^`).trim(), parent);
  for (const { file, content } of changes) {
    assert.equal(git("show", `HEAD:${file}`), content);
    assert.equal(readFileSync(path.join(project, file), "utf8"), content);
  }
  assert.match(git("ls-tree", "HEAD", "run.sh"), /^100755 blob /);
  assert.ok((statSync(path.join(project, "run.sh")).mode & 0o111) !== 0);
  assert.equal(git("status", "--porcelain"), "");
  assert.equal(git("for-each-ref", "refs/dough-fixtures"), "");
});
