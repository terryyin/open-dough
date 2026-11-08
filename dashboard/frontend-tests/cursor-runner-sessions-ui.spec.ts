// Running Cursor sessions demand and feedback from synthetic runner answers —
// no Cursor runner, fake-cursor, or dashboardServer. Page time is paused and
// stepped, and each read is held at its route until the journey answers it,
// so the ask gap is observed in page time and every reply arrives when the
// journey says.

import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  pausePageClock,
  setPageVisibility,
} from "../tests/autoRefreshJourney.ts";
import { untilPageRequestsAnswered } from "../tests/pageRequestNotes.ts";
import {
  askGapMs,
  type RunningCursorSessions,
} from "../src/cursorRunnerSessions.ts";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import {
  putFrontendMachine,
  type FrontendServiceState,
} from "../tests/support/frontendServiceState.ts";
import { sessionsSidebarParts } from "../tests/sessionsSidebarPage.ts";
import {
  countCursorSessionsAsks,
  holdCursorSessionsReads,
  trackCursorSessionsDemand,
} from "../tests/support/cursorSessionsDemand.ts";
import { parts } from "../tests/dashboardPage.ts";

const instruction = "hold this session";
const slowerThanAskGapMs = askGapMs + 200;

const heldRecord = makeMe.aLaunchRecord
  .adHoc({ instruction, title: instruction })
  .inCursorSession({
    sessionId: "12345678-1234-4123-8123-123456789abc",
    continuation: { workspace: "/Users/test/git/open-dough" },
  })
  .launchedAt("2026-10-01T00:00:00.000Z")
  .please();

const heldSessions: RunningCursorSessions = {
  runner: "running",
  sessions: [{ record: heldRecord, label: "working" }],
};
const unreachable: RunningCursorSessions = {
  runner: "unreachable",
  sessions: [],
};
const noHeldSessions: RunningCursorSessions = {
  runner: "running",
  sessions: [],
};

function holdCursorSession(frontendServices: FrontendServiceState) {
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(
        makeMe.anObservedLaunch
          .of(heldRecord)
          .withSessionState(makeMe.aSessionState.loaded("working").please())
          .please(),
      )
      .please(),
  );
}

async function openRunningList(
  page: Parameters<typeof sessionsSidebarParts>[0],
) {
  const { sidebar, button } = sessionsSidebarParts(page);
  const region = sidebar.getByRole("region", {
    name: "Running Cursor sessions",
  });
  const header = region.getByRole("button", {
    name: "Running Cursor sessions",
  });
  await button.click();
  await header.click();
  return { sidebar, region, header };
}

test("slow Cursor sessions answers still publish under at most one owned read, and collapse or a hidden page ends or pauses that demand", async ({
  page,
  frontendServices,
}) => {
  holdCursorSession(frontendServices);
  await pausePageClock(page);
  const asked = await countCursorSessionsAsks(page);
  const reads = await holdCursorSessionsReads(page);
  try {
    await openFrontendTakenBacklog(page);
    await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1);
    const demand = trackCursorSessionsDemand(page);
    const shownTerminal = page.getByRole("region", { name: "Terminal" });
    const firstRead = reads.nextArrival();
    const { sidebar, region, header } = await openRunningList(page);
    await firstRead;

    // The first answer is slower than the ask gap: page time passes while
    // it is held, and no second read starts.
    await page.clock.runFor(slowerThanAskGapMs);
    expect(await asked()).toBe(1);
    expect(reads.held()).toBe(1);
    await expect.poll(() => demand.outstanding()).toBe(1);
    reads.answer(heldSessions);
    await expect(region).toContainText("The Cursor runner is running.");
    const row = region.getByRole("button", { name: /Open Dough/ });
    await expect(row).toContainText("working");
    await untilPageRequestsAnswered(page);
    expect(demand.peak()).toBe(1);

    // The next read starts one whole ask gap after the answer settled.
    await page.clock.runFor(askGapMs - 1);
    expect(await asked()).toBe(1);
    const followUp = reads.nextArrival();
    await page.clock.runFor(1);
    await followUp;
    expect(await asked()).toBe(2);

    // Hidden, the page asks nothing more, even once the held read is
    // answered and several gaps pass.
    await setPageVisibility(page, "hidden");
    reads.answer(heldSessions);
    await untilPageRequestsAnswered(page);
    await page.clock.runFor(slowerThanAskGapMs * 3);
    expect(await asked()).toBe(2);

    // Seen again, the expanded list asks at once and shows the answer.
    const resumed = reads.nextArrival();
    await setPageVisibility(page, "visible");
    await resumed;
    expect(await asked()).toBe(3);
    reads.answer(heldSessions);
    await expect(region).toContainText("The Cursor runner is running.");
    await expect(row).toContainText("working");
    await untilPageRequestsAnswered(page);
    expect(demand.peak()).toBe(1);

    // Collapsed, the list ends its demand: the armed next ask never starts.
    await header.click();
    await expect(region.locator(".running-cursor-body")).toHaveCount(0);
    expect(demand.outstanding()).toBe(0);
    await page.clock.runFor(slowerThanAskGapMs * 3);
    expect(await asked()).toBe(3);
    expect(reads.held()).toBe(0);

    await expect(shownTerminal).toHaveCount(0);
    await expect(
      sidebar.getByRole("button", { name: instruction, exact: true }),
    ).toBeVisible();
  } finally {
    reads.releaseAll(noHeldSessions);
  }
});

test("while expanded, the list says it is reading, then follows each later read: unreachable, restored, and running with no held sessions", async ({
  page,
  frontendServices,
}) => {
  holdCursorSession(frontendServices);
  await pausePageClock(page);
  const asked = await countCursorSessionsAsks(page);
  const reads = await holdCursorSessionsReads(page);
  // Lets one settled ask gap of page time pass and answers the read it
  // starts.
  const answerNextRead = async (answer: RunningCursorSessions) => {
    await untilPageRequestsAnswered(page);
    const next = reads.nextArrival();
    await page.clock.runFor(askGapMs);
    await next;
    reads.answer(answer);
  };
  try {
    await openFrontendTakenBacklog(page);
    await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1);
    const shownTerminal = page.getByRole("region", { name: "Terminal" });
    const firstRead = reads.nextArrival();
    const { sidebar, region } = await openRunningList(page);
    await firstRead;
    const row = region.getByRole("button", { name: /Open Dough/ });
    await expect(region).toContainText("Reading the Cursor runner…");
    await expect(region.getByRole("listitem")).toHaveCount(0);
    reads.answer(heldSessions);
    await expect(region).toContainText("The Cursor runner is running.");
    await expect(row).toContainText("working");

    await answerNextRead(unreachable);
    await expect(region).toContainText("The Cursor runner cannot be reached.");
    await expect(region.getByRole("listitem")).toHaveCount(0);
    await expect(
      sidebar.getByRole("button", { name: instruction, exact: true }),
    ).toBeVisible();

    await answerNextRead(heldSessions);
    await expect(region).toContainText("The Cursor runner is running.");
    await expect(row).toContainText("working");

    await answerNextRead(noHeldSessions);
    await expect(region.getByRole("listitem")).toHaveCount(0);
    await expect(region).toContainText("The Cursor runner is running.");
    await expect(region).not.toContainText("cannot be reached");
    expect(await asked()).toBe(4);

    await expect(shownTerminal).toHaveCount(0);
  } finally {
    reads.releaseAll(noHeldSessions);
  }
});
