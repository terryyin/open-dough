import assert from "node:assert/strict";
import { test } from "node:test";
import { publishMailboxEvent } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-store.mjs";
import { createMailbox } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";
import {
  readDeliveryProgress,
  readMailboxEvents,
} from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox.mjs";
import {
  context,
  discoveryAdvisory,
  failure,
  input,
  runHostHook,
  setup,
  stopHookName,
  throttleAdvisory,
} from "./ci-host-hook-test-fixtures.mjs";

for (const host of ["cursor", "claude"]) {
  test(`${host}: an advisory alone does not interrupt stop and stays undelivered`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    await runHostHook(host, input(host, directory), options);
    publishMailboxEvent(directory, discoveryAdvisory);

    const output = await runHostHook(
      host,
      input(host, undefined, { hook_event_name: stopHookName(host) }),
      options,
    );

    assert.deepEqual(output, {});
    assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 0 });
    assert.deepEqual(readMailboxEvents(directory, 0), [
      { sequence: 1, event: discoveryAdvisory },
    ]);
  });

  test(`${host}: a suspended acquisition alone does not interrupt stop and surfaces with the next delivery`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    await runHostHook(host, input(host, directory), options);
    publishMailboxEvent(directory, throttleAdvisory);

    assert.deepEqual(
      await runHostHook(
        host,
        input(host, undefined, { hook_event_name: stopHookName(host) }),
        options,
      ),
      {},
    );
    assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 0 });

    const output = await runHostHook(host, input(host), options);
    assert.match(context(output), /CI_MONITOR_THROTTLED/);
    assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 1 });
  });

  test(`${host}: a following ordinary delivery surfaces a held advisory`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    await runHostHook(host, input(host, directory), options);
    publishMailboxEvent(directory, discoveryAdvisory);

    assert.deepEqual(
      await runHostHook(
        host,
        input(host, undefined, { hook_event_name: stopHookName(host) }),
        options,
      ),
      {},
    );

    assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 0 });
    const output = await runHostHook(host, input(host), options);
    assert.match(context(output), /CI_DISCOVERY_DELAYED/);
    assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 1 });
  });

  test(`${host}: stop still blocks when an advisory shares the mailbox with a failure`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    await runHostHook(host, input(host, directory), options);
    publishMailboxEvent(directory, discoveryAdvisory);
    publishMailboxEvent(directory, failure);

    const output = await runHostHook(
      host,
      input(host, undefined, { hook_event_name: stopHookName(host) }),
      options,
    );
    const message = output.followup_message ?? output.reason;
    assert.match(message, /CI_DISCOVERY_DELAYED/);
    assert.match(message, /CI_FAILURE/);
    if (host === "cursor") assert.equal("followup_message" in output, true);
    else {
      assert.equal(output.decision, "block");
      assert.equal("reason" in output, true);
    }
    assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 2 });
  });
}
