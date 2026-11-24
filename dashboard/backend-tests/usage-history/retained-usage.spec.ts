// Retained launch facts and categorized response usage survive the import process.
import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import {
  expect,
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  keepRetainedLaunch,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

test.describe("retained launch usage import", () => {
  test("persists operational and retained launches, disjoint counters and changed observed settings across fresh reads and reruns", async ({
    home,
    root,
  }) => {
    const options = makeMe.aUsageImportOptions
      .with({
        home,
        store: usageHistoryFile(home),
        codexRoots: [root],
        claudeRoots: claudeUsageRoots(home),
      })
      .please();
    keepOperationalLaunch(home, launch("root-one", "turn-one"));
    keepRetainedLaunch(home, launch("root-two", "turn-two"));
    const firstUsage = {
      input_tokens: 100,
      cached_input_tokens: 60,
      cache_write_input_tokens: 10,
      output_tokens: 7,
      reasoning_output_tokens: 3,
      total_tokens: 107,
    };
    writeCodexSession(
      root,
      makeMe.aCodexRollout
        .forSession("root-one")
        .withTurnContext("turn-one", "observed-a", "low")
        .withResponse("turn-one", "response-one", firstUsage)
        .withResponse("turn-one", "response-one", firstUsage)
        .withTurnContext("turn-one", "observed-b", "xhigh")
        .withResponse("turn-one", "response-two", {
          input_tokens: 20,
          cached_input_tokens: 10,
          cache_write_input_tokens: 0,
          output_tokens: 0,
        })
        .please(),
    );
    writeCodexSession(
      root,
      makeMe.aCodexRollout
        .forSession("root-two")
        .withResponse("turn-two", "partial", {
          input_tokens: 50,
          output_tokens: 2,
        })
        .please(),
    );
    await importUsageHistory(options);
    const { store, responses } = options;
    const stored = await readUsageHistory(store);
    const artifact = JSON.parse(
      readFileSync(responses, "utf8"),
    ) as UsageResponses;
    const storedText = readFileSync(store, "utf8");
    const responseText = readFileSync(responses, "utf8");
    const tasks = Object.values(stored.tasks);
    const task = tasks.find((item) => item.sessionId === "root-one");
    assert(task);
    expect(tasks).toHaveLength(2);
    expect(task.requested).toEqual(
      expect.objectContaining({ model: "requested-model", effort: "high" }),
    );
    const observations = Object.values(artifact.observations);
    expect(observations).toHaveLength(3);
    expect(
      observations
        .filter((item) => item.sessionId === "root-one")
        .map((item) => item.settings.model),
    ).toEqual(["observed-a", "observed-b"]);
    expect(
      observations
        .filter((item) => item.sessionId === "root-one")
        .map((item) => item.settings.effort),
    ).toEqual(["low", "xhigh"]);
    const counted = observations.find(
      (item) => item.responseId === "response-one",
    );
    assert(counted);
    expect(counted).toEqual(
      expect.objectContaining({
        host: "codex",
        sessionId: "root-one",
        turnId: "turn-one",
        rootTurnId: "turn-one",
        scope: "response",
        tokens: expect.objectContaining({
          uncachedInput: 30,
          cacheRead: 60,
          cacheWrite: 10,
          output: 7,
          reasoningOutput: 3,
        }),
        measurements: expect.arrayContaining([
          expect.objectContaining({
            reported: expect.objectContaining({ input_tokens: 100 }),
            source: expect.objectContaining({
              file: path.join(root, "root-one.jsonl"),
              line: 3,
            }),
          }),
        ]),
      }),
    );
    const partial = observations.find((item) => item.responseId === "partial");
    assert(partial);
    expect(partial.tokens).toEqual(
      expect.objectContaining({
        uncachedInput: null,
        cacheRead: null,
        cacheWrite: null,
        output: 2,
      }),
    );
    expect(partial.coverage).toBe("partial");
    expect(partial.gaps).toContain("missing-token-components");
    const summary = taskUsage(await readUsageHistory(store), task.id);
    expect(summary).toEqual(
      expect.objectContaining({
        requests: 2,
        tokens: expect.objectContaining({
          uncachedInput: 40,
          cacheRead: 70,
          cacheWrite: 10,
          output: 7,
        }),
      }),
    );
    await importUsageHistory(options);
    expect(await readUsageHistory(store)).toEqual(stored);
    expect(readFileSync(store, "utf8")).toBe(storedText);
    expect(readFileSync(responses, "utf8")).toBe(responseText);
    rmSync(root, { recursive: true });
    expect(await readUsageHistory(store)).toEqual(stored);
    expect(readFileSync(store, "utf8")).toBe(storedText);
    expect(readFileSync(responses, "utf8")).toBe(responseText);
  });

  test("keeps unavailable usage unknown and fills the gap when native response evidence becomes available", async ({
    home,
    root,
  }) => {
    const options = makeMe.aUsageImportOptions
      .with({
        home,
        store: usageHistoryFile(home),
        codexRoots: [root],
        claudeRoots: claudeUsageRoots(home),
      })
      .please();
    keepOperationalLaunch(home, launch("missing", "turn"));
    writeCodexSession(
      root,
      makeMe.aCodexRollout.forSession("missing").please(),
    );
    await importUsageHistory(options);
    const before = await readUsageHistory(options.store);
    expect(before.gaps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "no-attributable-response-usage" }),
      ]),
    );
    const [task] = Object.values(before.tasks);
    assert(task);
    expect(taskUsage(before, task.id)).toMatchObject({
      requests: 0,
      tokens: { output: null },
    });
    writeCodexSession(
      root,
      makeMe.aCodexRollout
        .forSession("missing")
        .withResponse("turn", "one", { output_tokens: 0 })
        .please(),
    );
    await importUsageHistory(options);
    const after = await readUsageHistory(options.store);
    expect(
      after.gaps.some((gap) => gap.code === "no-attributable-response-usage"),
    ).toBe(false);
    const { observations } = JSON.parse(
      readFileSync(options.responses, "utf8"),
    ) as UsageResponses;
    const [measured] = Object.values(observations);
    assert(measured);
    expect(measured.tokens.output).toBe(0);
  });
});
