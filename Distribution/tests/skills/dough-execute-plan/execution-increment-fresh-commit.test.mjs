// Commit refusal and prerequisite repair keep owned work available for retry.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, revParse } from "./publication-test-fixtures.mjs";
import { localFixture } from "./execution-increment-fresh-test-fixtures.mjs";

test("staged whitespace refusal retains the index and repairing it permits the same owned work", async (t) => {
  const f = await localFixture(t);
  writeFileSync(join(f.workspace, "work.txt"), "trailing whitespace \n");
  const refused = await f.fresh();
  assert.equal(refused.result.operation, "staged whitespace");
  assert.equal(refused.result.code, 2);
  assert.equal(
    (await git(f.workspace, "show", ":work.txt")).stdout,
    "trailing whitespace \n",
  );
  await f.withheld();
  writeFileSync(join(f.workspace, "work.txt"), "repaired\n");
  const repaired = await f.fresh();
  assert.equal(repaired.code, 0);
  assert.equal(repaired.result.commit.sha, await revParse(f.workspace, "HEAD"));
  assert.equal(
    (await git(f.workspace, "show", "HEAD:work.txt")).stdout,
    "repaired\n",
  );
  assert.equal(readFileSync(f.hookLog, "utf8"), "commit\n");
  assert.equal(existsSync(f.storage), false);
});

test("rejecting project hook and Git refusal retain HEAD and staged recovery without publication", async (t) => {
  const f = await localFixture(t);
  writeFileSync(
    f.hook,
    `#!/bin/sh\nprintf 'commit\\n' >> '${f.hookLog}'\nexit 1\n`,
    { mode: 0o755 },
  );
  let attempt = await f.fresh();
  assert.equal(attempt.result.status, "commit-failed");
  await f.withheld({ hookCalled: true });
  const index = (await git(f.workspace, "ls-files", "--stage")).stdout;
  writeFileSync(f.hook, `#!/bin/sh\nprintf 'commit\\n' >> '${f.hookLog}'\n`, {
    mode: 0o755,
  });
  await git(f.workspace, "config", "commit.gpgsign", "true");
  await git(
    f.workspace,
    "config",
    "gpg.program",
    join(f.fixture, "absent-signing-program"),
  );
  attempt = await f.fresh();
  assert.equal(attempt.result.status, "commit-failed");
  assert.match(attempt.result.error, /gpg|signing|cannot run/);
  assert.equal((await git(f.workspace, "ls-files", "--stage")).stdout, index);
  assert.equal(
    (await git(f.workspace, "show", ":work.txt")).stdout,
    "owned work\n",
  );
  await f.withheld({ hookCalled: true });
  assert.equal(readFileSync(f.hookLog, "utf8"), "commit\ncommit\n");
});

test("a project hook that rejects before Git reads the message reports commit-failed instead of crashing", async (t) => {
  const f = await localFixture(t);
  writeFileSync(
    f.hook,
    `#!/bin/sh\nprintf 'commit\\n' >> '${f.hookLog}'\nexit 1\n`,
    { mode: 0o755 },
  );
  // Larger than a pipe buffer, so Git exits before the whole message is sent.
  const attempt = await f.fresh(f.preparation, {
    commitMessage: `Guarded work\n\n${"unread message body\n".repeat(1 << 14)}`,
  });
  assert.equal(attempt.result.status, "commit-failed");
  assert.equal(attempt.result.operation, "commit");
  await f.withheld({ hookCalled: true });
});

test("failed preparation repair reruns the required operation and never needs a fabricated plan", async (t) => {
  const f = await localFixture(t);
  f.preparation.formatting = f.logged(
    "failed format",
    "fs.writeFileSync('work.txt', 'retained\\n'); process.exit(8);",
  );
  assert.equal((await f.fresh()).code, 1);
  await f.withheld();
  f.preparation.formatting = f.logged(
    "repaired format",
    "fs.writeFileSync('work.txt', 'repaired retained\\n');",
  );
  const repaired = await f.fresh();
  assert.equal(repaired.code, 0);
  assert.equal(
    readFileSync(f.operations, "utf8"),
    "failed format\nrepaired format\n",
  );
  assert.equal(
    (await git(f.workspace, "show", "HEAD:work.txt")).stdout,
    "repaired retained\n",
  );
  assert.equal(
    (
      await git(f.workspace, "rev-list", "--count", `${f.before}..HEAD`)
    ).stdout.trim(),
    "1",
  );
  assert.equal(existsSync(join(f.workspace, "PLAN.md")), false);
});
