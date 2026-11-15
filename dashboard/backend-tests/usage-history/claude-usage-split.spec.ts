import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  readImported,
  runImport,
  writeClaudeSession,
} from "../../tests/usage-history/importHarness.ts";

const sessionId = "claude-split";
const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";

type Writes = { total: number; fiveMinute?: number; oneHour?: number };

// One launched Claude task whose responses write the cache, each with its
// lifetime split when `fiveMinute` is given, all at standard speed.
function importLaunch(home: string, root: string, responses: Writes[]) {
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
  runImport(home, root, ["--claude-root", claudeRoot]);
  return claudeRoot;
}

const storedEntries = (home: string) => {
  const entries = readImported(home).sessions[`claude:${sessionId}`]?.entries;
  assert(entries);
  return entries;
};

test("a Claude task's stored contribution keeps the five-minute and one-hour cache writes and the speed as its tier, unchanged by a repeated import", ({
  home,
  root,
}) => {
  const claudeRoot = importLaunch(home, root, [
    { total: 10, fiveMinute: 4, oneHour: 6 },
    { total: 5, fiveMinute: 5, oneHour: 0 },
  ]);
  const [entry, ...others] = storedEntries(home);
  expect(others).toEqual([]);
  expect(entry).toMatchObject({
    tier: "standard",
    responses: 2,
    tokens: { cacheWrite: 15, cacheWrite5m: 9, cacheWrite1h: 6 },
  });
  const store = usageHistoryFile(home);
  const bytes = readFileSync(store);
  runImport(home, root, ["--claude-root", claudeRoot]);
  expect(readFileSync(store)).toEqual(bytes);
});

test("a Claude response without the cache-write split leaves its group's writes unsplit, still counted in the total", ({
  home,
  root,
}) => {
  importLaunch(home, root, [
    { total: 10, fiveMinute: 4, oneHour: 6 },
    { total: 5 },
  ]);
  const [entry] = storedEntries(home);
  assert(entry);
  expect(entry.tokens.cacheWrite).toBe(15);
  expect(entry.tokens).not.toHaveProperty("cacheWrite5m");
  expect(entry.tokens).not.toHaveProperty("cacheWrite1h");
});
