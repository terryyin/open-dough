import assert from "node:assert/strict";
import { test } from "node:test";
import { deliverCiEvents, selectCiEvents } from "./ci-host-hook.mjs";
import {
  createMailbox,
  publishMailboxEvent,
  readDeliveryProgress,
  readMailboxEvents,
} from "./ci-mailbox.mjs";
import {
  context,
  discoveryAdvisory,
  failure,
  input,
  setup,
  stopHookName,
} from "./ci-host-hook-test-fixtures.mjs";

for (const host of ["cursor", "claude"]) {
  test(`${host}: an advisory alone does not interrupt stop and stays undelivered`, () => {
    const options = setup();
    const directory = createMailbox({}, options);
    deliverCiEvents(input(host, directory), host, options);
    publishMailboxEvent(directory, discoveryAdvisory);

    const selection = selectCiEvents(
      input(host, undefined, { hook_event_name: stopHookName(host) }),
      host,
      options,
    );

    assert.deepEqual(selection.output, {});
    selection.acknowledge();
    assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 0 });
    assert.deepEqual(readMailboxEvents(directory, 0), [
      { sequence: 1, event: discoveryAdvisory },
    ]);
  });

  test(`${host}: a following ordinary delivery surfaces a held advisory`, () => {
    const options = setup();
    const directory = createMailbox({}, options);
    deliverCiEvents(input(host, directory), host, options);
    publishMailboxEvent(directory, discoveryAdvisory);

    assert.deepEqual(
      deliverCiEvents(
        input(host, undefined, { hook_event_name: stopHookName(host) }),
        host,
        options,
      ),
      {},
    );

    const selection = selectCiEvents(input(host), host, options);
    assert.match(context(selection.output), /CI_DISCOVERY_DELAYED/);
    assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 0 });
    selection.acknowledge();
    assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 1 });
  });

  test(`${host}: stop still blocks when an advisory shares the mailbox with a failure`, () => {
    const options = setup();
    const directory = createMailbox({}, options);
    deliverCiEvents(input(host, directory), host, options);
    publishMailboxEvent(directory, discoveryAdvisory);
    publishMailboxEvent(directory, failure);

    const selection = selectCiEvents(
      input(host, undefined, { hook_event_name: stopHookName(host) }),
      host,
      options,
    );
    const message =
      selection.output.followup_message ?? selection.output.reason;
    assert.match(message, /CI_DISCOVERY_DELAYED/);
    assert.match(message, /CI_FAILURE/);
    if (host === "cursor")
      assert.equal("followup_message" in selection.output, true);
    else {
      assert.equal(selection.output.decision, "block");
      assert.equal("reason" in selection.output, true);
    }
    selection.acknowledge();
    assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 2 });
  });
}
