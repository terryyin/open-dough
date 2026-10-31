// The machine-document revision (../../server/machineJsonStore.ts): this
// server's write count and each document's file identity. It changes when this
// server writes, and when another process replaces a document by rename.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { z } from "zod";
import { expect, test } from "../support/pageTest.ts";
import { machineDashboardDirectory } from "../../server/machineHome.ts";
import {
  machineDocumentsRevision,
  replaceMachineJson,
  type MachineJsonStore,
} from "../../server/machineJsonStore.ts";
import {
  replaceFileKeepingTimes,
  settleFile,
} from "../support/machineFileIdentity.ts";
import { withRestoredEnv } from "../support/testEnv.ts";

let home: string;
let restoreHome: () => void;
let store: MachineJsonStore<Record<string, number[]>>;

test.beforeEach(() => {
  home = mkdtempSync(path.join(tmpdir(), "dough-machine-revision-"));
  restoreHome = withRestoredEnv({ HOME: home });
  const folder = machineDashboardDirectory();
  mkdirSync(folder, { recursive: true });
  store = {
    file: path.join(folder, "document.json"),
    schema: z.record(z.string(), z.array(z.number())),
    empty: {},
  };
});

test.afterEach(() => {
  restoreHome();
  rmSync(home, { recursive: true, force: true });
});

test("changes on this server's write and on another process's rename replacement", async () => {
  writeFileSync(store.file, JSON.stringify({ a: [1] }));
  settleFile(store.file);
  const before = await machineDocumentsRevision();

  await replaceMachineJson(store, () => ({ a: [2] }));
  expect(await machineDocumentsRevision()).not.toBe(before);

  // Same size and times as the settled file, so only the rename's inode differs.
  writeFileSync(store.file, JSON.stringify({ a: [3] }));
  settleFile(store.file);
  const settled = await machineDocumentsRevision();
  replaceFileKeepingTimes(store.file, JSON.stringify({ a: [4] }));
  expect(await machineDocumentsRevision()).not.toBe(settled);
});
