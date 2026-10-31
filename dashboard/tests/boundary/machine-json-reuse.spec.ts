// How often a machine document (../../server/machineJsonStore.ts) is parsed:
// once while its file is unchanged, however many reads ask, and again on the
// first read after any replacement. An unreadable replacement is never
// answered from an earlier parse, and the write path parses afresh. Each test
// owns a fresh directory and counts parses through its document's schema.

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { z } from "zod";
import { expect, test } from "../support/pageTest.ts";
import {
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
} from "../../server/machineJsonStore.ts";
import {
  replaceFileKeepingTimes,
  settleFile,
} from "../support/machineFileIdentity.ts";

let directory: string;
let parses: number;
let store: MachineJsonStore<Record<string, number[]>>;

test.beforeEach(() => {
  directory = mkdtempSync(path.join(tmpdir(), "dough-machine-json-"));
  parses = 0;
  store = {
    file: path.join(directory, "document.json"),
    schema: z.record(z.string(), z.array(z.number())).superRefine(() => {
      parses += 1;
    }),
    empty: {},
  };
});

test.afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

// Writes the file in place, dated a minute back so its identity is settled.
function writeSettled(text: string): void {
  writeFileSync(store.file, text);
  settleFile(store.file);
}

async function documentOf() {
  const read = await readMachineJson(store);
  return read.kind === "document" ? read.document : "unreadable";
}

test("parses an unchanged document once however many reads ask, answering the same frozen document", async () => {
  writeSettled(JSON.stringify({ a: [1, 2] }));
  const answers = [];
  for (let index = 0; index < 5; index += 1) answers.push(await documentOf());
  expect(parses).toBe(1);
  expect(answers).toEqual(Array(5).fill({ a: [1, 2] }));
  const [first] = answers as Record<string, number[]>[];
  expect(() => first?.["a"]?.push(3)).toThrow(TypeError);
  expect(await documentOf()).toEqual({ a: [1, 2] });
});

test("parses a document replaced by another process on its next read, and then holds the new one", async () => {
  writeSettled(JSON.stringify({ a: [1] }));
  expect(await documentOf()).toEqual({ a: [1] });
  replaceFileKeepingTimes(store.file, JSON.stringify({ a: [2] }));
  expect(await documentOf()).toEqual({ a: [2] });
  expect(await documentOf()).toEqual({ a: [2] });
  expect(parses).toBe(2);
});

test("answers an unreadable replacement unreadable on every read, never from the earlier parse", async () => {
  const good = JSON.stringify({ a: [1] });
  writeSettled(good);
  expect(await documentOf()).toEqual({ a: [1] });
  replaceFileKeepingTimes(store.file, `x${good.slice(1)}`);
  expect(await documentOf()).toBe("unreadable");
  expect(await documentOf()).toBe("unreadable");
  replaceFileKeepingTimes(store.file, JSON.stringify({ b: [1] }));
  expect(await documentOf()).toEqual({ b: [1] });
});

test("parses a file modified moments ago on every read until its identity settles", async () => {
  writeFileSync(store.file, JSON.stringify({ a: [1] }));
  await documentOf();
  await documentOf();
  expect(parses).toBe(2);
  settleFile(store.file);
  await documentOf();
  await documentOf();
  expect(parses).toBe(3);
});

test("answers the empty document for a missing file, and a file written later on the next read", async () => {
  expect(await documentOf()).toEqual({});
  writeSettled(JSON.stringify({ a: [1] }));
  expect(await documentOf()).toEqual({ a: [1] });
});

test("gives the write path a document of its own, parsed afresh under the lock, and answers its write on the next read", async () => {
  writeSettled(JSON.stringify({ a: [1] }));
  const held = await documentOf();
  await replaceMachineJson(store, (stored) => {
    expect(stored).not.toBe(held);
    stored["a"]?.push(2);
    return stored;
  });
  expect(parses).toBe(2);
  expect(held).toEqual({ a: [1] });
  expect(await documentOf()).toEqual({ a: [1, 2] });
});
