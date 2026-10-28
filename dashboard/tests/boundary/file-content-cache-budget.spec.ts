// Browser repository file cache stays within the declared 16 MiB budget:
// over-budget writes evict least-recently-used entries, a miss rereads, the
// current pinned revision stays revision-correct when refreshed, and retained
// size plateaus for a fixed working set (post-GC when available).
import { setFlagsFromString } from "node:v8";
import { runInNewContext } from "node:vm";
import { expect, test } from "../support/pageTest.ts";
import {
  cachedFile,
  fileContentCacheBudgetBytes,
  forgetCachedFiles,
  rememberFile,
  retainedFileContentBytes,
} from "../../src/fileContentCache.ts";

setFlagsFromString("--expose_gc");
const collectGarbage: (() => void) | undefined = (() => {
  try {
    return runInNewContext("gc") as () => void;
  } catch {
    return undefined;
  }
})();

const repository = "owner/file-content-cache-budget";
const path = "docs/seed.md";
const chunkBytes = 64 * 1024;
const overBudgetEntries =
  Math.floor(fileContentCacheBudgetBytes / chunkBytes) + 32;

function textFor(revision: string): string {
  const marker = `REV:${revision}:`;
  return marker + "X".repeat(chunkBytes - marker.length);
}

function rememberRevision(revision: string, text = textFor(revision)): void {
  rememberFile(repository, revision, path, text);
}

function heapUsed(): number {
  collectGarbage?.();
  return process.memoryUsage().heapUsed;
}

test.describe.configure({ mode: "serial" });

test.beforeEach(() => {
  forgetCachedFiles();
});

test("writes past the 16 MiB budget evict older entries that reread correctly", () => {
  for (let i = 0; i < overBudgetEntries; i++) {
    rememberRevision(`rev-${i}`);
  }
  expect(retainedFileContentBytes()).toBeLessThanOrEqual(
    fileContentCacheBudgetBytes,
  );
  expect(cachedFile(repository, "rev-0", path)).toBeUndefined();
  const reread = textFor("rev-0-reread");
  rememberRevision("rev-0", reread);
  expect(cachedFile(repository, "rev-0", path)).toBe(reread);
  expect(retainedFileContentBytes()).toBeLessThanOrEqual(
    fileContentCacheBudgetBytes,
  );
});

test("the current pinned snapshot stays revision-correct under eviction pressure", () => {
  const pinRevision = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const pinText = textFor("pin-correct");
  rememberRevision(pinRevision, pinText);
  for (let i = 0; i < overBudgetEntries; i++) {
    expect(cachedFile(repository, pinRevision, path)).toBe(pinText);
    rememberRevision(`pressure-${i}`);
  }
  expect(cachedFile(repository, pinRevision, path)).toBe(pinText);
  expect(retainedFileContentBytes()).toBeLessThanOrEqual(
    fileContentCacheBudgetBytes,
  );
});

test("retained size plateaus for a fixed working set after over-budget churn", () => {
  for (let i = 0; i < overBudgetEntries; i++) {
    rememberRevision(`churn-${i}`);
  }
  const workingSet = ["work-a", "work-b", "work-c", "work-d"];
  for (const revision of workingSet) {
    rememberRevision(revision);
  }
  const afterSettle = retainedFileContentBytes();
  expect(afterSettle).toBeLessThanOrEqual(fileContentCacheBudgetBytes);
  expect(afterSettle).toBeGreaterThan(0);

  const heapAtSettle = heapUsed();
  for (let round = 0; round < 8; round++) {
    for (const revision of workingSet) {
      expect(cachedFile(repository, revision, path)).toBe(textFor(revision));
      rememberRevision(revision);
    }
    expect(retainedFileContentBytes()).toBe(afterSettle);
  }
  // Further unique keys that would have grown an unbounded Map still leave
  // retained bytes and post-GC heap at the settled plateau, not another budget.
  for (let i = 0; i < overBudgetEntries; i++) {
    rememberRevision(`plateau-${i}`);
  }
  for (const revision of workingSet) {
    rememberRevision(revision);
    expect(cachedFile(repository, revision, path)).toBe(textFor(revision));
  }
  expect(retainedFileContentBytes()).toBeLessThanOrEqual(
    fileContentCacheBudgetBytes,
  );
  const heapAfterMore = heapUsed();
  expect(heapAfterMore - heapAtSettle).toBeLessThan(
    fileContentCacheBudgetBytes,
  );
});
