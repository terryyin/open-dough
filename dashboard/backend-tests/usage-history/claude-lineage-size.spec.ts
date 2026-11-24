import assert from "node:assert/strict";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { Worker } from "node:worker_threads";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import {
  expect,
  test,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import { writeClaudeSession } from "../../test-support/usage-history/importHarness.ts";

test("imports a long Claude parent chain within bounded memory and retains one response charge with its provenance", async ({
  home,
  root,
}) => {
  const sessionId = "long-claude";
  const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";
  const launch = makeMe.aLaunchRecord
    .executing({
      identity: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
      title: "Recover long native history",
    })
    .inClaudeSession({ sessionId })
    .reportingThrough({
      origin: "http://localhost:4318",
      reference,
      command: "report",
    })
    .please();
  keepLaunchStore(home, { "open-dough": [launch] });
  const claude = path.join(home, "claude");
  const transcript = makeMe.aClaudeTranscript
    .forSession(sessionId)
    .withLaunchInput({
      reference,
      uuid: "human",
      suffix: "\nprivate assignment",
    });
  for (let index = 0; index < 1500; index++) {
    transcript.withAssistant({
      uuid: `row-${index}`,
      messageId: `response-${index}`,
      usage: {
        input_tokens: 1,
        cache_read_input_tokens: 0,
        cache_creation_input_tokens: 0,
        output_tokens: 1,
      },
    });
  }
  const file = writeClaudeSession(claude, transcript.please());
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: [claude],
    })
    .please();
  // The worker gives the importer its own bounded heap in this process.
  const importer = new URL("../../server/usageImport.ts", import.meta.url);
  const source = `
    import { workerData } from "node:worker_threads";
    import { importUsageHistory } from ${JSON.stringify(importer.href)};
    await importUsageHistory(workerData);
  `;
  const worker = new Worker(
    new URL(`data:text/javascript,${encodeURIComponent(source)}`),
    { workerData: options, resourceLimits: { maxOldGenerationSizeMb: 128 } },
  );
  try {
    expect(worker.resourceLimits?.maxOldGenerationSizeMb).toBe(128);
    const [code] = (await once(worker, "exit")) as [number];
    expect(code).toBe(0);
  } finally {
    await worker.terminate();
  }
  const history = {
    ...(await readUsageHistory(options.store)),
    ...(JSON.parse(readFileSync(options.responses, "utf8")) as UsageResponses),
  };
  const task = Object.values(history.tasks)[0];
  assert(task);
  expect(taskUsage(history, task.id)).toMatchObject({
    requests: 1500,
    tokens: { uncachedInput: 1500, output: 1500 },
  });
  const last = Object.values(history.observations).find(
    (item) => item.responseId === "response-1499",
  );
  assert(last);
  expect(last).toMatchObject({
    rootTurnId: "human",
    measurements: [
      expect.objectContaining({ source: { kind: "native", file, line: 1501 } }),
    ],
  });
  expect(history.associations[last.id]).toMatchObject({
    taskId: task.id,
    sources: expect.arrayContaining([{ kind: "native", file, line: 1 }]),
  });
  expect(JSON.stringify(history)).not.toContain("private assignment");
});
