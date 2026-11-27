import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { machineFolder } from "../../server/localFolder.ts";
import { installFakeCodex } from "../../test-support/support/fakeCodex.ts";

export const source = "open-dough";
export const story = {
  identity: "SEED-001#read",
  title: "Read saved session",
  source,
};

export async function startNativeCodexEndpoint(root: string) {
  const native = await installFakeCodex(root, process.env["PATH"] ?? "", true);
  onTestFinished(() => native.close());
  return native;
}

export function privateHome() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-codex-status-"));
  vi.stubEnv("HOME", home);
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  return home;
}

export function codexRecord(sessionId: string, endpoint?: string) {
  return makeMe.aLaunchRecord
    .refining(story)
    .inCodexSession(
      endpoint === undefined
        ? { sessionId }
        : {
            sessionId,
            continuation: {
              workspace: path.join(machineFolder().path, "git", source),
              endpoint,
            },
          },
    )
    .please();
}
