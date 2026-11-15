// A failed replacement and concurrent writer processes leave one coherent
// history document.
import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  test,
  expect,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  failing,
  importFailure,
  keepOperationalLaunch,
  readImported,
  runImport,
  sessionTotals,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";

test("a failed replacement keeps the previous history readable and a retry counts each response once", ({
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
    importFailure(home, root, failing("rename", "/usage.json")),
  ).toMatchObject({
    status: 1,
    stderr: expect.stringContaining("injected rename failure"),
  });
  expect(readImported(home)).toEqual(before);
  runImport(home, root);
  const after = readImported(home);
  expect(sessionTotals(after)).toEqual([["atomic", 2, 5]]);
  runImport(home, root);
  expect(readImported(home)).toEqual(after);
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
  runImport(home, earlier);
  const before = readImported(home);
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
  expect(readImported(home)).toEqual(before);
  first.child.send("publish");
  first.child.disconnect();
  expect((await first.exited)[0]).toBe(0);
  expect((await second.exited)[0]).toBe(0);
  // Each writer's session keeps its contribution beside the other's.
  expect(sessionTotals(readImported(home))).toEqual([
    ["earlier", 1, 1],
    ["concurrent", 1, 2],
    ["second", 1, 3],
  ]);
});
