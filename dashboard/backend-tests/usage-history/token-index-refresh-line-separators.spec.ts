// Refresh counts an intact native row containing Unicode line separators.
import { mkdtemp, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { lastUsageCheck, recordUsageCheck } from "../../server/usageCheck.ts";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import {
  importUsageHistory,
  usageHistorySince,
} from "../../server/usageImport.ts";
import { refreshUsageHistory } from "../../server/usageRefresh.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { writeClaudeSession } from "../../test-support/usage-history/importHarness.ts";

const sessionId = "claude-separated";
const reference = "ca7430bd-0d52-499d-a1bd-000000000001";
const identity = "SEED-7#separated";

test("Refresh counts a Claude row containing line separators and the response descending from it", async () => {
  const home = await mkdtemp(
    path.join(tmpdir(), "token-index-refresh-separators-"),
  );
  onTestFinished(() => rm(home, { recursive: true, force: true }));
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const store = usageHistoryFile(home);
  const transcripts = path.join(home, ".claude", "projects", "open-dough");
  const sources = { home, store, codexRoots: [], claudeRoots: [transcripts] };
  await importUsageHistory({ ...sources, since: usageHistorySince });
  await recordUsageCheck(store, "2026-11-12T12:00:00.000Z");
  keepLaunchRecords(home, [
    makeMe.aLaunchRecord
      .executing({ identity, title: "Separated rows" })
      .inClaudeSession({ sessionId })
      .reportingThrough({
        origin: "http://localhost:4318",
        reference,
        command: "report",
      })
      .completedWith({ receivedAt: "2026-11-13T12:00:00.000Z" })
      .please(),
  ]);
  const transcript = writeClaudeSession(
    transcripts,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withLaunchInput({ reference, command: "report" })
      .withAssistantHoldingLineSeparators()
      .withCountedAssistant()
      .please(),
  );
  const checkedAt = new Date("2026-11-14T12:00:00.000Z");
  await utimes(transcript, checkedAt, checkedAt);
  vi.setSystemTime(checkedAt);

  await refreshUsageHistory(sources);
  const history = await readUsageHistory(store);
  const task = Object.values(history.tasks).find(
    (item) => item.identity === identity,
  );
  expect(task && taskUsage(history, task.id).requests).toBe(2);
  expect(await lastUsageCheck(store)).toBe(checkedAt.toISOString());
});
