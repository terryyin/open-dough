// The import command resolves its defaults and reports failures. A failed
// replacement and concurrent writers leave one coherent history document.
import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  failing,
  importFailure,
  keepOperationalLaunch,
  sessionTotals,
  writeClaudeSession,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

const command = "dashboard/server/importUsageHistory.ts";

test("the usage command resolves roots and store under --home and prints the import report and stored history", async ({
  home,
}) => {
  const roots = [".codex/sessions", ".codex/archived_sessions"];
  for (const [index, root] of roots.entries()) {
    const session = `default-${index}`;
    writeCodexSession(
      path.join(home, root),
      makeMe.aCodexRollout
        .forSession(session)
        .withResponse("turn", "one", { output_tokens: index + 1 })
        .please(),
    );
  }
  writeClaudeSession(
    path.join(home, ".claude/projects/test"),
    makeMe.aClaudeTranscript
      .forSession("default-claude")
      .withAssistant({
        uuid: "one",
        messageId: "one",
        usage: { output_tokens: 3 },
      })
      .please(),
  );
  keepLaunchStore(home, {
    "open-dough": Array.from(roots.keys(), (index) =>
      launch(`default-${index}`, "turn"),
    ),
  });
  const environment = { ...process.env, HOME: path.join(home, "unused-home") };
  const report = execFileSync(
    process.execPath,
    [command, "import", "--home", home],
    {
      env: environment,
      encoding: "utf8",
    },
  );
  expect(JSON.parse(report)).toMatchObject({
    scope: "retained-evidence",
    files: 3,
    tasks: 2,
  });
  const store = usageHistoryFile(home);
  expect(sessionTotals(await readUsageHistory(store))).toEqual([
    ["default-0", 1, 1],
    ["default-1", 1, 2],
  ]);
  const printed = execFileSync(
    process.execPath,
    [command, "read", "--home", home],
    {
      env: environment,
      encoding: "utf8",
    },
  );
  expect(printed).toBe(readFileSync(store, "utf8"));
});

test("a failed replacement reports the injected command error, keeps the previous history and lets a retry count each response once", async ({
  home,
  root,
}) => {
  const store = usageHistoryFile(home);
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store,
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  keepOperationalLaunch(home, launch("atomic", "turn"));
  const first = makeMe.aCodexRollout
    .forSession("atomic")
    .withResponse("turn", "one", { output_tokens: 2 })
    .please();
  writeCodexSession(root, first);
  await importUsageHistory(options);
  const before = await readUsageHistory(store);
  const bytes = readFileSync(store);
  const responses = readFileSync(options.responses);
  expect(sessionTotals(before)).toEqual([["atomic", 1, 2]]);
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("atomic")
      .withResponse("turn", "one", { output_tokens: 2 })
      .withResponse("turn", "two", { output_tokens: 3 })
      .please(),
  );
  expect(
    importFailure(options, root, failing("rename", "/usage.json")),
  ).toEqual({
    status: 1,
    stderr: "injected rename failure\n",
  });
  expect(readFileSync(store)).toEqual(bytes);
  expect(readFileSync(options.responses)).toEqual(responses);
  expect(await readUsageHistory(store)).toEqual(before);
  await importUsageHistory(options);
  const after = await readUsageHistory(store);
  expect(sessionTotals(after)).toEqual([["atomic", 2, 5]]);
  const artifact: unknown = JSON.parse(readFileSync(options.responses, "utf8"));
  await importUsageHistory(options);
  expect(await readUsageHistory(store)).toEqual(after);
  expect(JSON.parse(readFileSync(options.responses, "utf8"))).toEqual(artifact);
});

test("cross-process writers both land after waiting for the shared lock, and a reader meanwhile sees the earlier history whole", async ({
  home,
  root,
}) => {
  keepLaunchStore(home, {
    "open-dough": [
      launch("earlier", "turn"),
      launch("concurrent", "turn"),
      launch("second", "turn"),
    ],
  });
  const earlier = path.join(home, "earlier-native");
  const other = path.join(home, "other-native");
  writeCodexSession(
    earlier,
    makeMe.aCodexRollout
      .forSession("earlier")
      .withResponse("turn", "zero", { output_tokens: 1 })
      .please(),
  );
  const store = usageHistoryFile(home);
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store,
      codexRoots: [earlier],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);
  const before = await readUsageHistory(store);
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("concurrent")
      .withResponse("turn", "one", { output_tokens: 2 })
      .please(),
  );
  writeCodexSession(
    other,
    makeMe.aCodexRollout
      .forSession("second")
      .withResponse("turn", "two", { output_tokens: 3 })
      .please(),
  );
  const preload = (source: string) =>
    `data:text/javascript,${encodeURIComponent(source)}`;
  function start(nativeRoot: string, source: string) {
    const child = spawn(
      process.execPath,
      [
        "--import",
        preload(source),
        command,
        "import",
        "--home",
        home,
        "--codex-root",
        nativeRoot,
      ],
      {
        env: { ...process.env, HOME: home },
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      },
    );
    child.stdout?.resume();
    child.stderr?.resume();
    return { child, exited: once(child, "exit") };
  }
  const first = start(
    root,
    `
    import fs from 'node:fs/promises'; import { syncBuiltinESMExports } from 'node:module'; import { once } from 'node:events';
    const rename = fs.rename;
    fs.rename = async (source, target) => {
      if (target.endsWith('/usage.json')) { process.send('publishing'); await once(process, 'message'); }
      return rename(source, target);
    }; syncBuiltinESMExports();
  `,
  );
  expect((await once(first.child, "message"))[0]).toBe("publishing");
  const second = start(
    other,
    `
    import fs from 'node:fs'; import { syncBuiltinESMExports } from 'node:module';
    const mkdir = fs.mkdirSync; let signalled = false;
    fs.mkdirSync = (...args) => {
      if (String(args[0]).endsWith('/usage.json.lock') && !signalled) { signalled = true; process.send('locking'); process.disconnect(); }
      return mkdir(...args);
    }; syncBuiltinESMExports();
  `,
  );
  expect((await once(second.child, "message"))[0]).toBe("locking");
  expect(await readUsageHistory(store)).toEqual(before);
  first.child.send("publish");
  first.child.disconnect();
  expect((await first.exited)[0]).toBe(0);
  expect((await second.exited)[0]).toBe(0);
  // Each writer's session keeps its contribution beside the other's.
  expect(sessionTotals(await readUsageHistory(store))).toEqual([
    ["earlier", 1, 1],
    ["concurrent", 1, 2],
    ["second", 1, 3],
  ]);
});
