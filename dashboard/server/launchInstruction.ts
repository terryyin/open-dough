// Enters one launch instruction into a kept client once its server-side
// screen is ready, and holds idle hangup until that write. A screen inside a
// synchronized update still arriving is not judged until that update
// finishes. A ready screen settles the launch wait even when no synchronized
// frame arrived, except that a pasted instruction settles it only once the
// client answered its submitted chip or the composer is showing that text, or
// a later frame finished showing neither the chip, that text, nor the empty
// composer. A screen that is not ready still
// waits for a completed frame. The client exiting also settles the wait. A
// later screen can still accept the instruction.
import type { ScreenReadiness } from "./launchHosts.ts";
import { KeptClientScreen } from "./keptClientScreen.ts";

function showsPasteChip(screen: string): boolean {
  return screen.includes("Pasted text");
}

// The composer is the last line that carries Cursor's prompt arrow. The
// status footer repeats the worktree and branch, which also appear in a
// launch prompt, so a match anywhere on the screen is not the draft.
function composerLine(screen: string): string {
  const lines = screen.split(/\r?\n/u);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];
    if (line?.includes("→")) return line;
  }
  return "";
}

// Cursor sometimes leaves a multiline paste as composer text instead of a
// chip. The arrow line then shows that text, including its wrapped tail.
// Short fragments are ignored.
function showsUnsentInstruction(screen: string, instruction: string): boolean {
  const composer = composerLine(screen);
  if (composer === "") return false;
  for (const line of instruction.split("\n")) {
    const text = line.trim();
    if (text.length < 16) continue;
    const head = text.slice(0, 48);
    const tail = text.slice(-40);
    if (composer.includes(head) || composer.includes(tail)) return true;
  }
  return false;
}

export type LaunchInstructionInput = {
  readonly instruction: string;
  readonly ready: ScreenReadiness;
  readonly onEntered: () => Promise<void>;
  // The page's terminal is part of this launch. Idle waits until that socket
  // joins, or the dashboard releases the handoff.
  readonly handoff?: boolean;
};

export class LaunchInstruction {
  private screen: KeptClientScreen | undefined;
  private chain: Promise<void> = Promise.resolve();
  private entered = false;
  private pasted = false;
  private holding = true;
  private handoff: boolean;
  private announced = false;
  private resolveFirst: () => void = () => {};
  readonly firstScreen: Promise<void>;

  constructor(
    private readonly launch: LaunchInstructionInput,
    size: { readonly cols: number; readonly rows: number },
    private readonly client: {
      readonly tracked: () => boolean;
      readonly writeInstruction: (data: string) => boolean;
      readonly holdReleased: () => void;
    },
  ) {
    this.handoff = launch.handoff === true;
    this.screen = new KeptClientScreen(size.cols, size.rows);
    this.firstScreen = new Promise<void>((resolve) => {
      this.resolveFirst = resolve;
    });
  }

  holdsIdle(): boolean {
    return this.holding;
  }

  // Resolves once this output has been parsed and its readiness judged.
  // firstScreen can settle before the instruction is entered; later screens
  // may still accept it. Once entry and that wait have both settled, further
  // chunks are ignored. The headless screen stays until releaseIdle disposes.
  write(output: string): Promise<void> {
    if (this.observationDone()) return Promise.resolve();
    const screen = this.screen;
    if (screen === undefined) return Promise.resolve();
    screen.write(output);
    this.chain = this.chain
      .then(() => this.evaluate(screen))
      .catch(() => {
        this.announce();
      });
    return this.chain;
  }

  resize(cols: number, rows: number): void {
    this.screen?.resize(cols, rows);
  }

  // The process exited. Settles the launch wait without treating hangup,
  // which has not exited yet, as that settlement.
  clientExited(): void {
    this.announce();
  }

  dispose(): void {
    const screen = this.screen;
    this.screen = undefined;
    screen?.dispose();
  }

  private observationDone(): boolean {
    // Entry plus wait settlement: paste confirmation announces after enter.
    return this.entered && this.announced;
  }

