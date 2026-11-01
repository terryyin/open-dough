// An owner may accept socket connections without answering its authenticated
// greeting. Concurrent consumers replace it once in the same allowance, and
// when it resumes, its earlier authenticated connection cannot ask again. One
// that ends before its welcome, gone before its consumer hears so, is absent.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { connect } from "node:net";
import { basename, join } from "node:path";
import { test } from "node:test";
import { until } from "./ci-github-test-fixtures.mjs";
import { log } from "./github-request-login-test-fixtures.mjs";
import { replacementMachine } from "./github-request-owner-replacement-test-fixtures.mjs";
import { processGone } from "./github-request-owner-test-fixtures.mjs";
import {
  greeted,
  scopeOf,
} from "./github-request-owner-endpoint-connection.mjs";
import { send } from "./github-request-owner-wire.mjs";

const stopped = (pid) =>
  execFileSync("ps", ["-p", String(pid), "-o", "stat="], { encoding: "utf8" })
    .trim()
    .startsWith("T");

// Connectability is a fixture precondition, not the owner's readiness rule.
const socketConnects = (path) =>
  new Promise((resolve) => {
    const socket = connect(path);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });

test("an owner whose socket connects but whose greeting never answers is replaced once for concurrent consumers, and the resumed owner is fenced", async (t) => {
  const { github, owners, consumer, logsAsked } = replacementMachine(t);
  await consumer().reached();
  const [original, ...others] = owners();
  assert.deepEqual(others, []);
  assert.equal(basename(original.file), "owner.1.json");

  // Keep an authenticated connection to the original owner, so after its
  // replacement stands we can ask it directly rather than through discovery.
  const originalReplies = [];
  const originalConnection = await greeted(
    { ...original, socket: join(original.directory, original.socket) },
    (reply) => originalReplies.push(reply),
  );
  assert.ok(originalConnection);
  github.teardown.defer(() => originalConnection.destroy());
  // Its record will be removed by replacement, so ordinary owner teardown
  // cannot find it. Also resume it on an assertion failure while still stopped.
  github.teardown.defer(async () => {
    if (processGone(original.pid)) return;
    process.kill(original.pid, "SIGCONT");
    process.kill(original.pid, "SIGTERM");
    await until(
      () => processGone(original.pid),
      "the original owner ended",
      10_000,
    );
  });
  process.kill(original.pid, "SIGSTOP");
  await until(() => stopped(original.pid), "the original owner stopped");
  assert.equal(
    await socketConnects(join(original.directory, original.socket)),
    true,
  );

  const requests = [consumer(), consumer()].map((process, index) =>
    process.ask(log(20 + index)),
  );
  await until(
    () => owners().some(({ file }) => basename(file) === "owner.2.json"),
    "one replacement owner answered the unanswered greeting",
  );
  await until(
    () => logsAsked() === 2,
    "both consumers reached the replacement",
  );
  const [replacement, ...extra] = owners();
  assert.deepEqual(extra, []);
  assert.equal(replacement.directory, original.directory);
  assert.equal(basename(replacement.file), "owner.2.json");
  assert.notEqual(replacement.pid, original.pid);

  github.releaseLogs();
  for (const { settled } of requests) {
    const answer = await settled;
    assert.equal(answer.status, 200);
    assert.equal(answer.body, "the log for ann");
  }

  send(originalConnection, {
    id: 99,
    request: {
      args: log(99),
      scope: scopeOf(original.directory),
      boundMs: 60_000,
      maxBufferBytes: 1024,
    },
  });
  process.kill(original.pid, "SIGCONT");
  await until(
    () => processGone(original.pid),
    "the resumed owner was fenced and ended",
  );
  assert.equal(logsAsked(), 2);
  assert.ok(
    originalReplies.every((reply) => reply.answer?.status === undefined),
  );
  assert.deepEqual(
    owners().map(({ pid }) => pid),
    [replacement.pid],
  );
});

test("an owner that ends before welcoming a waiting greeting, and is gone before that consumer hears so, is absent rather than failed", async (t) => {
  const { github, owners, consumer } = replacementMachine(t);
  await consumer().reached();
  const [owner] = owners();
  const socket = join(owner.directory, owner.socket);
  github.teardown.defer(() => {
    if (!processGone(owner.pid)) process.kill(owner.pid, "SIGCONT");
  });
  process.kill(owner.pid, "SIGSTOP");
  await until(() => stopped(owner.pid), "the owner stopped");

  // The greeting waits at the stopped owner, which then finds its record
  // withdrawn and ends before it welcomes anyone: stopped past its next
  // check, that check runs before it reads the greeting.
  const greeting = greeted({ ...owner, socket }, () => undefined).then(
    (connection) => {
      connection?.destroy();
      return connection === undefined ? "absent" : "welcomed";
    },
    (error) => `failed: ${error.failure?.cause ?? error.message}`,
  );
  assert.equal(await socketConnects(socket), true);
  rmSync(owner.file);
  await new Promise((resolve) => setTimeout(resolve, 300));
  process.kill(owner.pid, "SIGCONT");

  // A consumer slowed as under load hears its connection close only once the
  // owner's process is gone.
  const pause = new Int32Array(new SharedArrayBuffer(4));
  const deadline = Date.now() + 10_000;
  while (!processGone(owner.pid)) {
    if (Date.now() > deadline) throw new Error("The ending owner stayed");
    Atomics.wait(pause, 0, 0, 10);
  }
  assert.equal(await greeting, "absent");
});
