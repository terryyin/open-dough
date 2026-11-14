import assert from "node:assert/strict";
import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  checkoutRoot,
  createMailbox,
  publishMailboxEvent,
  readDeliveryProgress,
} from "./ci-mailbox.mjs";
import {
  context,
  failure,
  hookPath,
  input,
  interruptHostHookWhileWriting,
  runHostHook,
  setup,
} from "./ci-host-hook-test-fixtures.mjs";

async function proveInterruptedDelivery({
  host,
  nonOwningInputs,
  assertOutputShape,
}) {
  const options = setup(checkoutRoot);
  const directory = createMailbox({}, options);
  await runHostHook(host, input(host, directory), options);
  publishMailboxEvent(directory, {
    ...failure,
    diagnostic: "x".repeat(2 * 1024 * 1024),
  });

  await interruptHostHookWhileWriting(host, input(host), options);

  assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 0 });
  for (const overrides of nonOwningInputs)
    assert.deepEqual(
      await runHostHook(host, input(host, undefined, overrides), options),
      {},
    );
  assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 0 });

  const delivered = await runHostHook(host, input(host), options);
  assertOutputShape(delivered);
  assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 1 });
  assert.deepEqual(await runHostHook(host, input(host), options), {});
}

test("Cursor redelivers an event when the hook process is interrupted before output completes", async () => {
  await proveInterruptedDelivery({
    host: "cursor",
    nonOwningInputs: [
      { generation_id: "child-request" },
      { conversation_id: "other" },
    ],
    assertOutputShape(delivered) {
      assert.deepEqual(Object.keys(delivered), ["additional_context"]);
      assert.match(delivered.additional_context, /CI_FAILURE/);
    },
  });
});

test("Claude Code redelivers an event when the hook process is interrupted before output completes", async () => {
  await proveInterruptedDelivery({
    host: "claude",
    nonOwningInputs: [{ agent_id: "child-request" }, { session_id: "other" }],
    assertOutputShape(delivered) {
      assert.deepEqual(Object.keys(delivered), ["hookSpecificOutput"]);
      assert.equal(delivered.hookSpecificOutput.hookEventName, "PostToolUse");
      assert.match(context(delivered), /CI_FAILURE/);
    },
  });
});

test("a symlink-equivalent entry path still parses stdin and delivers CI diagnostic output", async (t) => {
  const linkDir = mkdtempSync(join(tmpdir(), "ci-host-hook-symlink-"));
  const entry = join(linkDir, "ci-host-hook-entry.mjs");
  symlinkSync(hookPath, entry);
  t.after(() => rmSync(linkDir, { recursive: true, force: true }));

  const options = { ...setup(checkoutRoot), path: entry };
  const directory = createMailbox({}, options);
  await runHostHook("claude", input("claude", directory), options);
  publishMailboxEvent(directory, failure);

  const delivered = await runHostHook("claude", input("claude"), options);

  assert.deepEqual(Object.keys(delivered), ["hookSpecificOutput"]);
  assert.equal(delivered.hookSpecificOutput.hookEventName, "PostToolUse");
  assert.match(context(delivered), /CI_FAILURE/);
  assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 1 });
});
