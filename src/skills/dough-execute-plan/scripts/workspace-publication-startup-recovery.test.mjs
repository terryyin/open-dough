// Interrupted and uncertain starts recover without duplicating an owned claim.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
} from "./workspace-publication-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";
import {
  computeBasis,
  recordStoryState,
} from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";
import {
  advanceRemote,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";

test("pre-push interruption resumes the retained candidate without another Take", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const hooks = join(trunk.fixture, "hooks");
  const marker = join(trunk.fixture, "push-blocked");
  mkdirSync(hooks);
  writeFileSync(
    join(hooks, "pre-push"),
    `#!/bin/sh\nif [ ! -e '${marker}' ]; then touch '${marker}'; echo 'transport interrupted' >&2; exit 1; fi\n`,
    { mode: 0o755 },
  );
  await git(trunk.integration, "config", "core.hooksPath", hooks);
  const interrupted = await startProcess(trunk, "a", identityA).result;
  assert.equal(interrupted.receipt.status, "unpublished");
  assert.equal(
    interrupted.receipt.recovery.candidateSha,
    await revParse(interrupted.workspace, "HEAD"),
  );
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
  const resume = await startProcess(trunk, "a", identityA, [
    "--starting-revision",
    trunk.trunkSha,
    "--candidate-sha",
    interrupted.receipt.recovery.candidateSha,
  ]).result;
  assert.equal(resume.receipt.ok, true, JSON.stringify(resume));
  assert.equal(resume.receipt.created, false);
  assert.equal(
    resume.receipt.publishedSha,
    interrupted.receipt.recovery.candidateSha,
  );
  const log = (await git(resume.workspace, "log", "--format=%B", "origin/main"))
    .stdout;
  assert.equal((log.match(/Claim-Publisher: publisher-a/g) ?? []).length, 1);
});

test("resume refuses a newly prepared selected source changed since the retained claim basis", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const hooks = join(trunk.fixture, "hooks");
  mkdirSync(hooks);
  writeFileSync(join(hooks, "pre-push"), "#!/bin/sh\nexit 1\n", {
    mode: 0o755,
  });
  await git(trunk.integration, "config", "core.hooksPath", hooks);
  const interrupted = await startProcess(trunk, "a", identityA).result;
  assert.equal(interrupted.receipt.status, "unpublished");
  await git(trunk.integration, "config", "--unset", "core.hooksPath");
  const seedPath = join(trunk.integration, ".planning/seeds/A.md");
  const plan = readFileSync(
    join(trunk.integration, ".planning/quick/A/PLAN.md"),
    "utf8",
  );
  const changed = readFileSync(seedPath, "utf8").replace(
    "Execute A.",
    "Changed A after interruption.",
  );
  const updated = recordStoryState(
    changed,
    {
      href: "seeds/A.md#a",
      identity: identityA,
      refinement: "refined",
      approach: "planned",
      plan: "../quick/A/PLAN.md",
      assessment: "ready",
      reasons: [],
      expectedBasis: computeBasis(changed, plan),
    },
    { planSource: plan },
  );
  writeFileSync(seedPath, updated.source);
  await git(trunk.integration, "add", ".planning/seeds/A.md");
  await git(trunk.integration, "commit", "-m", "prepare changed A");
  await git(trunk.integration, "push", "origin", "HEAD:main");
  const resumed = await startProcess(trunk, "a", identityA, [
    "--starting-revision",
    interrupted.receipt.recovery.startingRevision,
    "--candidate-sha",
    interrupted.receipt.recovery.candidateSha,
  ]).result;
  assert.equal(resumed.receipt.status, "source-refused");
  assert.equal(
    await revParse(interrupted.workspace, "HEAD"),
    interrupted.receipt.recovery.candidateSha,
  );
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    await revParse(trunk.integration, "HEAD"),
  );
});

