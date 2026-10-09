// Enters one launch instruction into a kept client once its server-side
// screen is ready, and holds idle hangup until that write. A screen inside
// an unfinished synchronized update is not judged. A ready screen
// settles the launch wait even when no synchronized frame arrived, except
// that a pasted instruction settles it only once its chip is submitted or a
// later frame finished showing neither that chip nor the empty composer. A
// screen that is not ready still waits for a completed frame. The client
// exiting also settles the wait. A later screen can still accept the
// instruction.
import type { ScreenReadiness } from "./launchHosts.ts";
import { KeptClientScreen } from "./keptClientScreen.ts";

function showsPasteChip(screen: string): boolean {
  return screen.includes("Pasted text");
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

  write(output: string): void {
    const screen = this.screen;
    if (screen === undefined) return;
    screen.write(output);
    this.chain = this.chain
      .then(() => this.evaluate(screen))
      .catch(() => {
        this.announce();
      });
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

  private async evaluate(screen: KeptClientScreen): Promise<void> {
    await screen.settled();
    if (this.screen !== screen || !this.client.tracked()) {
      this.announce();
      return;
    }
    // Inside a synchronized update the screen can be part of one paint, such
    // as a working screen's follow-up line before its working marker.
    if (screen.frameOpen()) return;
    const ready = this.launch.ready(screen.text(), screen.cursorVisible());
    const pastedChip = showsPasteChip(screen.text());
    if (!this.entered && this.pasted) {
      // A paste chip is not the empty composer and has no synchronized frame.
      // Submit it before the not-ready wait would return.
      if (pastedChip) {
        this.entered = true;
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
        this.announce();
        return;
      }
      // The client has not answered the paste while its screen still shows
      // the empty composer, as when output written before the paste arrives
      // late.
      if (ready) return;
      // Only a frame that itself finished showing neither the chip nor the
      // composer answers the paste. The screen now can be the chip's paint
      // still arriving after a frame that showed the composer.
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
      // Cursor keeps a long or multiline burst as an unsent paste chip and
      // folds a return in that same burst into the paste. Submit that chip
      // with a later Enter, once the chip is on screen.
      if (instruction.includes("\n") || instruction.length > 800) {
        this.pasted = true;
        if (!this.client.writeInstruction(instruction)) {
          this.pasted = false;
          this.announce();
          return;
        }
        // The wait settles once the chip is submitted, or a later frame
        // finished showing neither chip nor empty composer, so the launch
        // never returns before that answer.
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
