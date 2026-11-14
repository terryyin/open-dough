// Failed atomic persistence preserves evidence; routine launch operations never scan it.
import { readFileSync, writeFileSync } from "node:fs";
import {
  expect,
  test,
  launch,
  meta,
  response,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  nativeFile,
  nodeProcess,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";

test.describe("usage persistence isolation", () => {
  test("preserves prior readable history on failed persistence and retries once", ({
    home,
    root,
  }) => {
    keepOperationalLaunch(home, launch("retry", "turn"));
    const file = nativeFile(root, "retry", [
      meta("retry"),
      response("retry", "turn", "one", { output_tokens: 1 }),
    ]);
    runImport(home, root);
    const before = readImported(home);
    writeFileSync(
      file,
      `${readFileSync(file, "utf8") + JSON.stringify(response("retry", "turn", "two", { output_tokens: 2 }))}\n`,
    );
    const hook = `
      import fs from "node:fs/promises";
      import { syncBuiltinESMExports } from "node:module";
      const rename = fs.rename;
      fs.rename = async (from, to) => {
        if (String(to).endsWith("/usage.json")) throw Error("injected replacement failure");
        return rename(from, to);
      };
      syncBuiltinESMExports();
    `;
    let failure: { status?: number; stderr?: Buffer } | undefined;
    try {
      runImport(
        home,
        root,
        [],
        ["--import", `data:text/javascript,${encodeURIComponent(hook)}`],
      );
    } catch (error) {
      failure = error as typeof failure;
    }
    expect(failure?.status).toBe(1);
    expect(String(failure?.stderr)).toBe("injected replacement failure\n");
    expect(readImported(home)).toEqual(before);
    runImport(home, root);
    expect(Object.values(readImported(home).observations)).toHaveLength(2);
    runImport(home, root);
    expect(Object.values(readImported(home).observations)).toHaveLength(2);
  });

  test("ordinary operational reads and writes never open native usage or imported history", ({
    home,
  }) => {
    keepOperationalLaunch(home, launch("ordinary", "turn"));
    expect(
      nodeProcess(
        home,
        `
      import fs from 'node:fs/promises';
      import { syncBuiltinESMExports } from 'node:module';
      const home = process.env.HOME;
      for (const method of ['open', 'readFile', 'readdir']) {
        const original = fs[method];
        fs[method] = (...args) => {
          const file = String(args[0]);
          if (file.includes('/launch-history') || file.includes('/.codex/')) throw Error('Unexpected usage scan: ' + file);
          return original(...args);
        };
      }
      syncBuiltinESMExports();
      const { readStoredRecords, replaceRecords } = await import('./dashboard/server/launchRecordDocument.ts');
      const before = await readStoredRecords();
      await replaceRecords(records => records);
      console.log(JSON.stringify(before));
    `,
      ),
    ).toContain("ordinary");
  });
});
