// PATH stand-in for `cursor-agent`. The dashboard server and the page create
// the launch record; this binary only prints an id and records argv.
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { installFixtureExecutable } from "./fixtureExecutable.ts";

export const cursorSessionId = "6f1e8c2a-9b34-4d5e-8f70-1a2b3c4d5e6f";

export type CursorInvocation = {
  readonly executable: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly stored: string | null;
};

export type FakeCursor = {
  readonly binDir: string;
  readonly env: Readonly<Record<string, string>>;
  readonly sessionId: string;
  calls(): CursorInvocation[];
  cleanup(): void;
};

export function installFakeCursor(): FakeCursor {
  const root = mkdtempSync(path.join(tmpdir(), "dough-cursor-"));
  const binDir = path.join(root, "bin");
  const logPath = path.join(root, "argv.jsonl");
  installFixtureExecutable("fake-cursor", binDir, "cursor-agent");
  return {
    binDir,
    sessionId: cursorSessionId,
    env: {
      FAKE_CURSOR_LOG: logPath,
      FAKE_CURSOR_SESSION_ID: cursorSessionId,
    },
    calls() {
      try {
        return readFileSync(logPath, "utf8")
          .split("\n")
          .filter((line) => line !== "")
          .map((line) => JSON.parse(line) as CursorInvocation);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw error;
      }
    },
    cleanup() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}
