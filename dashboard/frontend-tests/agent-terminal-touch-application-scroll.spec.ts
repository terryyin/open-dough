// A one-finger swipe on a phone scrolls the output of an application that has
// taken over the screen and takes the wheel, through an explicit terminal
// WebSocket substitute running such an application. What the terminal reports
// about the application decides, whichever host the session runs in. The
// terminal's own scrollback under an application that does not scroll itself
// stays with ../tests/terminals/agent-terminal-touch-keys.spec.ts.

import { expect, test } from "../tests/support/frontendApp.ts";
import {
  openFrontendTerminalByTouch,
  reportedSize,
  travelOverRows,
} from "../tests/support/frontendTouchTerminal.ts";
import {
  conversationLine,
  selfScrollingApplication,
  wheelReport,
} from "../tests/support/terminalSubstituteApplication.ts";
import { focusByTouch, scrollByTouch } from "../tests/touchTerminalPage.ts";
import { phoneLaunchTouchViewport } from "../tests/touchLaunchPage.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

test.use({ viewport: phoneLaunchTouchViewport.portrait, hasTouch: true });

const launch = () =>
  makeMe.aLaunchRecord
    .adHoc({ instruction: "swipe", title: "Phone swipe session" })
    .launchedAt("2026-10-01T00:00:00.000Z");

test("a swipe scrolls an application that scrolls its own output, at the touched place, and leaves the draft alone", async ({
  page,
  frontendServices,
}) => {
  const lines = 60;
  const shown = 10;
  const latest = lines - shown + 1;
  const { panel, rows, screen, input, sent, sizes } =
    await openFrontendTerminalByTouch(
      page,
      frontendServices,
      launch()
        .inCodexSession({
          sessionId: "swipe-thread-1",
          continuation: { workspace: "/work/swipe", endpoint: "ws://codex" },
        })
        .please(),
      { application: selfScrollingApplication({ lines, shown }) },
    );
  await expect(rows).toContainText(conversationLine(lines));
  await expect(rows).toContainText(conversationLine(latest));
  await expect(rows).not.toContainText(conversationLine(latest - 1));
  const draftRow = rows.locator("> div").nth(shown);
  await focusByTouch(panel);
  await input.pressSequentially("draft");
  await expect(draftRow).toHaveText("> draft");

  // Where each finger went down, and any wheel the page around the terminal
  // heard, as the page itself observes them.
  const observed = await page.evaluateHandle(() => {
    const touched: { x: number; y: number }[] = [];
    const heard = { wheels: 0 };
    window.addEventListener(
      "touchstart",
      (event) => {
        const finger = event.touches[0];
        if (finger) touched.push({ x: finger.clientX, y: finger.clientY });
      },
      true,
    );
    document.addEventListener("wheel", () => {
      heard.wheels += 1;
    });
    return { touched, heard };
  });
  const size = reportedSize(sizes);
  const cell = await screen.evaluate((element, { cols, rows }) => {
    const at = element.getBoundingClientRect();
    return {
      left: at.left,
      top: at.top,
      width: at.width / cols,
      height: at.height / rows,
    };
  }, size);
  // A stroke travels five and a half rows in moves of less than two rows
  // each, so the whole rows it reports include the parts carried between
  // moves.
  const steps = 5;
  const travel = await travelOverRows(screen, size.rows, steps);
  // Each stroke: one wheel report per whole row of travel, in the cell the
  // finger went down on, and nothing else.
  const typed = sent.length;
  const expectWheelAtTouch = async (stroke: number, button: "64" | "65") => {
    const before = typed + stroke * steps;
    await expect.poll(() => sent.length).toBe(before + steps);
    const { touched } = await observed.jsonValue();
    const finger = touched[stroke];
    if (finger === undefined) throw new Error("No finger went down.");
    for (const report of sent.slice(before)) {
      const [, sentButton, column, row] = wheelReport.exec(report) ?? [];
      expect(sentButton, `wheel report, not ${JSON.stringify(report)}`).toBe(
        button,
      );
      // In cells from the screen's corner; a point on a cell's edge belongs
      // to either neighbour.
      const across = (finger.x - cell.left) / cell.width;
      const down = (finger.y - cell.top) / cell.height;
      expect(
        Math.abs(across - (Number(column) - 0.5)),
        "reported column holds the touch",
      ).toBeLessThanOrEqual(0.501);
      expect(
        Math.abs(down - (Number(row) - 0.5)),
        "reported row holds the touch",
      ).toBeLessThanOrEqual(0.501);
    }
  };

  await scrollByTouch(page, screen, travel);
  await expect(rows).toContainText(conversationLine(latest - steps));
  await expect(rows).not.toContainText(conversationLine(lines));
  await expectWheelAtTouch(0, "64");

  await scrollByTouch(page, screen, -travel);
  await expect(rows).toContainText(conversationLine(lines));
  await expect(rows).not.toContainText(conversationLine(latest - 1));
  await expectWheelAtTouch(1, "65");

  await expect(draftRow).toHaveText("> draft");
  expect((await observed.jsonValue()).heard.wheels).toBe(0);
  await input.press("!");
  await expect(draftRow).toHaveText("> draft!");
  expect(sent.slice(typed + 2 * steps)).toEqual(["!"]);
});

