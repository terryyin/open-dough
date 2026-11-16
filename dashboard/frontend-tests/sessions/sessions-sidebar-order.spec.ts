// Sessions sidebar attention order against controlled machine answers:
// oldest needing the developer first, then other open sessions newest first.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  doughnutSource,
  openDoughSource,
} from "../../tests/support/frontendServiceState.ts";
import { expectProjectChoice } from "../../tests/dashboardPage.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { watchRecordReads } from "../../tests/sessionStatePace.ts";
import {
  expectSessionsSidebarSessionEntryShown,
  sessionsSidebarParts,
} from "../../tests/sessionsSidebarPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord, SessionState } from "../../src/launchRecord.ts";

function observe(
  records: readonly { record: LaunchRecord; state: SessionState }[],
) {
  return makeMe.aMachineAnswer
    .observing(
      ...records.map(({ record, state }) =>
        makeMe.anObservedLaunch.of(record).withSessionState(state).please(),
      ),
    )
    .please();
}

test("leads with the sessions that need the developer, earliest launch first, then the others newest first", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date());
  Object.assign(frontendServices, {
    projects: [openDoughSource, doughnutSource],
  });
  const { passOnePace } = await watchRecordReads(page);
  const now = Date.now();
  const story = (letter: string, minutesAgo: number) => {
    const title = `Story ${letter}`;
    return makeMe.aLaunchRecord
      .executing({
        identity: `SEED-900#story-${letter}`,
        title,
        source: "doughnut",
      })
      .inClaudeSession({ sessionId: `order-${letter}` })
      .launchedAt(new Date(now - minutesAgo * 60_000).toISOString())
      .please();
  };
  // Launch order earliest first: A working, B blocked, C failed, D working, E working.
  const working08 = story("A", 50);
  const blocked09 = story("B", 40);
  const failed10 = story("C", 30);
  const working11 = story("D", 20);
  const working12 = story("E", 10);
  const titleOf = (record: LaunchRecord) => record.request.title;
  const withStates = (
    blocked: SessionState,
    failed: SessionState,
    later: SessionState,
  ) =>
    observe([
      {
        record: working08,
        state: makeMe.aSessionState.loaded("working").please(),
      },
      { record: blocked09, state: blocked },
      { record: failed10, state: failed },
      { record: working11, state: later },
      {
        record: working12,
        state: makeMe.aSessionState.loaded("working").please(),
      },
    ]);
  frontendServices.answerMachine(
    withStates(
      makeMe.aSessionState.loaded("waiting").please(),
      makeMe.aSessionState.loaded("failed").please(),
      makeMe.aSessionState.loaded("working").please(),
    ),
  );
  await page.goto("/?project=doughnut");
  await expectProjectChoice(page, "Doughnut");
  const { button, entries, titles, badge } = sessionsSidebarParts(page);
  await button.click();
  await expect(entries).toHaveCount(5);

  await test.step("a needs-input and a failed session lead, earliest first, then the working ones newest first", async () => {
    await expect(titles).toHaveText([
      titleOf(blocked09),
      titleOf(failed10),
      titleOf(working12),
      titleOf(working11),
      titleOf(working08),
    ]);
    await expect(badge).toHaveText("2");
  });

  await test.step("a working session that needs input joins the attention group at its launch place, and the count rises", async () => {
    frontendServices.answerMachine(
      withStates(
        makeMe.aSessionState.loaded("waiting").please(),
        makeMe.aSessionState.loaded("failed").please(),
        makeMe.aSessionState.loaded("waiting").please(),
      ),
    );
    await passOnePace();
    await expect(badge).toHaveText("3");
    await expect(titles).toHaveText([
      titleOf(blocked09),
      titleOf(failed10),
      titleOf(working11),
      titleOf(working12),
      titleOf(working08),
    ]);
    await expectSessionsSidebarSessionEntryShown(
      entries.nth(2),
      "Needs input",
      "needs-input",
    );
  });
});
