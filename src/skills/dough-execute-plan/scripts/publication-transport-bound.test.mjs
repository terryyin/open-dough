import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as pause } from "node:timers/promises";
import {
  git,
  lsRemoteSha,
  pushExactRef,
  transportBoundMs,
  transportBoundSetting,
} from "./publication-git.mjs";
import { createCleanTrunkFixture } from "./publication-clean-trunk-fixtures.mjs";
import { installTransportStall } from "./publication-stall-test-fixtures.mjs";

// The bound is lowered only once setup's own pushes are done. It leaves room
// for the work before the stall point on a loaded machine: Git starting the
// stand-in, and for hook stalls the stand-in starting receive-pack too.
const standInStallBoundMs = 1_000;
const hookStallBoundMs = 2_000;

async function stallFixture(t, boundMs) {
  const base = await createCleanTrunkFixture();
  const stall = await installTransportStall({
    fixture: base.fixture,
    workspace: base.execution,
    origin: base.origin,
  });
  const previous = process.env[transportBoundSetting];
  process.env[transportBoundSetting] = String(boundMs);
  t.after(async () => {
    if (previous === undefined) delete process.env[transportBoundSetting];
    else process.env[transportBoundSetting] = previous;
    await stall.cleanup();
    base.cleanup();
  });
  return { ...base, stall };
}

// A process that ended may stay visible until its new parent reaps it.
async function assertEnded(stall, pid) {
  const deadline = Date.now() + 2_000;
  while (stall.alive(pid) && Date.now() < deadline) await pause(20);
  assert.equal(stall.alive(pid), false, `process ${pid} still running`);
}

async function assertTransportTimeout(operation, subcommand, boundMs) {
  const started = Date.now();
  await assert.rejects(operation, (error) => {
    assert.equal(error.code, "transport-timeout");
    assert.equal(error.subcommand, subcommand);
    assert.equal(error.remote, "origin");
    assert.equal(error.boundMs, boundMs);
    return true;
  });
  const elapsed = Date.now() - started;
  assert.ok(elapsed >= boundMs, `ended before the bound: ${elapsed} ms`);
  assert.ok(
    elapsed < boundMs + 2_000,
    `ended long after the bound: ${elapsed} ms`,
  );
}

test("a stalled fetch ends within the bound with its process tree", async (t) => {
  const { execution, stall } = await stallFixture(t, standInStallBoundMs);
  stall.stall({ service: "upload-pack" });

  await assertTransportTimeout(
    git(execution, "fetch", "origin", "main"),
    "fetch",
    standInStallBoundMs,
  );

  const [call] = stall.calls();
  assert.equal(call.stalled, true);
  await assertEnded(stall, call.pid);
});

test("a stalled push ends within the bound with its process tree", async (t) => {
  const { execution, origin, stall, trunkSha, candidateSha } =
    await stallFixture(t, standInStallBoundMs);
  stall.stall({ service: "receive-pack" });

  await assertTransportTimeout(
    pushExactRef(execution, candidateSha, "origin", "refs/heads/main"),
    "push",
    standInStallBoundMs,
  );

  const [call] = stall.calls();
  assert.equal(call.service, "receive-pack");
  await assertEnded(stall, call.pid);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);
});

test("a push stalled before or after acceptance ends with its hook", async (t) => {
  const { execution, origin, stall, trunkSha, candidateSha } =
    await stallFixture(t, hookStallBoundMs);
  const push = () =>
    pushExactRef(execution, candidateSha, "origin", "refs/heads/main");

  stall.stallBeforeAcceptance();
  await assertTransportTimeout(push(), "push", hookStallBoundMs);
  await assertEnded(stall, stall.hookPids()[0]);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);

  stall.removeHooks();
  stall.stallAfterAcceptance();
  await assertTransportTimeout(push(), "push", hookStallBoundMs);
  await assertEnded(stall, stall.hookPids()[1]);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), candidateSha);
});

test("a slow but responsive transport answers within the bound", async (t) => {
  const { execution, stall, candidateSha } = await stallFixture(t, 5_000);
  stall.pass({ delayMs: 400 });

  await git(execution, "fetch", "origin", "main");
  await pushExactRef(execution, candidateSha, "origin", "refs/heads/main");
  assert.equal(
    await lsRemoteSha("origin", "refs/heads/main", execution),
    candidateSha,
  );
  assert.deepEqual(
    stall.calls().map((call) => [call.service, call.stalled]),
    [
      ["upload-pack", false],
      ["receive-pack", false],
      ["upload-pack", false],
    ],
  );
});

test("the bound is 120 seconds unless the setting names a positive integer", () => {
  assert.equal(transportBoundMs({}), 120_000);
  assert.equal(transportBoundMs({ [transportBoundSetting]: "300" }), 300);
  for (const ignored of ["0", "-5", "1.5", "soon", ""]) {
    assert.equal(
      transportBoundMs({ [transportBoundSetting]: ignored }),
      120_000,
    );
  }
});
