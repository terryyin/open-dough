// A case that scales the device leaves the tester page as the next case finds
// it: the configured frame size at scale 1, so a control at the bottom of the
// frame stays inside the page Playwright clicks through. The browser window
// behind the emulated page is set to CI's headless 1280x720, so a teardown that
// drops the emulation shows that window instead of the frame. Scaling itself
// keeps the page at the frame's size, so the frame never outgrows the page.
import { createElement } from "react";
import { afterAll, expect, test, vi } from "vitest";
import { cdp, page } from "vitest/browser";
import { scaleDevice } from "../../test-support/component-mount/deviceScale.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

const frame = { width: 390, height: 844 };
const session = () =>
  cdp() as {
    send(method: string, params?: Record<string, unknown>): Promise<unknown>;
  };

async function browserWindowAt(width: number, height: number) {
  const { windowId, bounds } = (await session().send(
    "Browser.getWindowForTarget",
  )) as { windowId: number; bounds: { width: number; height: number } };
  await session().send("Browser.setWindowBounds", {
    windowId,
    bounds: { width, height },
  });
  return () =>
    session().send("Browser.setWindowBounds", {
      windowId,
      bounds: { width: bounds.width, height: bounds.height },
    });
}

function testerPage() {
  const outer = window.top as Window;
  return [outer.innerWidth, outer.innerHeight, outer.devicePixelRatio];
}

let restoreWindow: () => Promise<unknown> = () => Promise.resolve(undefined);

// Restored once both cases ran, so the second still finds what the first left.
afterAll(async () => {
  await restoreWindow();
});

test("a case scales the device", async () => {
  restoreWindow = await browserWindowAt(1280, 720);
  await scaleDevice(2);
  expect(testerPage()).toEqual([frame.width, frame.height, 2]);
  await mountComponent(createElement("p", null, "zoomed"));
  expect(devicePixelRatio).toBe(2);
});

test("the next case finds the page at the frame's size and scale", async () => {
  expect(testerPage()).toEqual([frame.width, frame.height, 1]);

  const pressed = vi.fn();
  await mountComponent(
    createElement(
      "button",
      {
        type: "button",
        onClick: pressed,
        style: { position: "fixed", left: 0, bottom: 0, height: 50 },
      },
      "Bottom control",
    ),
  );
  await page.getByRole("button", { name: "Bottom control" }).click();
  expect(pressed).toHaveBeenCalledOnce();
});
