// A story follow-up's Recently done membership follows the machine's next
// answer on the mounted Board: Done moves it from Taken onto its source card,
// and reopening returns it to Taken.
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { boardReading } from "../navigation/board-reading-page.ts";
import {
  catalogs,
  followUp,
  source,
} from "./recently-done-card-membership-mount-page.ts";
import { heldSessions, standaloneName } from "./recently-done-column-page.ts";
import {
  machineReader,
  mountSessions,
  pollNow,
} from "./recently-done-sidebar-mount-page.ts";

test("a follow-up answered Done moves from Taken onto its source card, and reopened returns to Taken", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const title = "Tighten the pause wording";
  const open = followUp(title, undefined);
  const machine = machineReader(
    makeMe.aMachineAnswer.observingOpen(open).please(),
  );
  await mountSessions(machine, catalogs({ "open-dough": [source] }));
  const taken = boardReading
    .column("Taken")
    .getByRole("article", { name: standaloneName(title), exact: true });

  await expect.element(taken).toBeVisible();
  expect(heldSessions(source.title).all()).toHaveLength(0);

  machine.answer(
    makeMe.aMachineAnswer
      .observingDone(followUp(title, "2026-11-16T13:10:00.000Z"))
      .please(),
  );
  pollNow();
  await expect
    .element(heldSessions(source.title))
    .toHaveAccessibleName(standaloneName(title));
  expect(taken.all()).toHaveLength(0);

  const readsBeforeReopen = machine.reads();
  machine.answer(makeMe.aMachineAnswer.observingOpen(open).please());
  // Polls until the reopened answer is read, then reads where it went.
  await expect
    .poll(() => {
      pollNow();
      return machine.reads();
    })
    .toBeGreaterThan(readsBeforeReopen);
  await expect.element(taken).toBeVisible();
  expect(heldSessions(source.title).all()).toHaveLength(0);
});
