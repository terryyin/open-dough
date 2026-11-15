import { readFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import {
  test,
  expect,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  readStoredRows,
  responsesFile,
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";

const injectedAt = "2026-11-14T08:00:00.000Z";

test("an import writes each response it read once to the named file, with its measurements and the task the history resolved for it", async ({
  home,
  root,
}) => {
  keepOperationalLaunch(home, launch("launched", "turn"));
  const launched = writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("launched")
      .withTurnContext("turn")
      .withResponse("turn", "answer", { output_tokens: 7 })
      .please(),
  );
  // A worker whose parent evidence disagrees belongs to no task.
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("worker")
      .spawnedFrom("launched", { spawnParent: "another-root" })
      .withResponse(
        "worker-turn",
        "stray",
        { output_tokens: 99 },
        { rootTurnId: "turn" },
      )
      .please(),
  );
  // The history took this turn's injected context for a task start.
  const injected = writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("injected")
      .withTurnContext("turn")
      .withRow({
        type: "response_item",
        timestamp: injectedAt,
        payload: {
          role: "user",
          content: [
            { text: "<recommended_plugins>context</recommended_plugins>" },
          ],
        },
      })
      .withResponse("turn", "reply", { output_tokens: 9 })
      .please(),
  );
  const withdrawn = makeMe.aUsageTask
    .with({
      id: JSON.stringify(["codex", "injected", "turn"]),
      sessionId: "injected",
      rootTurnId: "turn",
      launchedAt: injectedAt,
      fieldSources: {
        launchedAt: [{ kind: "native", file: injected, line: 3 }],
      },
    })
    .please();
  await writeUsageHistory({ tasks: [withdrawn] }, usageHistoryFile(home));
  const native = [launched, injected].map((file) => readFileSync(file, "utf8"));

  runImport(home, root);

  const responses = JSON.parse(
    readFileSync(responsesFile(home), "utf8"),
  ) as UsageResponses;
  const stored = readStoredRows(home);
  const answer = JSON.stringify(["codex", "launched", "answer"]);
  const reply = JSON.stringify(["codex", "injected", "reply"]);
  const stray = JSON.stringify(["codex", "worker", "stray"]);
  expect(Object.keys(responses.observations).sort()).toEqual(
    [answer, reply, stray].sort(),
  );
  expect(Object.keys(responses.associations).sort()).toEqual(
    [answer, reply, stray].sort(),
  );
  expect(responses.observations[answer]).toMatchObject({
    tokens: { output: 7 },
    measurements: [
      { source: { kind: "native", file: launched }, tokens: { output: 7 } },
    ],
  });
  expect(responses.observations[reply]).toMatchObject({
    tokens: { output: 9 },
    measurements: [
      { source: { kind: "native", file: injected }, tokens: { output: 9 } },
    ],
  });
  expect(responses.associations[answer]?.taskId).toBe(
    Object.values(stored.tasks).find((task) => task.sessionId === "launched")
      ?.id,
  );
  expect(stored.tasks[withdrawn.id]?.gaps).toContain(
    "unsupported-task-assignment",
  );
  expect(responses.associations[reply]?.taskId).toBeNull();
  expect(responses.associations[stray]).toMatchObject({
    taskId: null,
    gaps: expect.arrayContaining(["contradictory-lineage"]),
  });
  expect(responses.associations).toEqual(stored.associations);
  expect(
    [launched, injected].map((file) => readFileSync(file, "utf8")),
  ).toEqual(native);
});