test("a swipe sends nothing to an application that took over the screen without taking the wheel", async ({
  page,
  frontendServices,
}) => {
  // The alternate screen with pointer tracking of button presses only: a
  // wheel given to xterm here would reach the session as arrow keys.
  const { rows, screen, input, sent } = await openFrontendTerminalByTouch(
    page,
    frontendServices,
    launch()
      .inClaudeSession({ sessionId: "swipe-1", shortId: "swipe01" })
      .please(),
    {
      application: {
        opening: "\u001b[?1049h\u001b[?9hfull screen application\r\n",
        answer: () => "",
      },
    },
  );
  await expect(rows).toContainText("full screen application");
  await scrollByTouch(page, screen, 100);
  await scrollByTouch(page, screen, -100);
  await input.press("x");
  await expect.poll(() => sent).toEqual(["x"]);
});

// One page open per tracking mode: one stroke, one wheel report per whole
// row, earlier conversation lines, and nothing else. Place, draft and return
// stay with the any-motion journey above.
for (const tracking of ["?1000h", "?1002h"] as const) {
  test(`a swipe scrolls an application that announces ${tracking}`, async ({
    page,
    frontendServices,
  }) => {
    const lines = 60;
    const shown = 10;
    const latest = lines - shown + 1;
    const steps = 5;
    const { rows, screen, input, sent, sizes } =
      await openFrontendTerminalByTouch(
        page,
        frontendServices,
        launch()
          .inCodexSession({
            sessionId: `swipe-${tracking.slice(1)}`,
            continuation: {
              workspace: "/work/swipe",
              endpoint: "ws://codex",
            },
          })
          .please(),
        {
          application: selfScrollingApplication({ lines, shown, tracking }),
        },
      );
    await expect(rows).toContainText(conversationLine(lines));
    await expect(rows).toContainText(conversationLine(latest));
    const travel = await travelOverRows(
      screen,
      reportedSize(sizes).rows,
      steps,
    );
    const before = sent.length;
    await scrollByTouch(page, screen, travel);
    await expect.poll(() => sent.length).toBe(before + steps);
    for (const report of sent.slice(before)) {
      const [, button] = wheelReport.exec(report) ?? [];
      expect(button, `wheel report, not ${JSON.stringify(report)}`).toBe("64");
    }
    await expect(rows).toContainText(conversationLine(latest - steps));
    await expect(rows).not.toContainText(conversationLine(lines));
    await input.press("!");
    expect(sent.slice(before + steps)).toEqual(["!"]);
  });
}
