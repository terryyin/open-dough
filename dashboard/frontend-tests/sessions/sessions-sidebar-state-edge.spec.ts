// Sessions sidebar Session entry state edge against controlled machine
// answers: border style, thickness and colour per state, plus hidden AT label.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  doughnutSource,
  openDoughSource,
  putFrontendMachine,
} from "../../tests/support/frontendServiceState.ts";
import { expectProjectChoice } from "../../tests/dashboardPage.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import {
  expectSessionsSidebarSessionEntryShown,
  sessionsSidebarSessionEntryEdges,
  sessionsSidebarParts,
} from "../../tests/sessionsSidebarPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { SessionState } from "../../src/launchRecord.ts";

test("each state has its own border style, thickness, and colour, and its hidden label", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date());
  Object.assign(frontendServices, {
    projects: [openDoughSource, doughnutSource],
  });
  const states = [
    ["Working", "working", makeMe.aSessionState.loaded("working").please()],
    [
      "Needs input",
      "needs-input",
      makeMe.aSessionState.loaded("waiting").please(),
    ],
    [
      "Ready for review",
      "ready",
      makeMe.aSessionState.loaded("review").please(),
    ],
    [
      "Session failed",
      "halted",
      makeMe.aSessionState.loaded("failed").please(),
    ],
    [
      "Session stopped",
      "halted",
      makeMe.aSessionState.loaded("interrupted").please(),
    ],
    [
      "Session unavailable",
      "unsettled",
      makeMe.aSessionState.unavailable().please(),
    ],
    [
      "State not recognized: Claude Code lists it as napping",
      "unsettled",
      {
        kind: "available",
        availability: "loaded",
        activity: "unknown",
        description: "Claude Code lists it as napping",
        unknownReason: "unrecognized",
      } satisfies SessionState,
    ],
  ] as const satisfies readonly (readonly [
    string,
    keyof typeof sessionsSidebarSessionEntryEdges,
    SessionState,
  ])[];
  const titles: string[] = [];
  const observed = states.map(([, , state], index) => {
    const title = `Edge story ${index}`;
    titles.push(title);
    const record = makeMe.aLaunchRecord
      .executing({
        identity: `SEED-901#edge-${String(index)}`,
        title,
        source: "doughnut",
      })
      .inClaudeSession({ sessionId: `edge-${String(index)}` })
      .please();
    return makeMe.anObservedLaunch.of(record).withSessionState(state).please();
  });
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer.observing(...observed).please(),
  );
  await page.goto("/?project=doughnut");
  await expectProjectChoice(page, "Doughnut");
  const {
    button,
    entries,
    entry: entryControl,
    row,
  } = sessionsSidebarParts(page);
  await button.click();
  await expect(entries).toHaveCount(states.length);

  for (const [index, [words, tone]] of states.entries()) {
    const title = titles[index] ?? "?";
    await expectSessionsSidebarSessionEntryShown(row(title), words, tone);
    await expect(entryControl(title)).toHaveCount(1);
  }

  const widthOf = (title: string) =>
    row(title).evaluate((shown) =>
      parseFloat(getComputedStyle(shown).borderLeftWidth),
    );
  const thick = await widthOf(titles[1] ?? "?");
  expect(await widthOf(titles[2] ?? "?")).toBe(thick);
  expect(thick).toBeGreaterThan(await widthOf(titles[0] ?? "?"));
});
