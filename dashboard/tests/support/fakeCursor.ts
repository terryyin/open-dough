// PATH stand-in for `cursor-agent`. The dashboard server and the page create
// the launch record. Launch argv is create-chat. A resume with no prompt
// argument, including `--model` and no prompt, is a separate attach record
// and exits on SIGHUP. Working mode paints `ctrl+c to stop`. The default
// attach screen is the ordinary finished prompt. Waiting mode paints the
// clarifying question. Trust mode paints a screen that is not ready for an
// instruction. Composer mode paints `→ Plan, search, build anything` with
// the cursor hidden and no synchronized-update frame. Unrecognized mode
// paints neither the prompt nor a question.
// Each redraws on SIGWINCH. `showReady()` repaints the ordinary prompt.
// `splitPaintMs` delivers each screen in two writes that far apart.
// `models` prints the configured listing in the observed layout, or fails.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { cursorCannotLoadChat } from "../../src/cursorCannotLoad.ts";
import { appendedRecords } from "./appendedRecords.ts";
import { installFixtureExecutable } from "./fixtureExecutable.ts";
import type { FakeHostWiring } from "./launchEnvironment.ts";

export const cursorSessionId = "6f1e8c2a-9b34-4d5e-8f70-1a2b3c4d5e6f";

// The second name ends with U+200B, as some observed names do.
export const cursorModels = [
  { model: "auto", name: "Auto (default)" },
  { model: "gpt-5.2", name: "GPT-5.2\u200B" },
] as const;

// The fake's directory and wiring, for reading its recorded environment.
export const fakeCursorHost: FakeHostWiring = {
  binDir: "cursor-bin",
  wiring: "FAKE_CURSOR_LOG",
};

export type CursorInvocation = {
  readonly executable: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly stored: string | null;
  // The part of its environment ../fixtures/fake-host-environment.cjs records.
  readonly env: Readonly<Record<string, string>>;
};

export type CursorAttach = {
  readonly pid: number;
  readonly executable: string;
  readonly cwd: string;
  readonly args: readonly string[];
  readonly cols: number;
  readonly rows: number;
  readonly sessionId: string;
  readonly stored: string | null;
  readonly env: Readonly<Record<string, string>>;
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
  // Repaint the ordinary follow-up prompt on the running terminal client.
  showReady(): void;
  // Next resume/attach reads this mode (overrides FAKE_CURSOR_ATTACH_MODE).
  setAttachMode(mode: CursorScreen | undefined): void;
  // Next create-chat prints this id once, then returns to sessionId.
  queueCreateChatId(sessionId: string): void;
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
  return appendedRecords<T>(readOptional(file) ?? "");
}

export type CursorScreen =
  | "working"
  | "waiting"
  | "unrecognized"
  | "trust"
  | "composer"
  | "exit"
  | "cannot-load";

export const unclassifiedCursorExit =
  "Cursor resume failed for an unclassified reason.";

export { cursorCannotLoadChat };

export function installFakeCursor(options?: {
  readonly working?: boolean;
  readonly screen?: CursorScreen;
  readonly becomeReady?: boolean;
  readonly paintDelayMs?: number;
  readonly splitPaintMs?: number;
}): FakeCursor {
  const root = mkdtempSync(path.join(tmpdir(), "dough-cursor-"));
  const binDir = path.join(root, fakeCursorHost.binDir);
  const logPath = path.join(root, "argv.jsonl");
  const modelsPath = path.join(root, "models.txt");
  const modelsLogPath = path.join(root, "models.jsonl");
  const attachDir = path.join(root, "attach");
  const readyPath = path.join(root, "ready");
  const attachModePath = path.join(root, "attach-mode");
  const nextSessionPath = path.join(root, "next-session-id");
  installFixtureExecutable("fake-cursor", binDir, "cursor-agent");
  installFixtureExecutable(
    "fake-host-environment.cjs",
    binDir,
    "fake-host-environment.cjs",
  );
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
      FAKE_CURSOR_ATTACH_MODE_FILE: attachModePath,
      FAKE_CURSOR_NEXT_SESSION_FILE: nextSessionPath,
      FAKE_CURSOR_CANNOT_LOAD: cursorCannotLoadChat,
      ...(screen !== undefined ? { FAKE_CURSOR_ATTACH_MODE: screen } : {}),
      ...(options?.becomeReady === true
        ? { FAKE_CURSOR_BECOME_READY: readyPath }
        : {}),
      ...(options?.paintDelayMs === undefined
        ? {}
        : { FAKE_CURSOR_PAINT_DELAY_MS: String(options.paintDelayMs) }),
      ...(options?.splitPaintMs === undefined
        ? {}
        : { FAKE_CURSOR_SPLIT_PAINT_MS: String(options.splitPaintMs) }),
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
    showReady() {
      writeFileSync(readyPath, "");
    },
    setAttachMode(mode) {
      if (mode === undefined) {
        rmSync(attachModePath, { force: true });
        return;
      }
      writeFileSync(attachModePath, `${mode}\n`);
    },
    queueCreateChatId(sessionId) {
      writeFileSync(nextSessionPath, `${sessionId}\n`);
    },
    cleanup() {
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
