// Once a kept client has no socket, hang it up after its declared idle
// screen has held for the settle period. A screen that stops matching, a
// socket returning, or no idle rule leaves the client running. With no rule
// the watch still records the screen.
import type { DetachedIdle, ScreenReadiness } from "./launchHosts.ts";
import { KeptClientScreen, type FrameScreen } from "./keptClientScreen.ts";

export class DetachedIdleWatch {
  private screen: KeptClientScreen | undefined;
  private readonly screenWaiters = new Set<(ended: boolean) => void>();
  private idleSince: number | undefined;
  private idleTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly rule: DetachedIdle | undefined,
    size: { readonly cols: number; readonly rows: number },
    private readonly isTracked: () => boolean,
    private readonly detached: () => boolean,
    private readonly hangup: () => void,
  ) {
    this.screen = new KeptClientScreen(size.cols, size.rows);
  }

  write(data: string): void {
    this.screen?.write(data);
    for (const observe of this.screenWaiters) observe(false);
  }

  resize(cols: number, rows: number): void {
    this.screen?.resize(cols, rows);
  }

  // A socket is joined, so the idle period starts over.
  hold(): void {
    this.clear();
  }

  // The visible screen, after the writes so far have settled.
  async text(): Promise<string> {
    return (await this.snapshot())?.text ?? "";
  }

  // The same recorded screen and cursor after queued output settles.
  private async snapshot(): Promise<FrameScreen | undefined> {
    const screen = this.screen;
    if (screen === undefined) return undefined;
    await screen.settled();
    return this.screen === screen
      ? { text: screen.text(), cursorVisible: screen.cursorVisible() }
      : undefined;
  }

  // A private caller observes this same screen until its prompt or lifetime ends.
  waitForScreen(ready: ScreenReadiness, signal: AbortSignal): Promise<boolean> {
    return new Promise((resolve) => {
      let finished = false;
      const settle = (shown: boolean) => {
        if (finished) return;
        finished = true;
        this.screenWaiters.delete(observe);
        signal.removeEventListener("abort", aborted);
        resolve(shown);
      };
      const aborted = () => {
        settle(false);
      };
      const observe = (ended: boolean) => {
        if (ended || signal.aborted || !this.isTracked()) {
          settle(false);
          return;
        }
        void this.snapshot().then((screen) => {
          if (finished) return;
          if (signal.aborted || !this.isTracked() || screen === undefined) {
            settle(false);
          } else if (ready(screen.text, screen.cursorVisible)) {
            settle(true);
          }
        });
      };
      this.screenWaiters.add(observe);
      signal.addEventListener("abort", aborted, { once: true });
      observe(false);
    });
  }

  // No socket remains. Read the screen after its writes settle.
  watch(): void {
    const screen = this.screen;
    if (screen === undefined) return;
    void screen.settled().then(() => {
      if (this.screen !== screen || !this.isTracked()) return;
      this.evaluate();
    });
  }

  dispose(): void {
    for (const observe of this.screenWaiters) observe(true);
    this.clear();
    const screen = this.screen;
    this.screen = undefined;
    screen?.dispose();
  }

  // The idle marker has to hold for the host's settle period.
  private evaluate(): void {
    const screen = this.screen;
    const rule = this.rule;
    if (
      screen === undefined ||
      rule === undefined ||
      !this.isTracked() ||
      !this.detached() ||
      !rule.matches(screen.text())
    ) {
      this.clear();
      return;
    }
    const now = Date.now();
    if (this.idleSince === undefined) this.idleSince = now;
    const remaining = rule.settleMs - (now - this.idleSince);
    if (remaining <= 0) {
      this.hangup();
      return;
    }
    if (this.idleTimer !== undefined) return;
    this.idleTimer = setTimeout(() => {
      this.idleTimer = undefined;
      this.evaluate();
    }, remaining);
  }

  private clear(): void {
    if (this.idleTimer !== undefined) {
      clearTimeout(this.idleTimer);
      this.idleTimer = undefined;
    }
    this.idleSince = undefined;
  }
}

// `observe` records the screen when a kept client declares no idle rule.
export function detachedIdleWatch(
  rule: DetachedIdle | undefined,
  size: { readonly cols: number; readonly rows: number },
  hooks: {
    readonly isTracked: () => boolean;
    readonly detached: () => boolean;
    readonly hangup: () => void;
  },
  observe = false,
): DetachedIdleWatch | undefined {
  if (rule === undefined && !observe) return undefined;
  return new DetachedIdleWatch(
    rule,
    size,
    hooks.isTracked,
    hooks.detached,
    hooks.hangup,
  );
}
