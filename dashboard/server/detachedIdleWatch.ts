// Once a kept client has no socket, hang it up after its declared idle
// screen has held for the settle period. A screen that stops matching, or a
// socket returning, leaves the client running.
import type { DetachedIdle } from "./launchHosts.ts";
import { KeptClientScreen } from "./keptClientScreen.ts";

export class DetachedIdleWatch {
  private screen: KeptClientScreen | undefined;
  private idleSince: number | undefined;
  private idleTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly rule: DetachedIdle,
    size: { readonly cols: number; readonly rows: number },
    private readonly isTracked: () => boolean,
    private readonly detached: () => boolean,
    private readonly hangup: () => void,
  ) {
    this.screen = new KeptClientScreen(size.cols, size.rows);
  }

  write(data: string): void {
    this.screen?.write(data);
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
    const screen = this.screen;
    if (screen === undefined) return "";
    await screen.settled();
    return this.screen === screen ? screen.text() : "";
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
    this.clear();
    const screen = this.screen;
    this.screen = undefined;
    screen?.dispose();
  }

  // The idle marker has to hold for the host's settle period.
  private evaluate(): void {
    const screen = this.screen;
    if (
      screen === undefined ||
      !this.isTracked() ||
      !this.detached() ||
      !this.rule.matches(screen.text())
    ) {
      this.clear();
      return;
    }
    const now = Date.now();
    if (this.idleSince === undefined) this.idleSince = now;
    const remaining = this.rule.settleMs - (now - this.idleSince);
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

export function detachedIdleWatch(
  rule: DetachedIdle | undefined,
  size: { readonly cols: number; readonly rows: number },
  hooks: {
    readonly isTracked: () => boolean;
    readonly detached: () => boolean;
    readonly hangup: () => void;
  },
): DetachedIdleWatch | undefined {
  if (rule === undefined) return undefined;
  return new DetachedIdleWatch(
    rule,
    size,
    hooks.isTracked,
    hooks.detached,
    hooks.hangup,
  );
}
