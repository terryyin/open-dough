// Retained launch facts and categorized response usage survive the import process.
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import path from "node:path";
import {
  expect,
  test,
  launch,
  meta,
  context,
  response,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  keepRetainedLaunch,
  nativeFile,
  nodeProcess,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";

test.describe("retained launch usage import", () => {
  test("persists operational and retained launches, disjoint counters and changed observed settings across fresh reads and reruns", ({
    home,
    root,
  }) => {
    keepOperationalLaunch(home, launch("root-one", "turn-one"));
    keepRetainedLaunch(home, launch("root-two", "turn-two"));
    const first = response("root-one", "turn-one", "response-one", {
      input_tokens: 100,
      cached_input_tokens: 60,
      cache_write_input_tokens: 10,
      output_tokens: 7,
      reasoning_output_tokens: 3,
      total_tokens: 107,
    });
    nativeFile(root, "root-one", [
      meta("root-one"),
      context("turn-one", "observed-a", "low"),
      first,
      first,
      context("turn-one", "observed-b", "xhigh"),
      response("root-one", "turn-one", "response-two", {
        input_tokens: 20,
        cached_input_tokens: 10,
        cache_write_input_tokens: 0,
        output_tokens: 0,
      }),
    ]);
    nativeFile(root, "root-two", [
      meta("root-two"),
      response("root-two", "turn-two", "partial", {
        input_tokens: 50,
        output_tokens: 2,
      }),
    ]);
    runImport(home, root);
    const stored = readImported(home);
    const tasks = Object.values(stored.tasks);
    const task = tasks.find((item) => item.sessionId === "root-one");
    assert(task);
    expect(tasks).toHaveLength(2);
    expect(task.requested).toEqual(
      expect.objectContaining({ model: "requested-model", effort: "high" }),
    );
    const observations = Object.values(stored.observations);
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
    const summary: unknown = JSON.parse(
      nodeProcess(
        home,
        `
      const { readUsageHistory, taskUsage } = await import('./dashboard/server/usageHistory.ts');
      console.log(JSON.stringify(taskUsage(await readUsageHistory(), ${JSON.stringify(task.id)})));
    `,
      ),
    );
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
    const before = JSON.stringify(stored);
    runImport(home, root);
    expect(JSON.stringify(readImported(home))).toBe(before);
    rmSync(root, { recursive: true });
    expect(JSON.stringify(readImported(home))).toBe(before);
  });

  test("keeps unavailable usage unknown and fills the gap when native response evidence becomes available", ({
    home,
    root,
  }) => {
    keepOperationalLaunch(home, launch("missing", "turn"));
    nativeFile(root, "missing", [meta("missing")]);
    runImport(home, root);
    const before = readImported(home);
    expect(before.gaps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "no-attributable-response-usage" }),
      ]),
    );
    expect(
      JSON.parse(
        nodeProcess(
          home,
          `
      const { readUsageHistory, taskUsage } = await import('./dashboard/server/usageHistory.ts');
      const history = await readUsageHistory();
      console.log(JSON.stringify(taskUsage(history, Object.keys(history.tasks)[0])));
    `,
        ),
      ),
    ).toEqual(
      expect.objectContaining({
        requests: 0,
        tokens: expect.objectContaining({ output: null }),
      }),
    );
    nativeFile(root, "missing", [
      meta("missing"),
      response("missing", "turn", "one", { output_tokens: 0 }),
    ]);
    runImport(home, root);
    const after = readImported(home);
    expect(
      after.gaps.some((gap) => gap.code === "no-attributable-response-usage"),
    ).toBe(false);
    const [measured] = Object.values(after.observations);
    assert(measured);
    expect(measured.tokens.output).toBe(0);
  });
});