  private async evaluate(screen: KeptClientScreen): Promise<void> {
    await screen.settled();
    // A chunk queued before observation ended can still run; skip it.
    if (this.observationDone()) return;
    if (this.screen !== screen || !this.client.tracked()) {
      this.announce();
      return;
    }
    // Part of a paint is not the screen it paints: a working screen's
    // composer line can arrive before its working marker.
    if (screen.updating()) return;
    const ready = this.launch.ready(screen.text(), screen.cursorVisible());
    const pastedChip = showsPasteChip(screen.text());
    if (!this.entered && this.pasted) {
      // A paste chip is not the empty composer and has no synchronized frame.
      // The same is true of the instruction left as composer text. Submit
      // either before the not-ready wait would return. The wait settles on
      // the client's answer to that submit, a later finished frame or ready
      // screen, so the screen read after the launch is not the unsent draft.
      const draft =
        !ready &&
        showsUnsentInstruction(screen.text(), this.launch.instruction);
      if (pastedChip || draft) {
        await this.submitPaste(screen);
        return;
      }
      // The client has not answered the paste while its screen still shows
      // the empty composer, as when output written before the paste arrives
      // late.
      if (ready) return;
      // Only a frame that itself finished showing neither the chip, the
      // pasted text, nor the composer answers the paste. The screen now can
      // be that paint still arriving after a frame that showed the composer.
      const frame = screen.completedFrameScreen();
      if (
        frame === undefined ||
        showsPasteChip(frame.text) ||
        this.launch.ready(frame.text, frame.cursorVisible)
      ) {
        return;
      }
      screen.takeFrame();
      this.announce();
      return;
    }
    // The host's ready rule is enough to enter the instruction and settle
    // the wait. A screen that is not ready still waits until a frame has
    // finished before that wait settles.
    if (!screen.completedFrame() && !ready) return;
    screen.takeFrame();
    if (!this.entered && ready) {
      const instruction = this.launch.instruction;
      // Cursor keeps a long or multiline burst as an unsent paste chip, or as
      // the text itself in the composer, and folds a return in that same
      // burst into the paste. Submit with a later Enter once the chip or
      // that text is on screen.
      if (instruction.includes("\n") || instruction.length > 800) {
        this.pasted = true;
        if (!this.client.writeInstruction(instruction)) {
          this.pasted = false;
          this.announce();
          return;
        }
        // The wait settles once the client answered the submitted chip or
        // composer text, or a later frame finished showing neither that
        // draft nor the empty composer, so the launch never returns before
        // that answer.
        return;
      } else {
        this.entered = true;
        const typed = instruction.endsWith("\r")
          ? instruction
          : `${instruction}\r`;
        if (!this.client.writeInstruction(typed)) {
          this.entered = false;
          this.announce();
          return;
        }
        if (!this.handoff) this.releaseHold();
        try {
          await this.launch.onEntered();
        } catch {
          // The instruction was entered. A failed save leaves the uncertain record.
        }
      }
    }
    this.announce();
  }

  private async submitPaste(screen: KeptClientScreen): Promise<void> {
    this.entered = true;
    screen.takeFrame();
    if (!this.client.writeInstruction("\r")) {
      this.entered = false;
      this.announce();
      return;
    }
    if (!this.handoff) this.releaseHold();
    try {
      await this.launch.onEntered();
    } catch {
      // The instruction was entered. A failed save leaves the uncertain record.
    }
  }

  private announce(): void {
    if (this.announced) return;
    this.announced = true;
    this.resolveFirst();
  }

  // The page's terminal joined, or the dashboard is closing. A socket that is
  // already open keeps the idle rule quiet; with none, the settle starts.
  releaseHandoff(): void {
    if (!this.handoff) return;
    this.handoff = false;
    this.releaseHold();
  }

  private releaseHold(): void {
    if (!this.holding) return;
    this.holding = false;
    this.client.holdReleased();
  }
}