test("lost push response and later remote descendant resume as owned without another push", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const bin = join(trunk.fixture, "bin");
  mkdirSync(bin);
  // The wrapper delegates every Git operation, but reports a lost response
  // after the real push succeeds. This is a process seam, not a CLI fault flag.
  writeFileSync(
    join(bin, "git"),
    `#!/bin/sh\nif [ "$1" = push ]; then\n  /usr/bin/git "$@" || exit $?\n  echo 'connection closed after acceptance' >&2\n  exit 1\nfi\nexec /usr/bin/git "$@"\n`,
    { mode: 0o755 },
  );
  const first = await startProcess(trunk, "a", identityA, [], {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
  }).result;
  assert.equal(first.receipt.ok, true, JSON.stringify(first));
  assert.equal(first.receipt.status, "resumed");
  const accepted = first.receipt.publishedSha;
  await git(trunk.integration, "fetch", "origin");
  await git(trunk.integration, "merge", "--ff-only", "origin/main");
  await advanceRemote(trunk, "later.txt");
  const descendant = await lsRemoteSha(trunk.origin, "refs/heads/main");
  const resumed = await startProcess(trunk, "a", identityA, [
    "--starting-revision",
    first.receipt.startingRevision,
    "--candidate-sha",
    first.receipt.candidateSha,
  ]).result;
  assert.equal(resumed.receipt.ok, true, JSON.stringify(resumed));
  assert.equal(resumed.receipt.status, "resumed");
  assert.equal(resumed.receipt.publishedSha, accepted);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), descendant);
  const log = (
    await git(trunk.integration, "log", "--format=%B", "origin/main")
  ).stdout;
  assert.equal((log.match(/Claim-Publisher: publisher-a/g) ?? []).length, 1);
});

test("accepted claim with deferred refresh resumes local maintenance only", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const first = await startProcess(trunk, "a", identityA).result;
  assert.equal(first.receipt.ok, true, JSON.stringify(first));
  assert.equal(first.receipt.afterMaintenance.reason, "unclear-ownership");
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
  const resumed = await startProcess(trunk, "a", identityA, [
    "--starting-revision",
    first.receipt.startingRevision,
    "--candidate-sha",
    first.receipt.candidateSha,
    "--declared-owner",
    "owner",
    "--requester",
    "owner",
  ]).result;
  assert.equal(resumed.receipt.ok, true, JSON.stringify(resumed));
  assert.equal(resumed.receipt.status, "resumed");
  assert.equal(
    await revParse(trunk.integration, "HEAD"),
    first.receipt.publishedSha,
  );
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    first.receipt.publishedSha,
  );
});

test("a second remote race stops after one replay and preserves the rewritten candidate", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const later = join(trunk.fixture, "later");
  await git(trunk.integration, "clone", trunk.origin, later);
  await git(later, "config", "user.name", "Later Writer");
  await git(later, "config", "user.email", "later@example.test");
  const bin = join(trunk.fixture, "bin");
  const count = join(trunk.fixture, "push-count");
  mkdirSync(bin);
  writeFileSync(
    join(bin, "git"),
    `#!/bin/sh\nset -e\nif [ "$1" = push ]; then\n  n=0\n  [ -f '${count}' ] && n=$(cat '${count}')\n  n=$((n + 1))\n  echo "$n" > '${count}'\n  /usr/bin/git -C '${later}' fetch origin >/dev/null 2>&1\n  /usr/bin/git -C '${later}' merge --ff-only origin/main >/dev/null 2>&1\n  echo "$n" > "${later}/advance-$n.txt"\n  /usr/bin/git -C '${later}' add "advance-$n.txt"\n  /usr/bin/git -C '${later}' commit -qm "advance $n"\n  /usr/bin/git -C '${later}' push -q origin HEAD:main\nfi\nexec /usr/bin/git "$@"\n`,
    { mode: 0o755 },
  );
  const result = await startProcess(trunk, "a", identityA, [], {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
  }).result;
  assert.equal(
    result.receipt.status,
    "unpublished",
    `${JSON.stringify(result)}; pushes=${existsSync(count) ? readFileSync(count, "utf8") : "none"}`,
  );
  assert.equal(readFileSync(count, "utf8").trim(), "2", JSON.stringify(result));
  assert.equal(
    await revParse(result.workspace, "HEAD"),
    result.receipt.recovery.candidateSha,
  );
  const remote = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.notEqual(remote, result.receipt.recovery.candidateSha);
  await git(result.workspace, "fetch", "origin");
  assert.deepEqual(
    takenIdentities(
      (
        await git(
          result.workspace,
          "show",
          "origin/main:.planning/PRODUCT-BACKLOG.md",
        )
      ).stdout,
    ),
    [],
  );
});
