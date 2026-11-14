import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { heldFixture } from "./blocked-execution-test-fixtures.mjs";
import { CodexConnection, NativeRefusal } from "./codex-rpc.mjs";

test("the shared daemon connection reads large native history and fragmented Unicode notifications", async (t) => {
  const h = await heldFixture(t);
  const rpc = new CodexConnection(
    h.input.continuation.endpoint,
    new AbortController().signal,
  );
  t.after(() => rpc.close());
  await rpc.initialize();
  const content = "retained native history ×".repeat(4000);
  h.native.history[0].items.push({ type: "agentMessage", text: content });
  const read = await rpc.request("thread/read", {
    threadId: h.native.threadId,
    includeTurns: true,
  });
  assert.equal(read.thread.turns[0].items[0].text, content);
  const socket = [...h.native.sockets][0];
  const incoming = once(rpc, "notification");
  const notification = JSON.stringify({
    method: "native/progress",
    params: { content },
  });
  socket.send(notification.slice(0, 50), { fin: false });
  const pong = once(socket, "pong");
  socket.ping("liveness");
  socket.send(notification.slice(50), { fin: true });
  assert.equal((await incoming)[0].params.content, content);
  assert.equal((await pong)[0].toString(), "liveness");
});

test("native refusal preserves its code and malformed native messages end observation", async (t) => {
  const h = await heldFixture(t);
  const rpc = new CodexConnection(
    h.input.continuation.endpoint,
    new AbortController().signal,
  );
  t.after(() => rpc.close());
  await rpc.initialize();
  h.native.readError = true;
  await assert.rejects(
    rpc.request("thread/read", { threadId: h.native.threadId }),
    (error) => {
      assert.ok(error instanceof NativeRefusal);
      assert.equal(error.code, -32000);
      assert.equal(error.message, "Native thread not found.");
      return true;
    },
  );
  h.native.readError = false;
  h.native.blankHistoryError = {
    code: "malformed-code",
    message: "specific detail",
  };
  await assert.rejects(
    rpc.request("thread/read", {
      threadId: h.native.threadId,
      includeTurns: true,
    }),
    (error) => {
      assert.ok(error instanceof NativeRefusal);
      assert.equal(error.code, undefined);
      assert.equal(error.message, "Codex refused the native request.");
      return true;
    },
  );
  const disconnected = once(rpc, "disconnect");
  [...h.native.sockets][0].send('{"method":7}');
  await disconnected;
  await assert.rejects(rpc.request("thread/read", {}), /connection closed/);
});

test("an already-aborted connection refuses initialization without altering the native daemon", async (t) => {
  const h = await heldFixture(t);
  const controller = new AbortController();
  controller.abort();
  const rpc = new CodexConnection(
    h.input.continuation.endpoint,
    controller.signal,
  );
  await assert.rejects(rpc.initialize(), /connection closed/);
  assert.equal(h.native.history.length, 1);
});

test("aborting initialization before the socket opens settles its owner", async (t) => {
  const h = await heldFixture(t);
  const controller = new AbortController();
  const rpc = new CodexConnection(
    h.input.continuation.endpoint,
    controller.signal,
  );
  const initialized = rpc.initialize();
  controller.abort();
  await assert.rejects(initialized, /connection closed/);
  assert.equal(h.native.history.length, 1);
});
