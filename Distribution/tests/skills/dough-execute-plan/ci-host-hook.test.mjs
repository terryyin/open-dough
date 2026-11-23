import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import { deployRuntime } from "./ci-installed-checkouts-test-fixtures.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import { runMailboxWorker } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-operations.mjs";
import { publishMailboxEvent } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-store.mjs";
import { createMailbox } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";
import {
  probeMailbox,
  readDeliveryProgress,
  readMailboxEvents,
} from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox.mjs";
import {
  context,
  failure,
  input,
  runHostHook,
  setup,
  stopHookName,
} from "./ci-host-hook-test-fixtures.mjs";

for (const host of ["cursor", "claude"]) {
  test(`${host}: real probe receipt produces a host-native readiness notification`, async () => {
    const options = setup();
    const directory = probeMailbox(options);
    if (host === "claude")
      assert.deepEqual(
        await runHostHook(
          host,
          input(host, directory, { cursor_version: "test" }),
          options,
        ),
        {},
      );
    const output = await runHostHook(host, input(host, directory), options);
    assert.match(context(output), /CI_MONITOR_READY/);
    assert.deepEqual(
      await runHostHook(host, input(host, directory), options),
      {},
    );
  });

  test(`${host}: pending work stays quiet and a completed failure arrives exactly once`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    await runHostHook(host, input(host, directory), options);
    assert.deepEqual(await runHostHook(host, input(host), options), {});
    await runMailboxWorker(directory, {
      ...options,
      observe: async () => failure,
    });
    assert.match(
      context(await runHostHook(host, input(host), options)),
      /CI_FAILURE/,
    );
    assert.deepEqual(
      JSON.parse(readFileSync(join(directory, "delivery.json"))),
      { deliveredThrough: 1 },
    );
    assert.deepEqual(await runHostHook(host, input(host), options), {});
  });

  test(`${host}: one coordinator binding delivers events published at different times`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    const laterFailure = { type: "CI_FAILURE", runId: 43, attempt: 1 };
    await runHostHook(host, input(host, directory), options);

    publishMailboxEvent(directory, failure);
    assert.match(
      context(await runHostHook(host, input(host), options)),
      /"runId":42/,
    );
    publishMailboxEvent(directory, laterFailure);

    for (const overrides of [
      { conversation_id: "other", session_id: "other" },
      { agent_id: "worker", subagent_id: "worker" },
    ])
      assert.deepEqual(
        await runHostHook(host, input(host, undefined, overrides), options),
        {},
      );
    assert.deepEqual(readMailboxEvents(directory), [
      { sequence: 1, event: failure },
      { sequence: 2, event: laterFailure },
    ]);
    assert.match(
      context(await runHostHook(host, input(host), options)),
      /"runId":43/,
    );
    assert.deepEqual(
      JSON.parse(readFileSync(join(directory, "delivery.json"))),
      { deliveredThrough: 2 },
    );
    assert.deepEqual(await runHostHook(host, input(host), options), {});
  });

  test(`${host}: a successful observation adds no model context`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    await runHostHook(host, input(host, directory), options);
    await runMailboxWorker(directory, {
      ...options,
      observe: async () => null,
    });
    assert.deepEqual(await runHostHook(host, input(host), options), {});
  });

  test(`${host}: another task or worker cannot consume the coordinator's notification`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    await runHostHook(host, input(host, directory), options);
    await runMailboxWorker(directory, {
      ...options,
      observe: async () => failure,
    });
    for (const overrides of [
      { conversation_id: "other", session_id: "other" },
      { agent_id: "worker", subagent_id: "worker" },
    ])
      assert.deepEqual(
        await runHostHook(host, input(host, directory, overrides), options),
        {},
      );
    assert.match(
      context(await runHostHook(host, input(host), options)),
      /CI_FAILURE/,
    );
  });

  test(`${host}: a failure already available at stop is delivered without waiting for CI`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    await runHostHook(host, input(host, directory), options);
    await runMailboxWorker(directory, {
      ...options,
      observe: async () => failure,
    });
    const output = await runHostHook(
      host,
      input(host, undefined, {
        hook_event_name: stopHookName(host),
      }),
      options,
    );
    assert.match(output.followup_message ?? output.reason, /CI_FAILURE/);
  });
}

test("claude: a worktree binding and the main-checkout hook share one coordinator owner", async (t) => {
  const repository = await materializeRepository(
    makeMe.aRepository
      .withRevision("init", { backlog: null })
      .withWorkspace("exec/story", { from: "init" })
      .please(),
  );
  t.after(repository.cleanup);
  const { integration: main, execution: worktree } = repository;
  const { storage } = setup();
  const directory = createMailbox({}, { root: worktree, storage });

  await runHostHook("claude", input("claude", directory), {
    path: join(deployRuntime(worktree, ".claude"), "scripts/ci-host-hook.mjs"),
    storage,
  });
  publishMailboxEvent(directory, failure);
  const output = await runHostHook("claude", input("claude", directory), {
    path: join(deployRuntime(main, ".claude"), "scripts/ci-host-hook.mjs"),
    storage,
  });

  assert.deepEqual(
    (context(output) ?? "")
      .split("\n")
      .filter((line) => line.startsWith("{"))
      .map((line) => JSON.parse(line)),
    [failure],
  );
  assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 1 });
});
