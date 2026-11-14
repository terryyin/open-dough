import assert from "node:assert/strict";
import { test } from "node:test";
import { deliverCiEvents } from "./ci-host-hook.mjs";
import { createMailbox, runMailboxWorker } from "./ci-mailbox.mjs";
import {
  context,
  failure,
  input,
  setup,
} from "./ci-host-hook-test-fixtures.mjs";

// Cursor turns: only the coordinator's own turn consumes a waiting CI event.

test("Cursor child with the same conversation and transcript cannot consume the coordinator event", async () => {
  const options = setup();
  const directory = createMailbox({}, options);
  deliverCiEvents(input("cursor", directory), "cursor", options);
  await runMailboxWorker(directory, {
    ...options,
    observe: async () => failure,
  });
  for (const generation_id of ["child-request", undefined]) {
    assert.deepEqual(
      deliverCiEvents(
        input("cursor", directory, { generation_id }),
        "cursor",
        options,
      ),
      {},
    );
  }
  assert.match(
    context(deliverCiEvents(input("cursor"), "cursor", options)),
    /CI_FAILURE/,
  );
});

test("Cursor reattaches after a real user prompt, not an arbitrary child tool call", async () => {
  const options = setup();
  const directory = createMailbox({}, options);
  deliverCiEvents(input("cursor", directory), "cursor", options);
  await runMailboxWorker(directory, {
    ...options,
    observe: async () => failure,
  });
  const nextTurn = { generation_id: "next-user-message" };
  assert.deepEqual(
    deliverCiEvents(input("cursor", undefined, nextTurn), "cursor", options),
    {},
  );
  assert.deepEqual(
    deliverCiEvents(
      input("cursor", undefined, {
        ...nextTurn,
        hook_event_name: "beforeSubmitPrompt",
      }),
      "cursor",
      options,
    ),
    {},
  );
  assert.match(
    context(
      deliverCiEvents(input("cursor", undefined, nextTurn), "cursor", options),
    ),
    /CI_FAILURE/,
  );
});

test("Cursor cancellation does not auto-continue or consume a waiting failure", async () => {
  const options = setup();
  const directory = createMailbox({}, options);
  deliverCiEvents(input("cursor", directory), "cursor", options);
  await runMailboxWorker(directory, {
    ...options,
    observe: async () => failure,
  });
  assert.deepEqual(
    deliverCiEvents(
      input("cursor", undefined, {
        hook_event_name: "stop",
        status: "aborted",
      }),
      "cursor",
      options,
    ),
    {},
  );
  assert.match(
    context(deliverCiEvents(input("cursor"), "cursor", options)),
    /CI_FAILURE/,
  );
});
