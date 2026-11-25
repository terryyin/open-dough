import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";

let heldRename:
  { file: string; reached: () => void; released: Promise<void> } | undefined;

vi.mock(import("node:fs/promises"), async (importOriginal) => {
  const fs = await importOriginal();
  return {
    ...fs,
    rename: async (source, destination) => {
      if (heldRename !== undefined && destination === heldRename.file) {
        heldRename.reached();
        await heldRename.released;
      }
      await fs.rename(source, destination);
    },
  };
});

test("closing during admission keeps the exact attempt for recovery without running it", async () => {
  const request = makeMe.aLaunchRequest
    .adHoc({ instruction: "Keep this launch request for recovery." })
    .please();
  const run = vi.fn<AttemptRun>(() =>
    Promise.resolve({
      kind: "failed",
      reason: "refused",
      explanation: "Unexpected launch effect.",
    }),
  );
  const owner = new LaunchAttemptOwner();
  let reachRename!: () => void;
  const renameReached = new Promise<void>((resolve) => {
    reachRename = resolve;
  });
  let releaseRename!: () => void;
  const renameReleased = new Promise<void>((resolve) => {
    releaseRename = resolve;
  });

  const home = mkdtempSync(path.join(tmpdir(), "dough-admission-close-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  heldRename = {
    file: machineDashboardPath("launch-attempts.json"),
    reached: reachRename,
    released: renameReleased,
  };

  const acceptance = owner.accept(request, run);
  try {
    await Promise.race([
      renameReached,
      acceptance.then(() => {
        throw new Error(
          "Admission returned before the attempt-file replacement.",
        );
      }),
    ]);
    owner.close();
    releaseRename();

    const refusal = await acceptance;
    assert.strictEqual(refusal.kind, "failed");
    expect(refusal.reason).toBe("refused");
    expect(refusal.explanation).toContain("nothing was started or launched");
    expect(run).not.toHaveBeenCalled();
    const attempts = await keptAttempts();
    expect(attempts).toHaveLength(1);
    expect(attempts?.[0]?.id).toMatch(/\S/);
    expect(attempts?.[0]?.request).toEqual(request);
    expect(attempts?.[0]?.outcome).toBeUndefined();
  } finally {
    owner.close();
    releaseRename();
    try {
      await acceptance.catch(() => undefined);
      await owner.drain();
    } finally {
      heldRename = undefined;
      vi.unstubAllEnvs();
      rmSync(home, { recursive: true, force: true });
    }
  }
});
