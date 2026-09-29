import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkoutRoot,
  createMailbox,
  publishMailboxEvent,
  workerLossReason,
} from "./ci-mailbox.mjs";
import { stopMailbox } from "./ci-mailbox-complete.mjs";
import { recordLostTerminalResult } from "./ci-mailbox-store.mjs";
import {
  context,
  failure,
  input,
  runHostHook,
  setup,
  stopHookName,
} from "./ci-host-hook-test-fixtures.mjs";

const lostMessage = /CI observer lost its worker/;

const hostStop = (host) =>
  input(host, undefined, { hook_event_name: stopHookName(host) });

async function attachedMailbox(host) {
  const options = setup(checkoutRoot);
  const directory = createMailbox({}, options);
  await runHostHook(host, input(host, directory), options);
  // The recorded outcome of a liveness check that found the worker dead.
  recordLostTerminalResult(directory, workerLossReason);
  return { options, directory };
}

for (const host of ["cursor", "claude"]) {
  test(`${host}: a lost worker is reported to its coordinator once, and a later event still arrives once`, async () => {
    const { options, directory } = await attachedMailbox(host);

    const lost = await runHostHook(host, input(host), options);
    assert.match(context(lost), lostMessage);
    assert.deepEqual(await runHostHook(host, input(host), options), {});
    assert.deepEqual(
      await runHostHook(host, input(host, directory), options),
      {},
    );
    assert.deepEqual(await runHostHook(host, hostStop(host), options), {});

    publishMailboxEvent(directory, failure);
    const event = await runHostHook(host, input(host), options);
    assert.match(context(event), /CI_FAILURE/);
    assert.doesNotMatch(context(event), lostMessage);
    assert.deepEqual(await runHostHook(host, input(host), options), {});
  });

  test(`${host}: an explicitly stopped lost observer leaves the coordinator free to stop`, async () => {
    const { options, directory } = await attachedMailbox(host);

    const terminal = await stopMailbox(directory, options);
    assert.equal(terminal.coverage.state, "lost");

    assert.deepEqual(await runHostHook(host, hostStop(host), options), {});
    assert.deepEqual(await runHostHook(host, input(host), options), {});
  });
}
