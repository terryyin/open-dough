// The case's DevTools session on the browser that renders the review, the
// media features it emulates for the rest of the case, and its touch screen.
import { expect, onTestFinished } from "vitest";
import { cdp } from "vitest/browser";

export const browserSession = () =>
  cdp() as {
    send(method: string, params?: Record<string, unknown>): Promise<unknown>;
  };

// Emulates `features` until the case ends, when no feature stays emulated.
export async function emulateMedia(
  features: readonly { name: string; value: string }[],
) {
  const session = browserSession();
  onTestFinished(async () => {
    await session.send("Emulation.setEmulatedMedia", { features: [] });
  });
  await session.send("Emulation.setEmulatedMedia", { features });
}

// Gives the case a touch screen, as a phone has, whatever an earlier case in
// this browser left: the page then matches `(any-pointer: coarse)`.
export async function emulateTouch() {
  await browserSession().send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
  });
  await expect
    .poll(() => matchMedia("(any-pointer: coarse)").matches)
    .toBe(true);
}
