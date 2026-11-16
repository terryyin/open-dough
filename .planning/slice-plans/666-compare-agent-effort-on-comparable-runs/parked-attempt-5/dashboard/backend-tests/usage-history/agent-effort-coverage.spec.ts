import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  expect,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  command,
  report,
  bytes,
} from "../../tests/usage-history/agentEffortHarness.ts";
import {
  runImport,
  writeClaudeSession,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";

test("lost native files retain known stored counters with provenance and named unknowns without refreshing Usage", ({
  home,
  root,
}) => {
  keepLaunchStore(home, { "open-dough": [launch("lost", "turn")] });
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("lost")
      .withResponse("turn", "own", {
        input_tokens: 20,
        cached_input_tokens: 5,
        cache_write_input_tokens: 0,
        output_tokens: 4,
      })
      .please(),
  );
  runImport(home, root);
  rmSync(root, { recursive: true });
  const before = bytes(home);
  const actual = report(home, root, [
    "--task",
    "SEED-358#reconstruct-codex-and-claude-code-usage-history",
  ]);
  expect(actual.threads).toBe(1);
  expect(actual.totals).toMatchObject({
    requests: { value: 1, status: "partial" },
    totalInput: { value: 20 },
    output: { value: 4, status: "partial" },
  });
  expect(actual.agents[0]).toMatchObject({
    provenance: "stored-session-contribution",
    sources: [{ kind: "history" }],
    peakInput: { value: null, status: "unavailable" },
  });
  expect(actual.gaps).toEqual(
    expect.arrayContaining([
      "native-files-unavailable",
      "stored-ownership-and-agent-detail-unavailable",
      "idle-wake-evidence-unavailable",
    ]),
  );
  expect(actual.peakInput).toBeNull();
  expect(bytes(home)).toEqual(before);
});

test("ambiguous story selection lists usable task ids instead of choosing the latest and missing counters stay unavailable", ({
  home,
  root,
}) => {
  keepLaunchStore(home, {
    "open-dough": [launch("first", "one"), launch("second", "two")],
  });
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("first")
      .withResponse("one", "partial", { output_tokens: 7 })
      .please(),
  );
  const failed = spawnSync(
    process.execPath,
    [
      command,
      "--home",
      home,
      "--codex-root",
      root,
      "--task",
      "SEED-358#reconstruct-codex-and-claude-code-usage-history",
    ],
    { encoding: "utf8" },
  );
  expect(failed.status).toBe(1);
  expect(failed.stderr).toContain("ambiguous");
  const catalog = report(home, root, ["--list"]);
  const first = catalog.selections[0];
  if (!first) throw new Error("Expected retained selections in the catalog");
  expect(failed.stderr).toContain(JSON.stringify(first.id).slice(1, -1));
  const task = catalog.selections.find((item) => item.sessionId === "first");
  if (!task)
    throw new Error("Expected the first retained session in the catalog");
  const actual = report(home, root, ["--task", task.id]);
  expect(actual.totals).toMatchObject({
    output: { value: 7 },
    totalInput: { value: null, status: "unavailable" },
    cachedInput: { value: null, status: "unavailable" },
  });
});

test("known input and lifetime subtotals survive missing cache-read and lifetime counters", ({
  home,
  root,
}) => {
  writeClaudeSession(
    path.join(home, "claude"),
    makeMe.aClaudeTranscript
      .forSession("partial-family")
      .withAssistant({
        uuid: "first",
        messageId: "first",
        usage: {
          input_tokens: 2,
          cache_creation_input_tokens: 10,
          cache_creation: {
            ephemeral_5m_input_tokens: 3,
            ephemeral_1h_input_tokens: 7,
          },
          output_tokens: 7,
        },
      })
      .withAssistant({
        uuid: "second",
        messageId: "second",
        usage: {
          input_tokens: 4,
          cache_creation_input_tokens: 8,
          output_tokens: 5,
        },
      })
      .please(),
  );
  const actual = report(home, root, [
    "--host",
    "claude",
    "--family",
    "partial-family",
    "--from",
    "2026-11-14T00:00:00.000Z",
    "--until",
    "2026-11-15T00:00:00.000Z",
  ]);
  expect(actual.totals).toMatchObject({
    totalInput: {
      value: 24,
      status: "partial",
      missingComponents: { cachedInput: 2, uncachedInput: 0, cacheWrite: 0 },
    },
    cachedInput: { value: null, status: "unavailable" },
    cacheWrite5m: { value: 3, status: "partial", missingRequests: 1 },
    cacheWrite1h: { value: 7, status: "partial", missingRequests: 1 },
  });
});

test("a plain developer reply keeps shared continuation ownership with partial counter coverage", ({
  home,
  root,
}) => {
  const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";
  const record = makeMe.aLaunchRecord
    .executing({ identity: "SEED-345#reply", title: "Reply" })
    .inClaudeSession({ sessionId: "reply-family" })
    .reportingThrough({
      origin: "http://localhost:4318",
      reference,
      command: "report",
    })
    .please();
  keepLaunchStore(home, { "open-dough": [record] });
  writeClaudeSession(
    path.join(home, "claude"),
    makeMe.aClaudeTranscript
      .forSession("reply-family")
      .withLaunchInput({ reference, command: "report", role: true })
      .withAssistant({
        uuid: "own",
        messageId: "own",
        usage: { output_tokens: 7 },
      })
      .withUser({
        uuid: "developer-reply",
        origin: { kind: "human" },
        content: "Please continue",
      })
      .withAssistant({
        uuid: "later",
        messageId: "later",
        usage: { output_tokens: 11 },
      })
      .please(),
  );
  const actual = report(home, root, ["--task", "SEED-345#reply"]);
  expect(actual.totals.output).toMatchObject({ value: 18, status: "partial" });
  expect(actual.totals.totalInput).toMatchObject({
    value: null,
    status: "unavailable",
  });
  expect(actual.gaps).not.toContain("unresolved-family-response-ownership");
  expect(actual.unownedResponses).toEqual([]);
});
