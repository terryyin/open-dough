// A follow-up's native state changes in place on its published Done card.
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
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

test("a follow-up stays on its source Done card as its local state changes", async () => {
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
  const nested = heldSessions(source.title);
  await expect.element(nested).toHaveAccessibleName(standaloneName(title));
  await expect
    .element(nested.getByText("Working", { exact: true }))
    .toBeVisible();

  machine.answer(
    makeMe.aMachineAnswer
      .observingDone(followUp(title, "2026-11-16T13:10:00.000Z"))
      .please(),
  );
  pollNow();
  await expect.element(nested.getByText("Done", { exact: true })).toBeVisible();

  const readsBeforeReopen = machine.reads();
  machine.answer(makeMe.aMachineAnswer.observingOpen(open).please());
  // Polls until the reopened answer is read, then reads where it went.
  await expect
    .poll(() => {
      pollNow();
      return machine.reads();
    })
    .toBeGreaterThan(readsBeforeReopen);
  await expect
    .element(nested.getByText("Working", { exact: true }))
    .toBeVisible();
});
