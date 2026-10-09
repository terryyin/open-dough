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

export type FrameScreen = {
  readonly text: string;
  readonly cursorVisible: boolean;
};

export class KeptClientScreen {
  private readonly terminal: Terminal;
  private readonly csi: { dispose(): void }[];
  private pending: Promise<void> = Promise.resolve();
  // Starts hidden. `?25` from the stream shows or hides the cursor. The
  // host's ready rule decides whether a hidden cursor can take an instruction.
  private cursorOn = false;
  private framePending = false;
  // The screen as the last synchronized update finished, until taken.
  private frameEnd: FrameScreen | undefined;

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
        if (!enabled) {
          this.frameEnd = { text: this.text(), cursorVisible: this.cursorOn };
        }
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

  // A synchronized update (`?2026`) has started and not finished, so the
  // screen can still be part of one paint. The page reports readiness only
  // outside such an update.
  frameOpen(): boolean {
    return this.framePending;
  }

  // A synchronized update has finished since its frame was last taken.
  completedFrame(): boolean {
    return this.frameEnd !== undefined;
  }

  // The screen that finished frame showed. Later output can already have
  // changed the screen since.
  completedFrameScreen(): FrameScreen | undefined {
    return this.frameEnd;
  }

  takeFrame(): void {
    this.frameEnd = undefined;
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
