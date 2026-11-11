// A steady pace of page time (`watchRecordReads` in
// ../tests/sessionStatePace.ts) on a page that still follows a launch
// attempt: the page's wait on that attempt's next change asks for a read of
// the machine's sessions as soon as it is answered, so the pace has to begin
// after that read. Synthetic machine answers only; no dashboard backend or
// native host.

import type { Page } from "@playwright/test";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  agentChangedEndpoint,
  agentLaunchEndpoint,
  type LaunchAttemptRecord,
  type MachineAnswer,
} from "../src/agentLaunch.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { pausePageClockAt } from "../tests/dashboardTest.ts";
import { givePageItsTurns } from "../tests/pageRequestNotes.ts";
import { watchRecordReads } from "../tests/sessionStatePace.ts";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import { putFrontendMachine } from "../tests/support/frontendServiceState.ts";

const pageTime = (page: Page) => page.evaluate(() => Date.now());

// A pace that waited for nothing would read the page three times and then
// let page time pass; this many rounds of page turns outlast that several
// times over, by the order of the page's work and not by the wall clock.
const roundsToBeginAPace = 12;

// The machine's answer about the one attempt it owns: whether it still runs
// it, and how many changes of it it has told.
const answering = (
  attempt: LaunchAttemptRecord,
  observed: { readonly running: boolean; readonly changes: number },
): MachineAnswer =>
  makeMe.aMachineAnswer
    .answeringAttempts(
      makeMe.anAttemptObservation
        .of(attempt)
        .owned(true)
        .running(observed.running)
        .afterChanges(observed.changes)
        .please(),
    )
    .please();

// Holds the page's wait on a followed attempt's next change unanswered until
// `tell` is called, which answers that it changed. `asked` settles once the
// page has asked it. It also notes the page time of every read of the
// machine's sessions asked after the change was told (`readsSinceTold`).
async function holdAttemptChange(page: Page) {
  let tell = () => {};
  let told = false;
  const held = new Promise<void>((resolve) => {
    tell = () => {
      told = true;
      resolve();
    };
  });
  let noteAsked = () => {};
  const asked = new Promise<void>((resolve) => {
    noteAsked = resolve;
  });
  const sinceTold: number[] = [];
  await page.route(
    (url) => url.pathname === agentChangedEndpoint,
    async (route) => {
      noteAsked();
      await held;
      await route.fulfill({ json: { changed: true } });
    },
  );
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() === "GET" && told)
        sinceTold.push(await pageTime(page));
      await route.fallback();
    },
  );
  return { asked, tell, readsSinceTold: () => [...sinceTold] };
}

test("a pace begins only once the read that a followed attempt's change asks for is answered", async ({
  page,
  frontendServices,
}) => {
  // The machine runs one attempt, of which it has told one change.
  putFrontendMachine(
    frontendServices,
    answering(makeMe.anAcceptedAttempt.adHoc().please(), {
      running: true,
      changes: 1,
    }),
  );
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  const change = await holdAttemptChange(page);
  await openFrontendTakenBacklog(page);
  await change.asked;
  const opened = await pageTime(page);

  // The attempt settles on the machine, which tells its second change only
  // after the pace was asked for and the page has had its turns many times
  // over: a pace that did not wait for the change would by then have let
  // page time pass.
  putFrontendMachine(
    frontendServices,
    answering(
      makeMe.anAcceptedAttempt
        .adHoc()
        .launched({ host: "claude", sessionId: "followed-attempt" })
        .settledAt("2026-01-01T00:00:05.000Z")
        .please(),
      { running: false, changes: 2 },
    ),
  );
  const paced = passOnePace();
  for (let round = 0; round < roundsToBeginAPace; round += 1) {
    await givePageItsTurns(page);
  }
  const toldAt = await pageTime(page);
  change.tell();
  await paced;

  // Page time stood still until the change was told; its read was asked
  // before any passed, and the pace's own read exactly one pace later.
  expect(toldAt - opened).toBe(0);
  expect(change.readsSinceTold().map((at) => at - opened)).toEqual([
    0,
    checkIntervalMs,
  ]);
});
