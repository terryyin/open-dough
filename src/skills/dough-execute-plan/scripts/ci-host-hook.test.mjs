import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { deliverCiEvents, selectCiEvents } from "./ci-host-hook.mjs";
import {
  createMailbox,
  publishMailboxEvent,
  probeMailbox,
  readDeliveryProgress,
  readMailboxEvents,
  runMailboxWorker,
} from "./ci-mailbox.mjs";
import {
  context,
  failure,
  input,
  setup,
  stopHookName,
} from "./ci-host-hook-test-fixtures.mjs";

for (const host of ["cursor", "claude"]) {
  test(`${host}: selecting a notification waits for durable acknowledgement`, () => {
    const options = setup();
    const directory = createMailbox({}, options);
    deliverCiEvents(input(host, directory), host, options);
    publishMailboxEvent(directory, failure);

    const selection = selectCiEvents(input(host), host, options);

    assert.match(context(selection.output), /CI_FAILURE/);
    assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 0 });
    selection.acknowledge();
    assert.deepEqual(
      JSON.parse(readFileSync(join(directory, "delivery.json"))),
      { deliveredThrough: 1 },
    );
  });

  test(`${host}: real probe receipt produces a host-native readiness notification`, () => {
    const options = setup();
    const directory = probeMailbox(options);
    if (host === "claude")
      assert.deepEqual(
        deliverCiEvents(
          input(host, directory, { cursor_version: "test" }),
          host,
          options,
        ),
        {},
      );
    const output = deliverCiEvents(input(host, directory), host, options);
    assert.match(context(output), /CI_MONITOR_READY/);
    assert.deepEqual(
      deliverCiEvents(input(host, directory), host, options),
      {},
    );
  });

  test(`${host}: pending work stays quiet and a completed failure arrives exactly once`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    deliverCiEvents(input(host, directory), host, options);
    assert.deepEqual(deliverCiEvents(input(host), host, options), {});
    await runMailboxWorker(directory, {
      ...options,
      observe: async () => failure,
    });
    assert.match(
      context(deliverCiEvents(input(host), host, options)),
      /CI_FAILURE/,
    );
    assert.deepEqual(
      JSON.parse(readFileSync(join(directory, "delivery.json"))),
      { deliveredThrough: 1 },
    );
    assert.deepEqual(deliverCiEvents(input(host), host, options), {});
  });

  test(`${host}: one coordinator binding delivers events published at different times`, () => {
    const options = setup();
    const directory = createMailbox({}, options);
    const laterFailure = { type: "CI_FAILURE", runId: 43, attempt: 1 };
    deliverCiEvents(input(host, directory), host, options);

    publishMailboxEvent(directory, failure);
    assert.match(
      context(deliverCiEvents(input(host), host, options)),
      /"runId":42/,
    );
    publishMailboxEvent(directory, laterFailure);

    for (const overrides of [
      { conversation_id: "other", session_id: "other" },
      { agent_id: "worker", subagent_id: "worker" },
    ])
      assert.deepEqual(
        deliverCiEvents(input(host, undefined, overrides), host, options),
        {},
      );
    assert.deepEqual(readMailboxEvents(directory), [
      { sequence: 1, event: failure },
      { sequence: 2, event: laterFailure },
    ]);
    assert.match(
      context(deliverCiEvents(input(host), host, options)),
      /"runId":43/,
    );
    assert.deepEqual(
      JSON.parse(readFileSync(join(directory, "delivery.json"))),
      { deliveredThrough: 2 },
    );
    assert.deepEqual(deliverCiEvents(input(host), host, options), {});
  });

  test(`${host}: a successful observation adds no model context`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    deliverCiEvents(input(host, directory), host, options);
    await runMailboxWorker(directory, {
      ...options,
      observe: async () => null,
    });
    assert.deepEqual(deliverCiEvents(input(host), host, options), {});
  });

  test(`${host}: another task or worker cannot consume the coordinator's notification`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    deliverCiEvents(input(host, directory), host, options);
    await runMailboxWorker(directory, {
      ...options,
      observe: async () => failure,
    });
    for (const overrides of [
      { conversation_id: "other", session_id: "other" },
      { agent_id: "worker", subagent_id: "worker" },
    ])
      assert.deepEqual(
        deliverCiEvents(input(host, directory, overrides), host, options),
        {},
      );
    assert.match(
      context(deliverCiEvents(input(host), host, options)),
      /CI_FAILURE/,
    );
  });

  test(`${host}: a failure already available at stop is delivered without waiting for CI`, async () => {
    const options = setup();
    const directory = createMailbox({}, options);
    deliverCiEvents(input(host, directory), host, options);
    await runMailboxWorker(directory, {
      ...options,
      observe: async () => failure,
    });
    const output = deliverCiEvents(
      input(host, undefined, {
        hook_event_name: stopHookName(host),
      }),
      host,
      options,
    );
    assert.match(output.followup_message ?? output.reason, /CI_FAILURE/);
  });
}

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

test("claude: a worktree binding and the main-checkout hook share one coordinator owner", (t) => {
  const fixture = realpathSync(mkdtempSync(join(tmpdir(), "ci-hook-owner-")));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  const main = join(fixture, "main");
  const worktree = join(fixture, "worktree");
  const git = (...args) => execFileSync("git", args, { stdio: "ignore" });
  git("init", "-b", "main", main);
  git(
    "-C",
    main,
    "-c",
    "user.name=Hook",
    "-c",
    "user.email=hook@example.test",
    "commit",
    "--allow-empty",
    "-m",
    "init",
  );
  git("-C", main, "worktree", "add", worktree, "-b", "exec/story");
  const { storage } = setup();
  const directory = createMailbox({}, { root: worktree, storage });

  deliverCiEvents(input("claude", directory), "claude", {
    root: worktree,
    storage,
  });
  publishMailboxEvent(directory, failure);
  const output = deliverCiEvents(input("claude", directory), "claude", {
    root: main,
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
