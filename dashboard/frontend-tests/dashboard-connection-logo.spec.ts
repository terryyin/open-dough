import { readFile } from "node:fs/promises";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import { pausePageClockAt } from "../tests/dashboardTest.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { preholdRevisionStreamSlots } from "../tests/support/revisionStreamSlots.ts";
import { givePageItsTurns, isCheck } from "../tests/pageRequestNotes.ts";
import { setPageVisibility } from "../tests/autoRefreshJourney.ts";
import {
  dashboardConnectionIndicator,
  sessionsProductMark,
} from "../tests/productMark.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
} from "../tests/support/frontendSubstituteAnswers.ts";

test("the logo kneads once when the waiting dashboard receives updates", async ({
  page,
  frontendServices,
}) => {
  await preholdRevisionStreamSlots(page);
  await pausePageClockAt(page, new Date());
  const first = holdAnswer(page);
  let checks = 0;
  await page.route(
    (url) => isCheck(url.href),
    (route) =>
      answerHeld(++checks === 1 ? first.hold : undefined, () =>
        fulfillJson(route, {
          revision: frontendServices.revision,
          changed: false,
        }),
      ),
  );
  const animations: string[] = [];
  const knead = "/opendough-knead.svg";
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === knead)
      animations.push(request.url());
  });

  await openFrontendTakenBacklog(page);
  const mark = sessionsProductMark(page);
  const connection = dashboardConnectionIndicator(page);
  await page.clock.runFor(checkIntervalMs);
  await first.held.received;
  await expect(connection).toHaveAccessibleName(
    "Dashboard connection: awaiting updates since return",
  );
  await expect(mark).toHaveAttribute("src", "/icon-64.png");
  expect(animations).toEqual([]);

  const loaded = page.waitForResponse(
    (response) => new URL(response.url()).pathname === knead,
  );
  first.held.release();
  const animation = await loaded;
  expect(animation.status()).toBe(200);
  expect(animation.headers()["content-type"]).toBe("image/svg+xml");
  expect(await animation.body()).toEqual(
    await readFile(
      new URL("../../assets/brand/opendough-knead.svg", import.meta.url),
    ),
  );
  await expect(connection).toHaveAccessibleName(
    "Dashboard connection: updates received since return",
  );
  await expect(mark).toHaveAttribute("src", /^\/opendough-knead\.svg\?play=/);
  await expect(mark).toHaveJSProperty("naturalWidth", 256);
  await givePageItsTurns(page);
  await page.clock.runFor(4_000);
  await expect(mark).toHaveAttribute("src", "/icon-64.png");

  const nextCheck = page.waitForResponse((response) => isCheck(response.url()));
  await page.clock.runFor(checkIntervalMs);
  expect((await nextCheck).status()).toBe(200);
  await givePageItsTurns(page);
  await expect(mark).toHaveAttribute("src", "/icon-64.png");
  expect(animations).toEqual([animation.url()]);

  await setPageVisibility(page, "hidden");
  await setPageVisibility(page, "visible");
  await expect(connection).toHaveAccessibleName(
    "Dashboard connection: awaiting updates since return",
  );
  await expect(mark).toHaveAttribute("src", "/icon-64.png");
  const replayed = page.waitForResponse(
    (response) => new URL(response.url()).pathname === knead,
  );
  await page.clock.runFor(1);
  const replay = await replayed;
  expect(replay.url()).not.toBe(animation.url());
  await expect(mark).toHaveAttribute("src", /^\/opendough-knead\.svg\?play=/);
  await expect(mark).toHaveJSProperty("naturalWidth", 256);
  await givePageItsTurns(page);
  await page.clock.runFor(4_000);
  await expect(mark).toHaveAttribute("src", "/icon-64.png");
  expect(animations).toEqual([animation.url(), replay.url()]);
});
