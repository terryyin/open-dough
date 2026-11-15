// Publication failures and concurrent processes must preserve coherent evidence.
import { spawn } from "node:child_process";
import { once } from "node:events";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  expect,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  readImported,
  readStoredRows,
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";

for (const failure of ["page", "manifest"] as const) {
  test(`${failure} publication failure keeps the previous snapshot readable and retry retains each response once`, ({
    home,
    root,
  }) => {
    keepOperationalLaunch(home, launch("atomic", "turn"));
    const first = makeMe.aCodexRollout
      .forSession("atomic")
      .withResponse("turn", "one", { output_tokens: 2 })
      .please();
    writeCodexSession(root, first);
    runImport(home, root);
    const before = readImported(home);
    writeCodexSession(
      root,
      makeMe.aCodexRollout
        .forSession("atomic")
        .withResponse("turn", "one", { output_tokens: 2 })
        .withResponse("turn", "two", { output_tokens: 3 })
        .please(),
    );
    const preload = `data:text/javascript,${encodeURIComponent(`
      import fs from 'node:fs/promises';
      import { syncBuiltinESMExports } from 'node:module';
      const rename = fs.rename;
      fs.rename = async (source, target) => {
        if (${failure === "page" ? "target.includes('usage.json.pages/')" : "target.endsWith('/usage.json')"}) throw new Error('injected ${failure} publication failure');
        return rename(source, target);
      };
      syncBuiltinESMExports();
    `)}`;
    let failureResult: { status?: number; stderr?: Buffer } | undefined;
    try {
      runImport(home, root, [], ["--import", preload]);
    } catch (error) {
      failureResult = error as typeof failureResult;
    }
    expect(failureResult?.status).toBe(1);
    expect(String(failureResult?.stderr)).toContain(
      `injected ${failure} publication failure`,
    );
    expect(readImported(home)).toEqual(before);
    // Neither corrupt nor plausible orphan pages may contribute facts.
    writeFileSync(
      path.join(
        home,
        ".open-dough/dashboard/launch-history/usage.json.pages",
        `${"a".repeat(64)}.json`,
      ),
      "{broken orphan",
    );
    expect(readImported(home)).toEqual(before);
    runImport(home, root);
    const after = readImported(home);
    expect(
      Object.values(after.observations).map((item) => item.tokens.output),
    ).toEqual([2, 3]);
    expect(Object.values(after.associations)).toHaveLength(2);
    runImport(home, root);
    expect(Object.values(readImported(home).observations)).toHaveLength(2);
  });
}

test("a reader holding the earlier manifest stays coherent while another process publishes", async ({
  home,
  root,
}) => {
  keepOperationalLaunch(home, launch("coherent", "turn"));
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("coherent")
      .withResponse("turn", "one", { output_tokens: 2 })
      .please(),
  );
  runImport(home, root);
  const reader = spawn(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    import { openUsageSnapshot, readSnapshotHistory } from './dashboard/server/usageSnapshot.ts';
    const held = await openUsageSnapshot(${JSON.stringify(path.join(home, ".open-dough/dashboard/launch-history/usage.json"))});
    console.log('held');
    process.stdin.once('data', async () => { console.log(JSON.stringify(await readSnapshotHistory(held))); process.stdin.destroy(); });
  `,
    ],
    { env: { ...process.env, HOME: home }, stdio: ["pipe", "pipe", "pipe"] },
  );
  const exit = once(reader, "exit");
  const lines = createInterface({ input: reader.stdout });
  const held = await once(lines, "line");
  expect(held[0]).toBe("held");
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("coherent")
      .withResponse("turn", "one", { output_tokens: 2 })
      .withResponse("turn", "two", { output_tokens: 3 })
      .please(),
  );
  runImport(home, root);
  const result = once(lines, "line");
  reader.stdin.end("continue\n");
  const old = JSON.parse((await result)[0] as string) as ReturnType<
    typeof readImported
  >;
  expect(
    Object.values(old.observations).map((item) => item.tokens.output),
  ).toEqual([2]);
  expect(
    Object.values(readImported(home).observations).map(
      (item) => item.tokens.output,
    ),
  ).toEqual([2, 3]);
  expect((await exit)[0]).toBe(0);
  lines.close();
});

test("cross-process writers reconcile accepted updates after waiting for the shared publication lock", async ({
  home,
  root,
}) => {
  keepOperationalLaunch(home, launch("concurrent", "turn"));
  const other = path.join(home, "other-native");
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
      .forSession("concurrent")
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
        "dashboard/server/importUsageHistory.ts",
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
  first.child.send("publish");
  first.child.disconnect();
  expect((await first.exited)[0]).toBe(0);
  expect((await second.exited)[0]).toBe(0);
  const after = readStoredRows(home);
  expect(
    Object.values(after.observations).map((item) => item.tokens.output),
  ).toEqual([2, 3]);
  expect(Object.values(after.associations)).toHaveLength(2);
  expect(
    new Set(Object.values(after.associations).map((item) => item.taskId)).size,
  ).toBe(1);
});
