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

test("a described executable file is committed with its executable mode", async (t) => {
  const { origin, cleanup } = await materializeRepository(
    makeMe.aRepository
      .withRevision("base", {
        files: { "bin/run": "#!/bin/sh\n", "notes.txt": "plain\n" },
        executable: ["bin/run"],
      })
      .please(),
  );
  t.after(cleanup);

  assert.equal(
    (await git(origin, "ls-tree", "-r", "main")).stdout.replace(
      /blob \w+/g,
      "blob",
    ),
    "100644 blob\t.planning/PRODUCT-BACKLOG.md\n100755 blob\tbin/run\n100644 blob\tnotes.txt\n",
  );
});
