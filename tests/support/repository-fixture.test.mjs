import assert from "node:assert/strict";
import { test } from "node:test";
import {
  exec,
  git,
} from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "./makeMe.mjs";
import { cli } from "./product-backlog-fixture.mjs";
import { materializeRepository } from "./repository-fixture.mjs";

test("the default repository has one main commit with an empty backlog the CLI reads", async (t) => {
  const { origin, integration, cleanup } = await materializeRepository(
    makeMe.aRepository.please(),
  );
  t.after(cleanup);

  assert.equal(
    (await git(origin, "rev-parse", "--is-bare-repository")).stdout.trim(),
    "true",
  );
  assert.equal(
    (await git(origin, "symbolic-ref", "HEAD")).stdout.trim(),
    "refs/heads/main",
  );
  assert.equal(
    (await git(origin, "rev-list", "--count", "main")).stdout.trim(),
    "1",
  );
  const { stdout } = await exec(process.execPath, [cli, "adopt", "--all"], {
    cwd: integration,
  });
  assert.match(stdout, /All 0 active entries already record their identity/);
});

test("a workspace suffix is committed on its branch beside an origin that holds only the trunk", async (t) => {
  const developer = { name: "Workspace Developer", email: "dev@example.test" };
  const author = { name: "Suffix Author", email: "author@example.test" };
  const {
    origin,
    integration,
    execution,
    trunkSha,
    candidateSha,
    revisions,
    cleanup,
  } = await materializeRepository(
    makeMe.aRepository
      .withTrunkBranch("trunk")
      .withRevision("start", { files: { "trunk.txt": "base\n" } })
      .withWorkspace("exec/story", { from: "start" })
      .withUnpublishedRevision("increment", {
        files: { "increment.txt": "increment\n" },
        remove: ["trunk.txt"],
        message: "verified increment",
        author,
        committer: developer,
      })
      .please(),
  );
  t.after(cleanup);
  const read = async (checkout, ...args) =>
    (await git(checkout, ...args)).stdout.trim();

  assert.equal(revisions.start, trunkSha);
  assert.equal(revisions.increment, candidateSha);
  assert.equal(await read(origin, "rev-parse", "refs/heads/trunk"), trunkSha);
  assert.equal(
    await read(origin, "for-each-ref", "--format=%(refname)"),
    "refs/heads/trunk",
  );
  assert.equal(await read(integration, "rev-parse", "HEAD"), trunkSha);
  assert.equal(await read(execution, "branch", "--show-current"), "exec/story");
  assert.equal(await read(execution, "rev-parse", "HEAD"), candidateSha);
  assert.equal(await read(execution, "rev-parse", "HEAD^"), trunkSha);
  assert.equal(
    await read(execution, "log", "-1", "--format=%an <%ae>|%cn <%ce>|%s"),
    "Suffix Author <author@example.test>|Workspace Developer <dev@example.test>|verified increment",
  );
  assert.equal(
    await read(execution, "diff", "--name-status", "HEAD^", "HEAD"),
    "A\tincrement.txt\nD\ttrunk.txt",
  );
  await assert.rejects(git(origin, "cat-file", "-e", candidateSha));
});

test("each copy of a described workspace is its own worktree whose later commits carry the declared checkout identity", async (t) => {
  const developer = {
    name: "Execution Worktree",
    email: "execution@example.test",
  };
  const description = makeMe.aRepository
    .withRevision("trunk")
    .withWorkspace("exec/story", { from: "trunk", checkoutIdentity: developer })
    .withUnpublishedRevision("increment", {
      files: { "increment.txt": "increment\n" },
    })
    .please();
  const first = await materializeRepository(description);
  t.after(first.cleanup);
  const second = await materializeRepository(description);
  t.after(second.cleanup);
  const read = async (checkout, ...args) =>
    (await git(checkout, ...args)).stdout.trim();

  await git(first.execution, "commit", "--allow-empty", "-m", "later work");

  assert.equal(
    await read(first.execution, "log", "-1", "--format=%cn <%ce>"),
    "Execution Worktree <execution@example.test>",
  );
  assert.equal(
    await read(second.execution, "rev-parse", "HEAD"),
    second.candidateSha,
  );
  for (const copy of [first, second])
    assert.equal(
      await read(copy.integration, "worktree", "list", "--porcelain"),
      [
        `worktree ${copy.integration}`,
        `HEAD ${copy.trunkSha}`,
        "branch refs/heads/main",
        "",
        `worktree ${copy.execution}`,
        `HEAD ${await read(copy.execution, "rev-parse", "HEAD")}`,
        "branch refs/heads/exec/story",
      ].join("\n"),
    );
});
