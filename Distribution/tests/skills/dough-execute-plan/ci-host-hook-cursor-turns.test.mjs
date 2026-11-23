import assert from "node:assert/strict";
import { test } from "node:test";
import { runMailboxWorker } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-operations.mjs";
import { createMailbox } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";

import {
  context,
  failure,
  input,
  runHostHook,
  setup,
} from "./ci-host-hook-test-fixtures.mjs";

// Cursor turns: only the coordinator's own turn consumes a waiting CI event.

test("Cursor child with the same conversation and transcript cannot consume the coordinator event", async () => {
  const options = setup();
  const directory = createMailbox({}, options);
  await runHostHook("cursor", input("cursor", directory), options);
  await runMailboxWorker(directory, {
    ...options,
    observe: async () => failure,
  });
  for (const generation_id of ["child-request", undefined]) {
    assert.deepEqual(
      await runHostHook(
        "cursor",
        input("cursor", directory, { generation_id }),
        options,
      ),
      {},
    );
  }
  assert.match(
    context(await runHostHook("cursor", input("cursor"), options)),
    /CI_FAILURE/,
  );
});

test("Cursor reattaches after a real user prompt, not an arbitrary child tool call", async () => {
  const options = setup();
  const directory = createMailbox({}, options);
  await runHostHook("cursor", input("cursor", directory), options);
  await runMailboxWorker(directory, {
    ...options,
    observe: async () => failure,
  });
  const nextTurn = { generation_id: "next-user-message" };
  assert.deepEqual(
    await runHostHook("cursor", input("cursor", undefined, nextTurn), options),
    {},
  );
  assert.deepEqual(
    await runHostHook(
      "cursor",
      input("cursor", undefined, {
        ...nextTurn,
        hook_event_name: "beforeSubmitPrompt",
      }),
      options,
    ),
    {},
  );
  assert.match(
    context(
      await runHostHook(
        "cursor",
        input("cursor", undefined, nextTurn),
        options,
      ),
    ),
    /CI_FAILURE/,
  );
});

test("Cursor cancellation does not auto-continue or consume a waiting failure", async () => {
  const options = setup();
  const directory = createMailbox({}, options);
  await runHostHook("cursor", input("cursor", directory), options);
  await runMailboxWorker(directory, {
    ...options,
    observe: async () => failure,
  });
  assert.deepEqual(
    await runHostHook(
      "cursor",
      input("cursor", undefined, {
        hook_event_name: "stop",
        status: "aborted",
      }),
      options,
    ),
    {},
  );
  assert.match(
    context(await runHostHook("cursor", input("cursor"), options)),
    /CI_FAILURE/,
  );
});
