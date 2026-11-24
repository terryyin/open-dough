// Rereading native sessions replaces their reader gaps; legacy host-less gaps
// keep their historical shape and independent response evidence stays counted.
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { zstdCompressSync } from "node:zlib";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import { importUsageHistory } from "../../server/usageImport.ts";
import {
  writeClaudeSession,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  expect,
  test,
  usageServer,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

const sessionId = "01a1c000-84ab-7240-a940-8a72564202cd";
const reference = "ca7430bd-0d52-499d-a1bd-000000000001";
const identity = "SEED-7#recovery";
const recoveryLaunch = () =>
  makeMe.aLaunchRecord
    .executing({ identity, title: "Reader recovery" })
    .reportingThrough({
      origin: "http://localhost:4318",
      reference,
      command: "report",
    });
const codexRoot = (home: string) => path.join(home, ".codex/sessions");
const claudeRoot = (home: string) => path.join(home, ".claude/projects");
const importOptions = (home: string) =>
  makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [codexRoot(home)],
      claudeRoots: [claudeRoot(home)],
    })
    .please();

// A launched Codex session with one response of 17 output tokens.
function codexSessionFile(home: string) {
  keepLaunchStore(home, {
    "open-dough": [
      recoveryLaunch()
        .inCodexSession({ sessionId })
        .withFirstInput({ state: "confirmed", turnId: "task" })
        .please(),
    ],
  });
  return writeCodexSession(
    codexRoot(home),
    makeMe.aCodexRollout
      .forSession(sessionId)
      .withResponse("task", "restored", { output_tokens: 17 })
      .please(),
  );
}

// A launched Claude session with one response of 17 output tokens.
function claudeSessionFile(home: string) {
  keepLaunchStore(home, {
    "open-dough": [recoveryLaunch().inClaudeSession({ sessionId }).please()],
  });
  return writeClaudeSession(
    path.join(claudeRoot(home), "open-dough"),
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withLaunchInput({ reference, command: "report" })
      .withAssistant({
        uuid: "restored",
        messageId: "msg-restored",
        usage: { output_tokens: 17 },
      })
      .please(),
  );
}

// A plain session file whose last row can be cut short and completed again.
function plainSession(file: string) {
  const complete = readFileSync(file);
  return {
    file,
    cutLastRow() {
      writeFileSync(file, complete.subarray(0, -10));
    },
    completeLastRow() {
      writeFileSync(file, complete);
    },
  };
}

// The session archived as zstd, which can be corrupted and restored, or start
// out holding no rows yet.
function archivedSession(plain: string) {
  const complete = readFileSync(plain);
  const file = `${plain}.zst`;
  renameSync(plain, file);
  return {
    file,
    holdNoRows() {
      writeFileSync(file, zstdCompressSync(Buffer.alloc(0)));
    },
    corrupt() {
      writeFileSync(file, "not zstd");
    },
    restore() {
      writeFileSync(file, zstdCompressSync(complete));
    },
  };
}

const readerGapsOf = async (store: string, file: string) =>
  (await readUsageHistory(store)).gaps.filter(
    (gap) => gap.source?.kind === "native" && gap.source.file === file,
  );

test("Import reports a malformed Codex row as a gap naming its host and file", async ({
  machine: { home },
}) => {
  const session = plainSession(codexSessionFile(home));
  const options = importOptions(home);
  session.cutLastRow();

  await importUsageHistory(options);

  expect(await readerGapsOf(options.store, session.file)).toContainEqual(
    expect.objectContaining({ code: "malformed-native-row", host: "codex" }),
  );
});

test("Import drops a Codex malformed-row gap once the row is complete", async ({
  machine: { home },
}) => {
  const session = plainSession(codexSessionFile(home));
  const options = importOptions(home);
  session.cutLastRow();
  await importUsageHistory(options);

  session.completeLastRow();
  await importUsageHistory(options);

  expect(await readerGapsOf(options.store, session.file)).toEqual([]);
});

test("Refresh drops a Claude unreadable-stream gap once the stream is readable", async ({
  machine,
}) => {
  const session = archivedSession(claudeSessionFile(machine.home));
  const options = importOptions(machine.home);
  session.corrupt();
  await importUsageHistory(options);
  const usage = await usageServer(machine);

  session.restore();
  await usage.refresh();

  expect(await readerGapsOf(options.store, session.file)).toEqual([]);
});

test("Rereading a session keeps its stored host-less reader gap", async ({
  machine: { home },
}) => {
  const file = codexSessionFile(home);
  const options = importOptions(home);
  // Deliberately old wire shape: this gap has no host even though its source
  // is the session being reread.
  const legacy = {
    code: "malformed-native-row",
    source: { kind: "native" as const, file, line: 999 },
  };
  await writeUsageHistory({ gaps: [legacy] }, options.store);

  await importUsageHistory(options);

  expect(await readerGapsOf(options.store, file)).toContainEqual(legacy);
});

test("Refresh counts a response once its unreadable stream is restored", async ({
  machine,
}) => {
  const { home } = machine;
  const session = archivedSession(codexSessionFile(home));
  const options = importOptions(home);
  // An earlier check saw the session before its response was written, so
  // Refresh must count the restored response rather than reuse that count.
  session.holdNoRows();
  await importUsageHistory(options);
  const usage = await usageServer(machine);
  session.corrupt();
  await usage.refresh();

  session.restore();
  await usage.refresh();

  const history = await readUsageHistory(options.store);
  const task = Object.values(history.tasks).find(
    (candidate) => candidate.identity === identity,
  );
  expect(task && taskUsage(history, task.id)).toEqual(
    expect.objectContaining({
      requests: 1,
      tokens: expect.objectContaining({ output: 17 }),
    }),
  );
});
