// Readers of one published target share one fetch into its Git directory: two
// concurrent Done opens of one Review repository, and sibling worktrees of one
// common directory. A held reference transaction makes the overlap observable.
import { chmod, realpath, rm, writeFile } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";
import path from "node:path";
import { beforeAll, expect, onTestFinished, test, vi } from "vitest";
import { stubRemoteRequestRecording } from "../support/fixtureHome.ts";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  materializeRepository,
  prepareRepository,
} from "../../../Distribution/tests/support/repository-fixture.mjs";
import { OutstandingReads } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-outstanding.mjs";
import { runGit } from "../../server/gitRunner.ts";
import { fetchGitTarget } from "../../server/gitTargetFetch.ts";
import { storyReview } from "../../server/storyReview.ts";
import { ordinaryTrunkModeCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import { advanceCompletedTrunk } from "../../test-support/support/completedStoryVisibleActions.ts";
import { homeReviewRepository } from "../../test-support/support/reviewRepositoryFixture.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";

// Each history's template is built before the cases that copy it.
for (const history of [() => ordinaryTrunkModeCompletedHistory()])
  beforeAll(() => prepareRepository(history()));

// The next prepared transaction of `refs/remotes/origin/main` in the Git
// directory `common` waits for `release`; `prepared` settles on entry and
// `mutations` counts actual held transactions.
async function holdTargetMutation(common: string) {
  let entered!: () => void;
  const prepared = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const held: ServerResponse[] = [];
  const server = createServer((request, response) => {
    request.resume();
    held.push(response);
    entered();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (address === null || typeof address === "string")
    throw new Error("No hook address");
  const harness = path.join(path.dirname(common), "hold-ref.mjs");
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
  const release = () => {
    for (const response of held) response.end();
  };
  onTestFinished(async () => {
    release();
    await rm(hook, { force: true });
    await new Promise<void>((resolve) =>
      server.close(() => {
        resolve();
      }),
    );
  });
  return { prepared, release, mutations: () => held.length };
}

// Settles once `count` readers have entered the outstanding-read owner, so a
// release follows the actual joins rather than a scheduling delay.
function joinedReaders(count: number) {
  // The spy calls the captured method with its actual owner via .call(this).
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const original = OutstandingReads.prototype.waitFor;
  const keys: string[] = [];
  let joining!: () => void;
  const joined = new Promise<void>((resolve) => {
    joining = resolve;
  });
  vi.spyOn(OutstandingReads.prototype, "waitFor").mockImplementation(function (
    this: OutstandingReads<unknown>,
    key,
    waiter,
    start,
    bound,
  ) {
    const read = original.call(this, key, waiter, start, bound);
    keys.push(key);
    if (keys.length === count) joining();
    return read;
  });
  onTestFinished(() => {
    vi.restoreAllMocks();
  });
  return { joined, keys };
}

test("two concurrent opens of a Done story's review share one held fetch", async () => {
  const { repository, home } = await configuredFixtureProject(
    ordinaryTrunkModeCompletedHistory(),
  );
  const recording = stubRemoteRequestRecording(repository.fixture);
  const signal = new AbortController().signal;
  const subject = { source: "open-dough", identity: queuedIdentity };
  const open = () =>
    storyReview({ read: { subject, completed: true } }, signal);
  const first = await open();
  expect(first.kind).toBe("published");
  const review = await realpath(homeReviewRepository(home));
  advanceCompletedTrunk({ project: repository.integration });
  const gate = await holdTargetMutation(review);
  const fetchesBefore = recording.fetchesIn(review);
  const readers = joinedReaders(2);

  const reviews = [open()];
  await gate.prepared;
  reviews.push(open());
  await readers.joined;
  gate.release();

  for (const reopened of await Promise.all(reviews))
    expect(reopened).toMatchObject({
      kind: "published",
      completion: repository.revisions.completion,
    });
  expect(readers.keys[0]).toBe(readers.keys[1]);
  expect(gate.mutations()).toBe(1);
  expect(recording.fetchesIn(review) - fetchesBefore).toBe(1);
});

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
  onTestFinished(() => repo.cleanup());
  if (repo.execution === undefined) throw new Error("No sibling worktree");
  const call = {
    cwd: repo.integration,
    signal: new AbortController().signal,
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
  const gate = await holdTargetMutation(common);
  const readers = joinedReaders(2);

  const reads = [fetchGitTarget("origin", "main", call)];
  await gate.prepared;
  reads.push(
    fetchGitTarget("origin", "main", { ...call, cwd: repo.execution }),
  );
  await readers.joined;
  expect(readers.keys[0]).toBe(readers.keys[1]);
  gate.release();
  await Promise.all(reads);

  expect(gate.mutations()).toBe(1);
  for (const cwd of [repo.integration, repo.execution])
    expect(
      (
        await runGit(["rev-parse", "origin/main"], { ...call, cwd })
      ).stdout.trim(),
    ).toBe(repo.revisions.latest);
});
