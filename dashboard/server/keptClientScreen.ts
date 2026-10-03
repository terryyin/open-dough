// Visible screen of one kept terminal client. The page's xterm is gone once
// the last socket closes, so the idle end rule reads this model instead.
// `@xterm/headless` is the same xterm major as the page. Its Node build is
// CommonJS whose named export Node cannot see, so it is loaded with require
// from this file's own URL (Vite rewrites that URL back to this source).
import { createRequire } from "node:module";
import type {
  ITerminalInitOnlyOptions,
  ITerminalOptions,
  Terminal,
} from "@xterm/headless";

const require = createRequire(import.meta.url);
const { Terminal: HeadlessTerminal } = require("@xterm/headless") as {
  Terminal: new (
    options?: ITerminalOptions & ITerminalInitOnlyOptions,
  ) => Terminal;
};

export class KeptClientScreen {
  private readonly terminal: Terminal;
  private readonly csi: { dispose(): void }[];
  private pending: Promise<void> = Promise.resolve();
  // The page starts hidden and learns `?25` from the stream. A screen that
  // never shows the cursor is not ready for an instruction.
  private cursorOn = false;
  private framePending = false;
  private frameDone = false;

  constructor(cols: number, rows: number) {
    // The buffer is proposed API on this build. The page reads the same
    // buffer from `@xterm/xterm`.
    this.terminal = new HeadlessTerminal({
      cols,
      rows,
      allowProposedApi: true,
    });
    const mode = (enabled: boolean, params: number[]) => {
      if (params.includes(2026)) {
        this.framePending = enabled;
        if (!enabled) this.frameDone = true;
      }
      if (params.includes(25)) this.cursorOn = enabled;
      return false;
    };
    const values = (params: (number | number[])[]) =>
      params.filter((item): item is number => typeof item === "number");
    this.csi = [
      this.terminal.parser.registerCsiHandler(
        { prefix: "?", final: "h" },
        (params) => mode(true, values(params)),
      ),
      this.terminal.parser.registerCsiHandler(
        { prefix: "?", final: "l" },
        (params) => mode(false, values(params)),
      ),
    ];
  }

  cursorVisible(): boolean {
    return this.cursorOn;
  }

  // A synchronized update (`?2026`) has finished and none is open. The page
  // reports readiness on that same boundary.
  completedFrame(): boolean {
    return this.frameDone && !this.framePending;
  }

  takeFrame(): void {
    this.frameDone = false;
  }

  write(data: string): void {
    this.pending = this.pending
      .then(
        () =>
          new Promise<void>((resolve) => {
            this.terminal.write(data, () => {
              resolve();
            });
          }),
      )
      .catch(() => {
        // A write already queued can fail once the screen is disposed.
      });
  }

  resize(cols: number, rows: number): void {
    this.terminal.resize(cols, rows);
  }

  settled(): Promise<void> {
    return this.pending;
  }

  // The visible rows, trimmed on the right, the same way the page reports a
  // screen for readiness.
  text(): string {
    const buffer = this.terminal.buffer.active;
    return Array.from(
      { length: this.terminal.rows },
      (...[, row]) =>
        buffer.getLine(buffer.baseY + row)?.translateToString(true) ?? "",
    ).join("\n");
  }

  dispose(): void {
    for (const handler of this.csi) handler.dispose();
    this.terminal.dispose();
  }
}
