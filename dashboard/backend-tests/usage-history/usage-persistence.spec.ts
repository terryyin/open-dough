// Routine launch operations never scan imported usage evidence.
import {
  expect,
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  nodeProcess,
} from "../../test-support/usage-history/importHarness.ts";

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
