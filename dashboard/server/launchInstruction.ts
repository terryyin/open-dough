// Enters one launch instruction into a kept client once its server-side
// screen is ready, and holds idle hangup until that write. The first
// completed screen, or the client exiting, settles the launch wait. A later
// screen can still accept the instruction.
import { KeptClientScreen } from "./keptClientScreen.ts";

export type LaunchInstructionInput = {
  readonly instruction: string;
  readonly ready: (screen: string, cursorVisible: boolean) => boolean;
  readonly onEntered: () => Promise<void>;
  // The page's terminal is part of this launch. Idle waits until that socket
  // joins, or the dashboard releases the handoff.
  readonly handoff?: boolean;
};

export class LaunchInstruction {
  private screen: KeptClientScreen | undefined;
  private chain: Promise<void> = Promise.resolve();
  private entered = false;
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
    if (!screen.completedFrame()) return;
    screen.takeFrame();
    if (
      !this.entered &&
      this.launch.ready(screen.text(), screen.cursorVisible())
    ) {
      this.entered = true;
      const instruction = this.launch.instruction.endsWith("\r")
        ? this.launch.instruction
        : `${this.launch.instruction}\r`;
      if (!this.client.writeInstruction(instruction)) {
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
