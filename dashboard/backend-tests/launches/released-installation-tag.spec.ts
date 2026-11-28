// The released installation's tag source against a local bare origin that does
// not hold the pinned tag: no branch or working-tree fallback.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import {
  installRelease,
  pinnedRelease,
} from "../../test-support/support/taggedInstallation.ts";

test("a pinned tag its origin lacks fails naming the tag and leaves no installation", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-release-tag-"));
  onTestFinished(() => {
    rmSync(machine, { recursive: true, force: true });
  });
  const origin = path.join(machine, "origin.git");
  const checkout = path.join(machine, "checkout");
  const work = path.join(machine, "tmp");
  mkdirSync(work);
  execFileSync("git", ["init", "--quiet", "--bare", origin]);
  execFileSync("git", ["clone", "--quiet", origin, checkout], {
    stdio: "ignore",
  });
  vi.stubEnv("TMPDIR", work);
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });

  await expect(
    installRelease(checkout, pinnedRelease, "codex"),
  ).rejects.toThrow(`Release tag ${pinnedRelease.tag} is unavailable`);
  expect(readdirSync(work)).toEqual([]);
});
