// How two groups compare when selections overlap: stored/native and Cursor
// alias identities keep their distinct deduplication rules.
import { writeFileSync, symlinkSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  expect,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  bytes,
  writeCursorTranscript,
} from "../../tests/usage-history/agentEffortHarness.ts";
import { compareViews } from "../../tests/usage-history/agentEffortCompare.ts";
import {
  writeCodexSession,
  runImport,
} from "../../tests/usage-history/importHarness.ts";

test("same-session stored counters cannot double-charge native evidence and disjoint stored workers survive", ({
  home,
  root,
}) => {
  keepLaunchStore(home, { "open-dough": [launch("family", "turn")] });
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("family")
      .withResponse("turn", "own", {
        input_tokens: 20,
        cached_input_tokens: 0,
        cache_write_input_tokens: 0,
        output_tokens: 4,
      })
      .please(),
  );
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("stored-worker")
      .spawnedFrom("family")
      .withResponse(
        "work",
        "work",
        {
          input_tokens: 30,
          cached_input_tokens: 0,
          cache_write_input_tokens: 0,
          output_tokens: 5,
        },
        { rootTurnId: "turn" },
      )
      .please(),
  );
  runImport(home, root);
  const task = {
    label: "native and stored worker",
    host: "codex",
    task: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
    "codex-root": [],
    "codex-file": [path.join(root, "family.jsonl")],
  };
  const stored = {
    ...task,
    label: "stored only",
    "codex-file": [],
    "codex-root": [path.join(home, "absent")],
  };
  const manifest = path.join(home, "comparison.json");
  writeFileSync(
    manifest,
    JSON.stringify({
      baseline: { executions: [task] },
      candidate: { executions: [stored, task, stored] },
    }),
  );
  const before = bytes(home);
  const { json: actual, readable, stated } = compareViews(home, manifest);
  expect(readable).toEqual(stated);
  expect(
    actual.candidate.executions.map(
      (execution) => execution.totals.totalInput.value,
    ),
  ).toEqual([50, 50, 50]);
  expect(actual.candidate.perHost[0]?.totals.totalInput).toMatchObject({
    value: 50,
    status: "partial",
  });
  expect(actual.candidate.perHost[0]?.totals.requests.value).toBe(2);
  expect(actual.candidate.perHost[0]?.gaps).toContain(
    "stored-native-response-overlap-unprovable:family",
  );
  expect(bytes(home)).toEqual(before);
});

test("Cursor group canonicalizes symlink aliases while retaining both selected executions", ({
  home,
}) => {
  const real = path.join(home, "cursor");
  const alias = path.join(home, "alias");
  writeCursorTranscript(
    path.join(real, "family", "family.jsonl"),
    makeMe.aCursorTranscript.withToolCall("TodoWrite", {}).please(),
  );
  symlinkSync(real, alias, "dir");
  const member = (source: string) => ({
    label: source,
    host: "cursor",
    family: "family",
    "cursor-root": [source],
  });
  const manifest = path.join(home, "comparison.json");
  writeFileSync(
    manifest,
    JSON.stringify({
      baseline: { executions: [member(real)] },
      candidate: { executions: [member(real), member(alias)] },
    }),
  );
  const { json: actual, readable, stated } = compareViews(home, manifest);
  expect(readable).toEqual(stated);
  expect(actual.candidate.executions).toHaveLength(2);
  expect(actual.candidate.perHost[0]?.workflow).toMatchObject({
    transcripts: 1,
    todoWriteCalls: 1,
  });
  expect(actual.candidate.perHost[0]?.agents).toHaveLength(1);
});
