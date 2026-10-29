// Native moves stay real; this records their calls and browser-frame observations.
import { expect, test } from "./dashboardTest.ts";
import { scrollByTouch } from "./touchGestures.ts";

test.use({ hasTouch: true });

test("per-pixel native movement observes each frame and stops inside a narrow reading window", async ({
  page,
}) => {
  await page.setContent(
    `<style>body { margin: 0; } section { width: 200px; height: 160px; margin: 20px; overflow: auto; touch-action: pan-y; } div { height: 800px; }</style><section><div>Scrollable content</div></section>`,
  );
  await page.evaluate(() => {
    const nativeFrame = requestAnimationFrame.bind(window);
    const observed = window as typeof window & {
      touchFrames: number;
      readingFrames: number[];
    };
    observed.touchFrames = 0;
    observed.readingFrames = [];
    window.requestAnimationFrame = (callback) =>
      nativeFrame((time) => {
        callback(time);
        observed.touchFrames += 1;
      });
  });
  const reading = await page.evaluateHandle(() => () => {
    const observed = window as typeof window & {
      touchFrames: number;
      readingFrames: number[];
    };
    observed.readingFrames.push(observed.touchFrames);
    return observed.readingFrames.length === 5;
  });
  const events: { type: string; y: number | undefined }[] = [];
  const context = page.context();
  const newSession = context.newCDPSession.bind(context);
  context.newCDPSession = async (target) => {
    const session = await newSession(target);
    const send = session.send.bind(session);
    session.send = async (method, params) => {
      if (method === "Input.dispatchTouchEvent") {
        const event = params as { type: string; touchPoints: { y: number }[] };
        events.push({ type: event.type, y: event.touchPoints[0]?.y });
      }
      return send(method, params);
    };
    return session;
  };
  try {
    await scrollByTouch(
      page,
      page.locator("section"),
      -40,
      "vertical",
      reading,
    );
  } finally {
    context.newCDPSession = newSession;
    await reading.dispose();
  }
  const positions = events
    .filter((event) => event.type !== "touchEnd")
    .map((event) => event.y);
  expect(events.map((event) => event.type)).toEqual([
    "touchStart",
    "touchMove",
    "touchMove",
    "touchMove",
    "touchMove",
    "touchMove",
    "touchEnd",
  ]);
  for (let index = 1; index < positions.length; index += 1) {
    expect((positions[index - 1] ?? 0) - (positions[index] ?? 0)).toBe(1);
  }
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { readingFrames: number[] }).readingFrames,
    ),
  ).toEqual([1, 2, 3, 4, 5]);
});
