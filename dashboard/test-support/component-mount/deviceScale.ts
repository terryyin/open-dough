// Emulates a device scale for one Vitest browser-mode case, as browser zoom
// or a dense phone screen gives the page more device pixels per CSS pixel.
// The case's end returns the tester page to its own frame's size at the scale
// it found: clearing the emulation alone would leave the page at the last size
// a case gave it, behind the frame Vitest believes still fits it, so a later
// spec file's lower controls would fall outside the page.
// Scaling keeps the outer page at the size the case gave it: a zero size would
// drop that emulation and leave the case's frame wider than the outer page.
import { expect, onTestFinished } from "vitest";
import { cdp } from "vitest/browser";

const emulation = () =>
  cdp() as {
    send(method: string, params?: Record<string, unknown>): Promise<unknown>;
  };

export async function scaleDevice(deviceScaleFactor: number) {
  const session = emulation();
  const foundScale = devicePixelRatio;
  const outerPage = window.top ?? window;
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: outerPage.innerWidth,
    height: outerPage.innerHeight,
    deviceScaleFactor,
    mobile: false,
  });
  onTestFinished(async () => {
    await session.send("Emulation.setDeviceMetricsOverride", {
      width: innerWidth,
      height: innerHeight,
      deviceScaleFactor: foundScale,
      mobile: false,
    });
  });
  await expect.poll(() => devicePixelRatio).toBeCloseTo(deviceScaleFactor);
}
