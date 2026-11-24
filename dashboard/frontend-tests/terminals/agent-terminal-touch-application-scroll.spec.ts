import { expect, onTestFinished, test } from "vitest";
import { userEvent } from "vitest/browser";
import {
  conversationLine,
  selfScrollingApplication,
  wheelReport,
} from "./terminal-test-output.ts";
import {
  drawnRows,
  liveScreen,
  mountTouchTerminal,
  showsRow,
  socketSize,
  swipeTerminal,
  tapLiveScreen,
} from "./terminal-touch-input.ts";

const lines = 60;
const shown = 10;
const latest = lines - shown + 1;
const steps = 5;

type Tracking = NonNullable<
  Parameters<typeof selfScrollingApplication>[0]["tracking"]
>;

async function mountScrollingTerminal(tracking: Tracking) {
  const program = selfScrollingApplication({ lines, shown, tracking });
  const mounted = await mountTouchTerminal("Phone swipe session", {
    program,
    openingLines: [conversationLine(latest), conversationLine(lines)],
  });
  const screen = liveScreen();
  const { rows, cols } = socketSize(mounted.attachment.sizes);
  const { left, top, width, height } = screen.getBoundingClientRect();
  return {
    ...mounted,
    screen,
    travel: (height * 5.4) / rows,
    left,
    top,
    width: width / cols,
    height: height / rows,
  };
}

test("a swipe sends the application a wheel step per row at the touched cell and leaves the draft alone", async () => {
  const { sent, screen, travel, left, top, width, height } =
    await mountScrollingTerminal("?1003h");
  await tapLiveScreen();
  await userEvent.keyboard("draft");
  await showsRow("> draft");
  expect(drawnRows()).not.toContain(conversationLine(latest - 1));
  let wheelsOnPage = 0;
  const hearWheel = () => {
    wheelsOnPage += 1;
  };
  document.addEventListener("wheel", hearWheel);
  onTestFinished(() => {
    document.removeEventListener("wheel", hearWheel);
  });

  for (const [distance, button, expected] of [
    [travel, "64", latest - steps],
    [-travel, "65", latest],
  ] as const) {
    const start = sent().length;
    const finger = await swipeTerminal(screen, distance);
    await expect.poll(() => sent().length - start).toBe(steps);
    for (const input of sent().slice(start)) {
      const [, actual, column, row] = wheelReport.exec(input) ?? [];
      expect(actual).toBe(button);
      expect(
        Math.abs(Number(column) - 0.5 - (finger.x - left) / width),
      ).toBeLessThanOrEqual(0.51);
      expect(
        Math.abs(Number(row) - 0.5 - (finger.y - top) / height),
      ).toBeLessThanOrEqual(0.51);
    }
    await showsRow(conversationLine(expected));
    await showsRow("> draft");
    if (button === "64")
      expect(drawnRows()).not.toContain(conversationLine(lines));
  }
  await showsRow(conversationLine(lines));
  expect(wheelsOnPage).toBe(0);
  const afterSwipes = sent().length;
  await userEvent.keyboard("!");
  await showsRow("> draft!");
  expect(sent().slice(afterSwipes)).toEqual(["!"]);
});

test("an application outside wheel tracking receives no swipe or synthesized keys", async () => {
  const { sent } = await mountTouchTerminal("Full screen no wheel", {
    program: {
      opening: "\u001b[?1049h\u001b[?9hfull screen application\r\n",
      answer: () => "",
    },
    openingLines: ["full screen application"],
  });
  const screen = liveScreen();
  await swipeTerminal(screen, 100);
  await swipeTerminal(screen, -100);
  await userEvent.keyboard("x");
  await expect.poll(sent).toEqual(["x"]);
});

async function earlierApplicationOutput(tracking: Tracking) {
  const { sent, screen, travel } = await mountScrollingTerminal(tracking);
  const start = sent().length;
  await swipeTerminal(screen, travel);
  await expect.poll(() => sent().length - start).toBe(steps);
  expect(
    sent()
      .slice(start)
      .map((input) => wheelReport.exec(input)?.[1]),
  ).toEqual(Array.from({ length: steps }, () => "64"));
  await showsRow(conversationLine(latest - steps));
  expect(drawnRows()).not.toContain(conversationLine(lines));
  await userEvent.keyboard("!");
  await showsRow("> !");
  expect(sent().slice(start + steps)).toEqual(["!"]);
}

test("a swipe scrolls the alternate screen in button-tracking mode", async () => {
  await earlierApplicationOutput("?1000h");
});

test("a swipe scrolls the alternate screen in drag-tracking mode", async () => {
  await earlierApplicationOutput("?1002h");
});
