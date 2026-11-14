// Real sibling worktrees share the ref store and therefore the outstanding
// target fetch. A held reference transaction makes the overlap observable.
import { chmod, realpath, rm, writeFile } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { OutstandingReads } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-outstanding.mjs";
import { runGit } from "../../server/gitRunner.ts";
import { fetchGitTarget } from "../../server/gitTargetFetch.ts";
import { expect, test } from "../../tests/support/pageTest.ts";

test("sibling worktrees read the published target through one actual held Git mutation", async () => {
  const repo = await materializeRepository(
    makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        files: { "test.txt": "before\n" },
      })
      .withRevision("latest", {
        backlog: null,
        files: { "test.txt": "after\n" },
      })
      .withWorkspace("exec/story", { from: "latest" })
      .please(),
  );
  if (repo.execution === undefined) throw new Error("No sibling worktree");
  const controller = new AbortController();
  const call = {
    cwd: repo.integration,
    signal: controller.signal,
    maxBuffer: 1024 * 1024,
  };
  const common = await realpath(
    (
      await runGit(
        ["rev-parse", "--path-format=absolute", "--git-common-dir"],
        call,
      )
    ).stdout.trim(),
  );
  await runGit(
    [
      "-c",
      "core.hooksPath=/dev/null",
      "update-ref",
      "refs/remotes/origin/main",
      repo.revisions.base,
    ],
    call,
  );
  let entered!: () => void;
  const prepared = new Promise<void>((resolve) => {
    entered = resolve;
  });
  let release: ServerResponse | undefined;
  let mutations = 0;
  const server = createServer((request, response) => {
    request.resume();
    mutations += 1;
    release = response;
    entered();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (address === null || typeof address === "string")
    throw new Error("No hook address");
  const harness = path.join(repo.fixture, "hold-ref.mjs");
  const hook = path.join(common, "hooks", "reference-transaction");
  await writeFile(
    harness,
    [
      'import {request} from "node:http";',
      'let input=""; for await (const chunk of process.stdin) input+=chunk;',
      'if(process.argv[2]==="prepared" && input.includes("refs/remotes/origin/main"))',
      `await new Promise((resolve,reject)=>{const req=request("http://127.0.0.1:${String(address.port)}",res=>{res.resume();res.on("end",resolve)});req.on("error",reject);req.end()});`,
      "",
    ].join("\n"),
  );
  await writeFile(
    hook,
    `#!/bin/sh\nexec '${process.execPath}' '${harness}' "$@"\n`,
  );
  await chmod(hook, 0o755);

  // Observe entry to the existing outstanding-read owner, so release follows
  // both actual canonical-directory lookups rather than a scheduling delay.
  // The observer calls this captured method with its actual owner via .call(this).
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const original = OutstandingReads.prototype.waitFor;
  const keys: string[] = [];
  let joining!: () => void;
  const joined = new Promise<void>((resolve) => {
    joining = resolve;
  });
  OutstandingReads.prototype.waitFor = function (key, waiter, start, bound) {
    const read = original.call(this, key, waiter, start, bound);
    keys.push(key);
    if (keys.length === 2) joining();
    return read;
  };
  const reads: Promise<void>[] = [];
  try {
    reads.push(fetchGitTarget("origin", "main", call));
    await prepared;
    reads.push(
      fetchGitTarget("origin", "main", { ...call, cwd: repo.execution }),
    );
    await joined;
    expect(keys[0]).toBe(keys[1]);
    release?.end();
    await Promise.all(reads);
    expect(mutations).toBe(1);
    for (const cwd of [repo.integration, repo.execution])
      expect(
        (
          await runGit(["rev-parse", "origin/main"], { ...call, cwd })
        ).stdout.trim(),
      ).toBe(repo.revisions.latest);
  } finally {
    OutstandingReads.prototype.waitFor = original;
    release?.end();
    controller.abort();
    await Promise.allSettled(reads);
    await rm(hook, { force: true });
    await new Promise<void>((resolve) =>
      server.close(() => {
        resolve();
      }),
    );
    await repo.cleanup();
  }
});
