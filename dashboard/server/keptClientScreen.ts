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
import type { SerializeAddon as TerminalSerializer } from "@xterm/addon-serialize";

const require = createRequire(import.meta.url);
const { Terminal: HeadlessTerminal } = require("@xterm/headless") as {
  Terminal: new (
    options?: ITerminalOptions & ITerminalInitOnlyOptions,
  ) => Terminal;
};
const { SerializeAddon } = require("@xterm/addon-serialize") as {
  SerializeAddon: new () => TerminalSerializer;
};

export type FrameScreen = {
  readonly text: string;
  readonly cursorVisible: boolean;
};

export type ScreenReplay = {
  readonly cols: number;
  readonly rows: number;
  readonly output: string;
};

export class KeptClientScreen {
  private readonly terminal: Terminal;
  private readonly serializer = new SerializeAddon();
  private readonly csi: { dispose(): void }[];
  private pending: Promise<void> = Promise.resolve();
  // Chunks that arrive before the current coalesce batch is sealed append
  // here so one xterm write covers a burst instead of one Promise per chunk.
  private coalesce: { text: string } | undefined;
  // Starts hidden. `?25` from the stream shows or hides the cursor. The
  // host's ready rule decides whether a hidden cursor can take an instruction.
  private cursorOn = false;
  private framePending = false;
  // The screen as the last synchronized update finished, until taken.
  private frameEnd: FrameScreen | undefined;
  private disposed = false;

  constructor(cols: number, rows: number) {
    // The buffer is proposed API on this build. The page reads the same
    // buffer from `@xterm/xterm`.
    this.terminal = new HeadlessTerminal({
      cols,
      rows,
      allowProposedApi: true,
    });
    this.terminal.loadAddon(this.serializer);
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

  // A synchronized update (`?2026`) has begun and not finished: the screen
  // is part of a paint still arriving.
  updating(): boolean {
    return this.framePending;
  }

  // A synchronized update (`?2026`) has finished and none is open. The page
  // reports readiness on that same boundary.
  completedFrame(): boolean {
    return this.completedFrameScreen() !== undefined;
  }

  // The screen that finished frame showed. Later output can already have
  // changed the screen since.
  completedFrameScreen(): FrameScreen | undefined {
    return this.framePending ? undefined : this.frameEnd;
  }

  takeFrame(): void {
    this.frameEnd = undefined;
  }

  write(data: string): void {
    if (this.coalesce !== undefined) {
      this.coalesce.text += data;
      return;
    }
    const batch = { text: data };
    this.coalesce = batch;
    this.pending = this.pending
      .then(
        () =>
          new Promise<void>((resolve) => {
            if (this.coalesce === batch) this.coalesce = undefined;
            this.terminal.write(batch.text, () => {
              resolve();
            });
          }),
      )
      .catch(() => {
        // A write already queued can fail once the screen is disposed.
        if (this.coalesce === batch) this.coalesce = undefined;
      });
  }

  resize(cols: number, rows: number): void {
    this.terminal.resize(cols, rows);
  }

  settled(): Promise<void> {
    // Do not seal here: detached idle `watch` awaits settled after every
    // chunk, and sealing would reopen one Promise per chunk under a burst.
    return this.pending;
  }

  // Serialize exactly the output queued at this call, before later writes.
  // ANSI rendition, buffer and terminal modes survive a new page terminal.
  // A paint still arriving stays open for the page's readiness judgment.
  replay(): Promise<ScreenReplay | undefined> {
    this.sealCoalesce();
    return this.pending.then(() => {
      if (this.disposed) return undefined;
      const cursor = this.terminal.buffer.active;
      // The addon's relative restoration can land one column left after
      // serializing a full row. Restore an explicitly positioned cursor;
      // leave an overflow cursor alone so its pending wrap survives.
      const position =
        cursor.cursorX < this.terminal.cols
          ? `\x1b[${cursor.cursorY + 1};${cursor.cursorX + 1}H`
          : "";
      return {
        cols: this.terminal.cols,
        rows: this.terminal.rows,
        output: `\x1b[?2026h${this.serializer.serialize({ scrollback: 0 })}${position}\x1b[?25${this.cursorOn ? "h" : "l"}${this.framePending ? "" : "\x1b[?2026l"}`,
      };
    });
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
    this.disposed = true;
    for (const handler of this.csi) handler.dispose();
    this.terminal.dispose();
  }

  // Close the open coalesce batch so later writes start a new chain link.
  // `replay` seals before capturing `pending` so later writes are excluded.
  private sealCoalesce(): void {
    this.coalesce = undefined;
  }
}
