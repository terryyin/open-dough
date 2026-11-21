// The case's DevTools session on the browser that renders the review, and
// the media features it emulates for the rest of the case.
import { onTestFinished } from "vitest";
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
