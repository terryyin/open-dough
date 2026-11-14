// Exact owned file declarations preserve other writers' staged and working bytes.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, remoteHeads } from "./publication-test-fixtures.mjs";
import { localFixture } from "./execution-increment-fresh-test-fixtures.mjs";

test("unowned staged content, including content staged by preparation, is preserved and refuses commit", async (t) => {
  const f = await localFixture(t);
  writeFileSync(join(f.workspace, "human.txt"), "human index\n");
  await git(f.workspace, "add", "human.txt");
  const index = (await git(f.workspace, "ls-files", "--stage")).stdout;
  const first = await f.fresh();
  assert.equal(first.result.operation, "staged ownership");
  assert.equal((await git(f.workspace, "ls-files", "--stage")).stdout, index);
  await f.withheld();
  // A separate fixture starts without somebody else's staged content.
  const later = await localFixture(t);
  later.preparation.formatting = {
    command: ["git", "add", "--", "human.txt"],
  };
  writeFileSync(
    join(later.workspace, "human.txt"),
    "newly staged human bytes\n",
  );
  const second = await later.fresh();
  assert.equal(second.result.operation, "staged ownership");
  assert.equal(
    (await git(later.workspace, "show", ":human.txt")).stdout,
    "newly staged human bytes\n",
  );
  assert.equal(
    (await git(later.workspace, "diff", "--cached", "--name-only")).stdout,
    "human.txt\n",
  );
  await later.withheld();
});

test("a generator-created directory cannot broaden exact owned paths into undeclared descendants", async (t) => {
  const f = await localFixture(t);
  f.preparation.staging.ownedPaths.push("generated-dir");
  f.preparation.generation = f.logged(
    "generation",
    "fs.mkdirSync('generated-dir'); fs.writeFileSync('generated-dir/undeclared.txt', 'preserve these bytes\\n');",
  );
  const refused = await f.fresh();
  assert.equal(refused.code, 1);
  assert.equal(refused.result.operation, "staged ownership");
  assert.match(
    refused.result.error,
    /exact files rather than directory generated-dir/,
  );
  assert.equal(
    readFileSync(join(f.workspace, "generated-dir/undeclared.txt"), "utf8"),
    "preserve these bytes\n",
  );
  assert.equal((await git(f.workspace, "diff", "--cached")).stdout, "");
  await f.withheld();
});

test("quick current-branch work preserves ordinary Git authorship, partial staged ownership and unrelated bytes", async (t) => {
  const f = await localFixture(t);
  await git(f.workspace, "add", "work.txt");
  writeFileSync(
    join(f.workspace, "work.txt"),
    "owned work\nhuman unstaged same file\n",
  );
  writeFileSync(join(f.workspace, "human.txt"), "human untracked\n");
  f.preparation.staging = { ownedPaths: [], stagedPaths: ["work.txt"] };
  const peopleBefore = (
    await git(f.workspace, "var", "GIT_AUTHOR_IDENT")
  ).stdout
    .trim()
    .replace(/>.*$/, ">");
  const result = await f.fresh(f.preparation, { mode: "current-branch" });
  assert.equal(result.code, 0);
  assert.equal(result.result.report, "committed-pending-publication");
  assert.equal(result.result.publication, "pending");
  assert.equal(result.result.observation, null);
  assert.equal(
    (await git(f.workspace, "log", "-1", "--format=%an <%ae>")).stdout.trim(),
    peopleBefore,
  );
  assert.equal(
    (await git(f.workspace, "show", "HEAD:work.txt")).stdout,
    "owned work\n",
  );
  assert.equal(
    readFileSync(join(f.workspace, "work.txt"), "utf8"),
    "owned work\nhuman unstaged same file\n",
  );
  assert.equal(
    readFileSync(join(f.workspace, "human.txt"), "utf8"),
    "human untracked\n",
  );
  assert.equal(readFileSync(f.hookLog, "utf8"), "commit\n");
  assert.equal(
    (await git(f.workspace, "log", "-1", "--format=%B")).stdout.includes(
      "Co-authored-by: Developer",
    ),
    false,
  );
  assert.equal(await remoteHeads(f.origin), f.refs);
  assert.equal(existsSync(f.storage), false);
});
