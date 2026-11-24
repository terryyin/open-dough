import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import { importUsageHistory } from "../../server/usageImport.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { test } from "../../test-support/usage-history/retainedUsageTest.ts";
import { writeClaudeSession } from "../../test-support/usage-history/importHarness.ts";

const sessionId = "claude-split";
const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";

type Writes = { total: number; fiveMinute?: number; oneHour?: number };

// One launched Claude task whose responses write the cache, each with its
// lifetime split when `fiveMinute` is given, all at standard speed.
function keepLaunch(home: string, responses: Writes[]) {
  keepLaunchStore(home, {
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-359#split", title: "Split writes" })
        .inClaudeSession({ sessionId })
        .reportingThrough({
          origin: "http://localhost:4318",
          reference,
          command: "report",
        })
        .please(),
    ],
  });
  let transcript = makeMe.aClaudeTranscript
    .forSession(sessionId)
    .withLaunchInput({ reference, command: "report", role: true });
  responses.forEach(({ total, fiveMinute, oneHour }, index) => {
    transcript = transcript.withAssistant({
      uuid: `response-${index}`,
      parentUuid: "launch-input",
      messageId: `msg-${index}`,
      model: "claude-model",
      usage: {
        input_tokens: 1,
        cache_read_input_tokens: 2,
        cache_creation_input_tokens: total,
        ...(fiveMinute === undefined
          ? {}
          : {
              cache_creation: {
                ephemeral_5m_input_tokens: fiveMinute,
                ephemeral_1h_input_tokens: oneHour,
              },
            }),
        output_tokens: 3,
        speed: "standard",
      },
    });
  });
  const claudeRoot = path.join(home, "claude");
  writeClaudeSession(claudeRoot, transcript.please());
  return claudeRoot;
}

const storedEntries = async (store: string) => {
  const history = await readUsageHistory(store);
  const entries = history.sessions[`claude:${sessionId}`]?.entries;
  assert(entries);
  return entries;
};

test("a Claude task's stored contribution keeps the five-minute and one-hour cache writes and the speed as its tier, unchanged by a repeated import", async ({
  home,
  root,
}) => {
  const claudeRoot = keepLaunch(home, [
    { total: 10, fiveMinute: 4, oneHour: 6 },
    { total: 5, fiveMinute: 5, oneHour: 0 },
  ]);
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: [claudeRoot],
    })
    .please();
  await importUsageHistory(options);
  const [entry, ...others] = await storedEntries(options.store);
  expect(others).toEqual([]);
  expect(entry).toMatchObject({
    tier: "standard",
    responses: 2,
    tokens: { cacheWrite: 15, cacheWrite5m: 9, cacheWrite1h: 6 },
  });
  const bytes = readFileSync(options.store);
  await importUsageHistory(options);
  expect(readFileSync(options.store)).toEqual(bytes);
});

test("a Claude response without the cache-write split leaves its group's writes unsplit, still counted in the total", async ({
  home,
  root,
}) => {
  const claudeRoot = keepLaunch(home, [
    { total: 10, fiveMinute: 4, oneHour: 6 },
    { total: 5 },
  ]);
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: [claudeRoot],
    })
    .please();
  await importUsageHistory(options);
  const [entry] = await storedEntries(options.store);
  assert(entry);
  expect(entry.tokens.cacheWrite).toBe(15);
  expect(entry.tokens).not.toHaveProperty("cacheWrite5m");
  expect(entry.tokens).not.toHaveProperty("cacheWrite1h");
});
