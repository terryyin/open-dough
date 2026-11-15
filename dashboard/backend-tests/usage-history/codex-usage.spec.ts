// Offline Codex traversal proves ownership, task boundaries, honest gaps and
// the service tier each response ran at.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { zstdCompressSync } from "node:zlib";
import { taskUsage } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  expect,
  test,
  launch,
  meta,
  response,
  settingsApplied,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  nativeFile,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";

test("attributes own responses and explicit descendants across compressed archives and successive task turns once", ({
  home,
  root,
}) => {
  const parent = "01a1b51f-108e-7c93-abb2-3a7fe255002b";
  const worker = "01a1b548-84ab-7240-a940-8a72564202cd";
  const grandchild = "01a1b549-84ab-7240-a940-8a72564202cd";
  const ambiguous = "01a1b550-84ab-7240-a940-8a72564202cd";
  keepLaunchStore(home, {
    "open-dough": [
      launch(parent, "first-task", "2026-09-01T00:00:00.000Z"),
      launch(parent, "second-task"),
    ],
  });
  const earlier = {
    ...response(parent, "first-task", "old", { output_tokens: 900 }),
    timestamp: "2026-09-15T15:59:59.000Z",
  };
  const own = response(parent, "first-task", "root-own", {
    input_tokens: 100,
    cached_input_tokens: 60,
    cache_write_input_tokens: 10,
    output_tokens: 7,
  });
  nativeFile(root, parent, [
    meta(parent),
    earlier,
    own,
    response(parent, "second-task", "next-own", { output_tokens: 11 }),
    response(parent, "unrelated", "unrelated", { output_tokens: 500 }),
  ]);
  const workerMeta = {
    type: "session_meta",
    payload: {
      id: worker,
      parent_thread_id: parent,
      source: { subagent: { thread_spawn: { parent_thread_id: parent } } },
    },
  };
  const child = response(worker, "worker-turn", "worker-own", {
    output_tokens: 13,
  });
  child.payload.root_turn_id = "first-task";
  const archive = path.join(home, "archives");
  const plain = nativeFile(archive, `rollout-2026-11-14T10-00-00-${worker}`, [
    meta(parent),
    own,
    workerMeta,
    child,
    child,
  ]);
  writeFileSync(`${plain}.zst`, zstdCompressSync(readFileSync(plain)));
  const descendant = response(grandchild, "grandchild-turn", "grandchild-own", {
    output_tokens: 17,
  });
  descendant.payload.root_turn_id = "first-task";
  nativeFile(root, grandchild, [
    {
      type: "session_meta",
      payload: { id: grandchild, parent_thread_id: worker },
    },
    descendant,
  ]);
  const uncertain = response(ambiguous, "worker-turn", "uncertain", {
    output_tokens: 1000,
  });
  uncertain.payload.root_turn_id = "worker-turn";
  nativeFile(root, ambiguous, [
    {
      type: "session_meta",
      payload: { id: ambiguous, parent_thread_id: parent },
    },
    uncertain,
  ]);
  runImport(home, root, ["--codex-root", archive]);
  const history = readImported(home);
  const first = Object.values(history.tasks).find(
    (task) => task.rootTurnId === "first-task",
  );
  const second = Object.values(history.tasks).find(
    (task) => task.rootTurnId === "second-task",
  );
  assert(first && second);
  expect(taskUsage(history, first.id)).toEqual(
    expect.objectContaining({
      requests: 3,
      tokens: expect.objectContaining({
        output: 37,
        uncachedInput: 30,
        cacheRead: 60,
        cacheWrite: 10,
      }),
    }),
  );
  expect(taskUsage(history, second.id)).toEqual(
    expect.objectContaining({
      requests: 1,
      tokens: expect.objectContaining({ output: 11 }),
    }),
  );
  expect(
    Object.values(history.observations)
      .map((item) => item.responseId)
      .sort(),
  ).toEqual([
    "grandchild-own",
    "next-own",
    "root-own",
    "uncertain",
    "unrelated",
    "worker-own",
  ]);
  const rootObservation = Object.values(history.observations).find(
    (item) => item.responseId === "root-own",
  );
  assert(rootObservation);
  expect(
    rootObservation.measurements.every(
      (item) => item.source.file === path.join(root, `${parent}.jsonl`),
    ),
  ).toBe(true);
  const workerObservation = Object.values(history.observations).find(
    (item) => item.responseId === "worker-own",
  );
  assert(workerObservation);
  expect(workerObservation).toEqual(
    expect.objectContaining({
      sessionId: worker,
      parentSessionId: parent,
      rootTurnId: "first-task",
      turnId: "worker-turn",
    }),
  );
  expect(
    workerObservation.measurements.some((item) =>
      item.source.file.endsWith(".zst"),
    ),
  ).toBe(true);
  const uncertainObservation = Object.values(history.observations).find(
    (item) => item.responseId === "uncertain",
  );
  assert(uncertainObservation);
  expect(history.associations[uncertainObservation.id]).toEqual(
    expect.objectContaining({
      taskId: null,
      gaps: expect.arrayContaining(["unresolved-task-association"]),
    }),
  );
  const before = JSON.stringify(history);
  runImport(home, root, ["--codex-root", archive]);
  expect(JSON.stringify(readImported(home))).toBe(before);
});

test("responses keep the service tier their thread's settings last applied, and none where no tier was recorded", ({
  home,
  root,
}) => {
  const fast = "01a1b51f-108e-7c93-abb2-3a7fe255002c";
  const unrecorded = "01a1b51f-108e-7c93-abb2-3a7fe255002d";
  const parent = "01a1b51f-108e-7c93-abb2-3a7fe255002e";
  nativeFile(root, fast, [
    meta(fast),
    // Copied from the thread it was forked from, which is not this one.
    settingsApplied(parent, "flex"),
    response(fast, "turn", "before", { output_tokens: 1 }),
    settingsApplied(fast, "fast"),
    response(fast, "turn", "after", { output_tokens: 2 }),
  ]);
  nativeFile(root, unrecorded, [
    meta(unrecorded),
    settingsApplied(unrecorded),
    response(unrecorded, "turn", "untiered", { output_tokens: 3 }),
  ]);
  runImport(home, root);

  const tiers = Object.fromEntries(
    Object.values(readImported(home).observations).map((item) => [
      item.responseId,
      item.settings.serviceTier,
    ]),
  );
  expect(tiers).toEqual({
    before: undefined,
    after: "fast",
    untiered: undefined,
  });
});
