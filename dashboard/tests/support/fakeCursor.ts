// PATH stand-in for `cursor-agent`. The dashboard server and the page create
// the launch record. Launch argv is create-chat and a prompted resume.
// A resume with no prompt is a separate attach record and exits on SIGHUP.
// Working mode paints `ctrl+c to stop`. The default attach screen is the
// ordinary finished prompt. Waiting mode paints the clarifying question.
// Unrecognized mode paints neither the prompt nor a question. Each redraws
// on SIGWINCH.
// `holdPrompt` keeps the prompted resume until `releasePrompt()`.
// `models` prints the configured listing in the observed layout, or fails.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { installFixtureExecutable } from "./fixtureExecutable.ts";

export const cursorSessionId = "6f1e8c2a-9b34-4d5e-8f70-1a2b3c4d5e6f";

// The second name ends with U+200B, as some observed names do.
export const cursorModels = [
  { model: "auto", name: "Auto (default)" },
  { model: "gpt-5.2", name: "GPT-5.2\u200B" },
] as const;

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
  modelReads(): { readonly args: readonly string[]; readonly cwd: string }[];
  // Undefined makes `models` exit nonzero.
  listModels(
    models:
      readonly { readonly model: string; readonly name: string }[] | undefined,
  ): void;
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
  readonly screen?: "working" | "waiting" | "unrecognized";
  readonly holdPrompt?: boolean;
}): FakeCursor {
  const root = mkdtempSync(path.join(tmpdir(), "dough-cursor-"));
  const binDir = path.join(root, "bin");
  const logPath = path.join(root, "argv.jsonl");
  const modelsPath = path.join(root, "models.txt");
  const modelsLogPath = path.join(root, "models.jsonl");
  const attachDir = path.join(root, "attach");
  const holdDir = path.join(root, "hold");
  const releasePath = path.join(root, "release");
  installFixtureExecutable("fake-cursor", binDir, "cursor-agent");
  const attaches = (): CursorAttach[] =>
    readJsonl(path.join(attachDir, "attaches.jsonl"));
  const listModels: FakeCursor["listModels"] = (models) => {
    if (models === undefined) {
      rmSync(modelsPath, { force: true });
      return;
    }
    writeFileSync(
      modelsPath,
      [
        "Available models",
        "",
        ...models.map(({ model, name }) => `${model} - ${name}`),
        "",
        "Tip: a fixture line - not a model",
        "",
      ].join("\n"),
    );
  };
  listModels(cursorModels);
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
      FAKE_CURSOR_MODELS: modelsPath,
      FAKE_CURSOR_MODELS_LOG: modelsLogPath,
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
    modelReads() {
      return readJsonl(modelsLogPath);
    },
    listModels,
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
