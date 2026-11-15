// Offline Codex traversal proves ownership, task boundaries, honest gaps and
// the service tier each response ran at.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { zstdCompressSync } from "node:zlib";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  expect,
  test,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  nativeFile,
  readImported,
  runImport,
  writeCodexSession,
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
  const own = {
    input_tokens: 100,
    cached_input_tokens: 60,
    cache_write_input_tokens: 10,
    output_tokens: 7,
  };
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession(parent)
      .withResponse(
        "first-task",
        "old",
        { output_tokens: 900 },
        {
          timestamp: "2026-09-15T15:59:59.000Z",
        },
      )
      .withResponse("first-task", "root-own", own)
      .withResponse("second-task", "next-own", { output_tokens: 11 })
      .withResponse("unrelated", "unrelated", { output_tokens: 500 })
      .please(),
  );
  const parentOwn = makeMe.aCodexRollout
    .forSession(parent)
    .withResponse("first-task", "root-own", own)
    .please();
  const parentMeta = parentOwn.find((row) => row.type === "session_meta");
  const parentResponse = parentOwn.find(
    (row) => row.type === "token_usage_record",
  );
  const workerRows = makeMe.aCodexRollout
    .forSession(worker)
    .spawnedFrom(parent)
    .withResponse(
      "worker-turn",
      "worker-own",
      { output_tokens: 13 },
      {
        rootTurnId: "first-task",
      },
    )
    .please();
  const workerResponse = workerRows.find(
    (row) => row.type === "token_usage_record",
  );
  const archive = path.join(home, "archives");
  assert(parentMeta && parentResponse && workerResponse);
  const plain = nativeFile(archive, `rollout-2026-11-14T10-00-00-${worker}`, [
    parentMeta,
    parentResponse,
    ...workerRows,
    workerResponse,
  ]);
  writeFileSync(`${plain}.zst`, zstdCompressSync(readFileSync(plain)));
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession(grandchild)
      .withParent(worker)
      .withResponse(
        "grandchild-turn",
        "grandchild-own",
        { output_tokens: 17 },
        {
          rootTurnId: "first-task",
        },
      )
      .please(),
  );
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession(ambiguous)
      .withParent(parent)
      .withResponse("worker-turn", "uncertain", { output_tokens: 1000 })
      .please(),
  );
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
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession(fast)
      // Copied from the thread it was forked from, which is not this one.
      .withAppliedSettings({ threadId: parent, serviceTier: "flex" })
      .withResponse("turn", "before", { output_tokens: 1 })
      .withAppliedSettings({ serviceTier: "fast" })
      .withResponse("turn", "after", { output_tokens: 2 })
      .please(),
  );
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession(unrecorded)
      .withAppliedSettings()
      .withResponse("turn", "untiered", { output_tokens: 3 })
      .please(),
  );
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
