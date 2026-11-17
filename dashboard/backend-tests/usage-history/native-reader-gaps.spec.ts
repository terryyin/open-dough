// Rereading native sessions replaces their reader gaps; legacy host-less gaps
// keep their historical shape and independent response evidence stays counted.
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { zstdCompressSync } from "node:zlib";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import {
  readImported,
  runImport,
  writeClaudeSession,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  expect,
  test,
  usageServer,
} from "../../tests/usage-history/tokenIndexHarness.ts";

const sessionId = "01a1c000-84ab-7240-a940-8a72564202cd";
const reference = "ca7430bd-0d52-499d-a1bd-000000000001";
const recoveryLaunch = () =>
  makeMe.aLaunchRecord
    .executing({ identity: "SEED-7#recovery", title: "Reader recovery" })
    .reportingThrough({
      origin: "http://localhost:4318",
      reference,
      command: "report",
    });
const codexRoot = (home: string) => path.join(home, ".codex/sessions");
const claudeRoot = (home: string) => path.join(home, ".claude/projects");
const importSession = (home: string) =>
  runImport(home, codexRoot(home), ["--claude-root", claudeRoot(home)]);
const sessions = [
  {
    host: "codex",
    write(home: string) {
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
    },
  },
  {
    host: "claude",
    write(home: string) {
      keepLaunchStore(home, {
        "open-dough": [
          recoveryLaunch().inClaudeSession({ sessionId }).please(),
        ],
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
    },
  },
];
const operations = [
  {
    name: "Import",
    reader(machine: Parameters<typeof usageServer>[0]) {
      return () => importSession(machine.home);
    },
  },
  {
    name: "Refresh",
    async reader(machine: Parameters<typeof usageServer>[0]) {
      const usage = await usageServer(machine);
      return () => usage.refresh();
    },
  },
];
const damageCases = [
  {
    code: "malformed-native-row",
    file: (plain: string) => plain,
    readable: (bytes: Buffer) => bytes,
    damaged: (bytes: Buffer) => bytes.subarray(0, -10),
  },
  {
    code: "native-source-unreadable",
    file(plain: string) {
      const archive = `${plain}.zst`;
      renameSync(plain, archive);
      return archive;
    },
    readable: (bytes: Buffer) => zstdCompressSync(bytes),
    damaged: () => Buffer.from("not zstd"),
  },
];

for (const session of sessions) {
  for (const operation of operations) {
    for (const damage of damageCases) {
      test(`${operation.name} replaces ${session.host} ${damage.code} after recovery and preserves host-less history`, async ({
        machine,
      }) => {
        const { home } = machine;
        const plain = session.write(home);
        const complete = readFileSync(plain);
        const file = damage.file(plain);
        // Bootstrap Refresh before the response is readable, so its recovery
        // must contribute that response rather than reuse an earlier count.
        writeFileSync(file, damage.readable(Buffer.alloc(0)));
        importSession(home);
        // Deliberately old wire shape: this gap has no host even though its
        // source is the same session being reread.
        const legacy = {
          code: damage.code,
          source: { kind: "native" as const, file, line: 999 },
        };
        await writeUsageHistory({ gaps: [legacy] }, usageHistoryFile(home));
        const reread = await operation.reader(machine);
        writeFileSync(file, damage.damaged(complete));

        await reread();
        const reported = readImported(home).gaps.filter(
          (gap) => gap.code === damage.code,
        );
        expect(reported).toEqual([
          legacy,
          expect.objectContaining({
            host: session.host,
            source: expect.objectContaining({ file }),
          }),
        ]);
        await reread();
        expect(
          readImported(home).gaps.filter((gap) => gap.code === damage.code),
        ).toEqual(reported);

        writeFileSync(file, damage.readable(complete));
        await reread();

        const history = readImported(home);
        expect(history.gaps.filter((gap) => gap.code === damage.code)).toEqual([
          legacy,
        ]);
        const task = Object.values(history.tasks).find(
          ({ identity }) => identity === "SEED-7#recovery",
        );
        expect(task && taskUsage(history, task.id)).toEqual(
          expect.objectContaining({
            requests: 1,
            tokens: expect.objectContaining({ output: 17 }),
          }),
        );
      });
    }
  }
}
