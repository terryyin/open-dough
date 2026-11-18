// Concurrent comparison renderers must not share Vite's default optimizer cache.
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createComparisonRenderer } from "../../test-support/support/comparisonRendering.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import { expect, test } from "../../test-support/support/pageTest.ts";

const sharedDefaultCache = path.join(repoRoot, "dashboard/node_modules/.vite");

test("comparison renderers keep private Vite optimizer caches outside the shared default", async () => {
  const [first, second] = await Promise.all([
    createComparisonRenderer(),
    createComparisonRenderer(),
  ]);
  try {
    for (const renderer of [first, second]) {
      expect(renderer.viteCacheDir.startsWith(tmpdir())).toBe(true);
      expect(path.resolve(renderer.viteCacheDir)).not.toBe(
        path.resolve(sharedDefaultCache),
      );
      expect(existsSync(renderer.viteCacheDir)).toBe(true);
    }
    expect(path.resolve(first.viteCacheDir)).not.toBe(
      path.resolve(second.viteCacheDir),
    );
  } finally {
    await Promise.all([first.close(), second.close()]);
  }
  expect(existsSync(first.viteCacheDir)).toBe(false);
  expect(existsSync(second.viteCacheDir)).toBe(false);
});
