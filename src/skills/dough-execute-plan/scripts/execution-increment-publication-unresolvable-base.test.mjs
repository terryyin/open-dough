// Git mechanics: a previously published base that names no single commit is
// refused after the fetch, before containment, rewrite, push, or
// registration, naming the supplied input, its problem, and the next step.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import {
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  remoteHeads,
  revParse,
} from "./publication-test-fixtures.mjs";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";

// Writes 1,500 blobs with one `git hash-object -w` call and answers a
// four-character prefix that at least two of them share.
async function ambiguousPrefix({ fixture, execution }) {
  const directory = join(fixture, "blobs");
  mkdirSync(directory);
  const paths = [];
  for (let index = 0; index < 1500; index += 1) {
    paths.push(join(directory, `blob-${index}`));
    writeFileSync(paths[index], `blob ${index}\n`);
  }
  const ids = (await git(execution, "hash-object", "-w", ...paths)).stdout
    .split("\n")
    .filter(Boolean);
  const seen = new Set();
  const shared = ids
    .map((id) => id.slice(0, 4))
    .find((prefix) => seen.has(prefix) || !seen.add(prefix));
  assert.ok(shared, "1,500 blobs share no four-character prefix");
  return shared;
}

const unresolvableBases = [
  {
    name: "an unknown string",
    problem: "not-an-object-id",
    base: () => "not-a-commit",
  },
  { name: "a ref name", problem: "not-an-object-id", base: () => "HEAD" },
  {
    name: "an unknown object ID",
    problem: "unknown",
    base: () => "0123456789abcdef",
  },
  {
    name: "an ambiguous four-character prefix",
    problem: "ambiguous",
    base: ambiguousPrefix,
  },
  {
    name: "the increment file's blob ID",
    problem: "not-a-commit",
    base: ({ execution }) => revParse(execution, "HEAD:increment.txt"),
  },
  {
    name: "the candidate's tree ID",
    problem: "not-a-commit",
    base: ({ execution }) => revParse(execution, "HEAD^{tree}"),
  },
];

// The branch, remote branches, and remote-tracking refs a refusal leaves alone.
async function refState({ execution, origin }) {
  return {
    branch: await revParse(execution, "exec/story"),
    remote: await remoteHeads(origin),
    tracking: (
      await git(
        execution,
        "for-each-ref",
        "--format=%(refname) %(objectname)",
        "refs/remotes/",
      )
    ).stdout,
  };
}

function assertRefusal(result, { problem, supplied, candidate }) {
  assert.equal(result.ok, false, JSON.stringify(result));
  assert.equal(result.publication, "stopped");
  assert.equal(result.status, "unresolvable-base");
  assert.equal(result.problem, problem);
  assert.equal(result.receipt, null);
  assert.equal(result.candidate, candidate);
  assert.equal(result.previouslyPublishedBase, supplied);
  assert.match(result.error, new RegExp(JSON.stringify(supplied)));
  assert.match(result.error, new RegExp(problem));
  assert.match(result.error, /full commit ID from the delivery receipt/);
}

for (const { name, problem, base } of unresolvableBases) {
  test(`${name} as the previously published base is refused before anything is compared, rewritten, or pushed`, async (t) => {
    const fixture = await createCleanTrunkFixture();
    t.after(fixture.cleanup);
    const supplied = await base(fixture);
    // The refusal follows the publication's own fetch, so start after one.
    await git(fixture.execution, "fetch", "origin");
    const before = await refState(fixture);
    const calls = [];

    const result = await publishExecutionIncrement({
      workspace: fixture.execution,
      branch: "exec/story",
      previouslyPublishedBase: supplied,
      targetRef: trunkTarget,
      register: () => calls.push("register"),
      validate: async () => calls.push("validate"),
      beforePush: async () => calls.push("beforePush"),
      onFetchedTarget: async () => calls.push("onFetchedTarget"),
    });

    assertRefusal(result, {
      problem,
      supplied,
      candidate: fixture.candidateSha,
    });
    assert.deepEqual(calls, []);
    assert.deepEqual(await refState(fixture), before);
  });
}

test("managed delivery reports an unresolvable base's status, problem, input, and next step", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const supplied = (
    await revParse(fixture.execution, "HEAD:increment.txt")
  ).slice(0, 12);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    session: null,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: supplied,
    targetRef: trunkTarget,
    repo: "owner/project",
  });

  assertRefusal(delivered, {
    problem: "not-a-commit",
    supplied,
    candidate: fixture.candidateSha,
  });
  assert.equal(delivered.report, "unresolvable-base");
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.trunkSha,
  );
});
