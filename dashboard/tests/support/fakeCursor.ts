// PATH stand-in for `cursor-agent`. The dashboard server and the page create
// the launch record. Launch argv is create-chat and a prompted resume.
// A resume with no prompt is a separate attach record and exits on SIGHUP.
// Working mode paints `ctrl+c to stop`. Idle and waiting modes paint the
// observed idle reply and clarifying question. Each redraws on SIGWINCH.
// `holdPrompt` keeps the prompted resume until `releasePrompt()`.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

export type CursorAttach = {
  readonly pid: number;
  readonly executable: string;
  readonly cwd: string;
  readonly args: readonly string[];
  readonly cols: number;
  readonly rows: number;
  readonly sessionId: string;
};

export type HeldPrompt = {
  readonly pid: number;
  readonly args: readonly string[];
};

export type FakeCursor = {
  readonly binDir: string;
  readonly env: Readonly<Record<string, string>>;
  readonly sessionId: string;
  calls(): CursorInvocation[];
  attaches(): CursorAttach[];
  signals(pid: number): string;
  input(pid: number): string;
  sizes(pid: number): { readonly cols: number; readonly rows: number }[];
  heldPrompts(): HeldPrompt[];
  heldInput(pid: number): string;
  releasePrompt(): void;
  cleanup(): void;
};

function readOptional(file: string): string | undefined {
  try {
    return readFileSync(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

function readJsonl<T>(file: string): T[] {
  return (readOptional(file) ?? "")
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => JSON.parse(line) as T);
}

export function installFakeCursor(options?: {
  readonly working?: boolean;
  readonly screen?: "working" | "idle" | "waiting";
  readonly holdPrompt?: boolean;
}): FakeCursor {
  const root = mkdtempSync(path.join(tmpdir(), "dough-cursor-"));
  const binDir = path.join(root, "bin");
  const logPath = path.join(root, "argv.jsonl");
  const attachDir = path.join(root, "attach");
  const holdDir = path.join(root, "hold");
  const releasePath = path.join(root, "release");
  installFixtureExecutable("fake-cursor", binDir, "cursor-agent");
  const attaches = (): CursorAttach[] =>
    readJsonl(path.join(attachDir, "attaches.jsonl"));
  const heldPrompts = (): HeldPrompt[] =>
    readJsonl(path.join(holdDir, "holds.jsonl"));
  const screen =
    options?.screen ?? (options?.working === true ? "working" : undefined);
  return {
    binDir,
    sessionId: cursorSessionId,
    env: {
      FAKE_CURSOR_LOG: logPath,
      FAKE_CURSOR_SESSION_ID: cursorSessionId,
      FAKE_CURSOR_ATTACH_DIR: attachDir,
      ...(screen !== undefined ? { FAKE_CURSOR_ATTACH_MODE: screen } : {}),
      ...(options?.holdPrompt === true
        ? {
            FAKE_CURSOR_RELEASE: releasePath,
            FAKE_CURSOR_HOLD_DIR: holdDir,
          }
        : {}),
    },
    calls() {
      return readJsonl<CursorInvocation>(logPath);
    },
    attaches,
    signals(pid: number) {
      return readOptional(path.join(attachDir, `${String(pid)}.signals`)) ?? "";
    },
    input(pid: number) {
      return readOptional(path.join(attachDir, `${String(pid)}.input`)) ?? "";
    },
    sizes(pid: number) {
      return readJsonl(path.join(attachDir, `${String(pid)}.sizes`));
    },
    heldPrompts,
    heldInput(pid: number) {
      return readOptional(path.join(holdDir, `${String(pid)}.input`)) ?? "";
    },
    releasePrompt() {
      writeFileSync(releasePath, "");
    },
    cleanup() {
      for (const held of heldPrompts()) {
        try {
          process.kill(held.pid, "SIGTERM");
        } catch {
          // Already gone.
        }
      }
      for (const attach of attaches()) {
        try {
          process.kill(attach.pid, "SIGTERM");
        } catch {
          // Already gone.
        }
      }
      rmSync(root, { recursive: true, force: true });
    },
  };
}
