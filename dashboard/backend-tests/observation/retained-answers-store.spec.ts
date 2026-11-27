// The retained-answer store (../../server/retainedAnswers.ts) keeps one
// owner-only file per key. Another store on the same directory reads it
// back; one on a different directory does not. RevisionMemo.recalled
// (../../server/revisionMemo.ts) keeps a resolved read and writes nothing
// when that read rejects. held misses a removed directory, a mismatched key,
// and torn JSON. An unwritable directory warns once. A write past the byte
// budget removes least-recently-used files until the store is at most seven
// eighths of the budget, while an entry held() just used survives.

import {
  chmodSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";

function temporaryDirectory(): string {
  const directory = mkdtempSync(path.join(tmpdir(), "retained-answers-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

function jsonFiles(directory: string): string[] {
  return readdirSync(directory).filter((name) => name.endsWith(".json"));
}

function fileFor(directory: string, key: string): string {
  const found = jsonFiles(directory)
    .map((name) => path.join(directory, name))
    .find((file) => {
      const entry = JSON.parse(readFileSync(file, "utf8")) as {
        key?: unknown;
      };
      return entry.key === key;
    });
  if (found === undefined) {
    throw new Error(`no entry for ${key}`);
  }
  return found;
}

function storedBytes(directory: string): number {
  return jsonFiles(directory).reduce(
    (sum, name) => sum + statSync(path.join(directory, name)).size,
    0,
  );
}

function storedKeys(directory: string): string[] {
  return jsonFiles(directory)
    .map((name) => {
      const entry = JSON.parse(
        readFileSync(path.join(directory, name), "utf8"),
      ) as { key?: unknown };
      return entry.key;
    })
    .filter((key): key is string => typeof key === "string")
    .sort();
}

// Waits until Date.now() moves, so a following held() stamps a newer
// millisecond than files written before it.
async function nextMoment(): Promise<void> {
  const start = Date.now();
  while (Date.now() === start) {
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}

test("a kept answer is mode 0o700 on the directory and 0o600 on the file, and only a store on that directory reads it back", () => {
  const directory = temporaryDirectory();
  const elsewhere = temporaryDirectory();
  chmodSync(directory, 0o755);
  const key = "mode-key";
  const text = "mode-text";
  const budgetBytes = 4096;

  new RetainedAnswers({ directory, budgetBytes }).kept(key, text);

  expect(statSync(directory).mode & 0o777).toBe(0o700);
  const files = jsonFiles(directory);
  expect(files).toHaveLength(1);
  expect(statSync(path.join(directory, files[0] ?? "")).mode & 0o777).toBe(
    0o600,
  );
  expect(new RetainedAnswers({ directory, budgetBytes }).held(key)).toBe(text);
  expect(
    new RetainedAnswers({ directory: elsewhere, budgetBytes }).held(key),
  ).toBe(undefined);
});

test("RevisionMemo.recalled keeps a resolved read and a rejected read leaves no file", async () => {
  const kept = temporaryDirectory();
  const key = "resolved-key";
  const text = "resolved-text";
  const budgetBytes = 4096;
  await expect(
    new RevisionMemo(
      new RetainedAnswers({ directory: kept, budgetBytes }),
    ).recalled(key, true, () => Promise.resolve(text)),
  ).resolves.toBe(text);
  expect(new RetainedAnswers({ directory: kept, budgetBytes }).held(key)).toBe(
    text,
  );
  expect(jsonFiles(kept)).toHaveLength(1);

  for (const reason of ["missing", "failed", "rate-limited"]) {
    const directory = temporaryDirectory();
    const rejectedKey = `${reason}-key`;
    await expect(
      new RevisionMemo(
        new RetainedAnswers({ directory, budgetBytes }),
      ).recalled(rejectedKey, true, () => Promise.reject(new Error(reason))),
    ).rejects.toThrow(reason);
    expect(jsonFiles(directory)).toEqual([]);
    expect(
      new RetainedAnswers({ directory, budgetBytes }).held(rejectedKey),
    ).toBe(undefined);
  }
});

test("held misses when the directory was removed, the key does not match, or the JSON is torn", () => {
  const directory = temporaryDirectory();
  const budgetBytes = 4096;
  const store = new RetainedAnswers({ directory, budgetBytes });
  const removedKey = "removed-key";
  const mismatchedKey = "mismatched-key";
  const tornKey = "torn-key";
  const text = "stored-text";
  const torn = '{"key":"torn-key","text":"tor';

  store.kept(removedKey, text);
  rmSync(directory, { recursive: true, force: true });
  expect(store.held(removedKey)).toBe(undefined);

  store.kept(mismatchedKey, text);
  writeFileSync(
    fileFor(directory, mismatchedKey),
    JSON.stringify({ key: "other-key", text }),
  );
  expect(store.held(mismatchedKey)).toBe(undefined);

  store.kept(tornKey, text);
  writeFileSync(fileFor(directory, tornKey), torn);
  expect(store.held(tornKey)).toBe(undefined);
});

test("an unwritable directory warns once and a later kept does not warn or throw", () => {
  const root = temporaryDirectory();
  const blocked = path.join(root, "blocked");
  writeFileSync(blocked, "not a directory");
  const directory = path.join(blocked, "retained-answers");
  const store = new RetainedAnswers({ directory, budgetBytes: 4096 });
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  onTestFinished(() => {
    warn.mockRestore();
  });
  const warned =
    `Retained GitHub answers could not be written to ${directory}; ` +
    "this dashboard reads from GitHub instead. ";

  expect(() => {
    store.kept("first-key", "first-text");
  }).not.toThrow();
  expect(warn).toHaveBeenCalledTimes(1);
  expect(String(warn.mock.calls[0]?.[0]).startsWith(warned)).toBe(true);
  expect(String(warn.mock.calls[0]?.[0]).length).toBeGreaterThan(warned.length);

  expect(() => {
    store.kept("later-key", "later-text");
  }).not.toThrow();
  expect(warn).toHaveBeenCalledTimes(1);
  expect(jsonFiles(root)).toEqual([]);
});

test("a write past the budget removes least-recently-used files to at most 7/8, and a held entry survives", async () => {
  const directory = temporaryDirectory();
  const text = "answer-text";
  const survivor = "survivor";
  const unusedA = "unused-a";
  const unusedB = "unused-b";
  const newest = "newest";
  const bytes = (key: string) =>
    Buffer.byteLength(JSON.stringify({ key, text }));
  const fitting = bytes(survivor) + bytes(unusedA) + bytes(unusedB);
  const budgetBytes = fitting;
  const store = new RetainedAnswers({ directory, budgetBytes });

  store.kept(survivor, text);
  store.kept(unusedA, text);
  store.kept(unusedB, text);
  expect(storedBytes(directory)).toBe(fitting);
  expect(fitting + bytes(newest)).toBeGreaterThan(budgetBytes);

  await nextMoment();
  expect(store.held(survivor)).toBe(text);
  expect(statSync(fileFor(directory, survivor)).mtimeMs).toBeGreaterThan(
    statSync(fileFor(directory, unusedA)).mtimeMs,
  );
  expect(statSync(fileFor(directory, survivor)).mtimeMs).toBeGreaterThan(
    statSync(fileFor(directory, unusedB)).mtimeMs,
  );

  store.kept(newest, text);

  expect(storedBytes(directory)).toBeLessThanOrEqual((budgetBytes * 7) / 8);
  expect(storedKeys(directory)).toEqual([newest, survivor].sort());
  expect(store.held(unusedA)).toBe(undefined);
  expect(store.held(unusedB)).toBe(undefined);
});

test("omitting budgetBytes keeps a small file in an explicit directory", () => {
  const directory = temporaryDirectory();
  const key = "small-key";
  const text = "small-text";

  new RetainedAnswers({ directory }).kept(key, text);

  expect(jsonFiles(directory)).toHaveLength(1);
  expect(new RetainedAnswers({ directory }).held(key)).toBe(text);
});
