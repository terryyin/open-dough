import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import { boardWork, story } from "../navigation/board-work.ts";
import { doneCard } from "./recently-done-column-page.ts";
import { mountSessionCards } from "./session-card-mount.ts";

test("a failed history read leaves retained sessions as shown and the next opening asks again", async () => {
  vi.useFakeTimers({
    toFake: ["Date"],
    now: new Date("2026-10-28T10:00:00.000Z"),
  });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const title = "Retained through a failure";
  const owner = story("Read retained history", 608);
  const completed = makeMe.aDoneRecord
    .completed({ ...owner, completedAt: "2026-10-28T09:55:00.000Z" })
    .please();
  const catalog = makeMe.aDoneCatalog.holding([completed]).please();
  const record = makeMe.anObservedLaunch
    .of(
      makeMe.aLaunchRecord
        .adHoc({ instruction: title, title, storyIdentity: owner.identity })
        .launchedAt("2026-10-28T09:30:00.000Z")
        .markedDoneAt("2026-10-28T09:55:00.000Z")
        .please(),
    )
    .withSessionState(makeMe.aSessionState.retained("review").please())
    .please();
  const readHistorySince = vi
    .fn<MachineReadSource["readHistorySince"]>()
    .mockResolvedValueOnce(undefined)
    .mockResolvedValue({
      revision: "history-1",
      records: [record],
      attempts: [],
    });
  await mountSessionCards({
    published: boardWork([], {
      revision: catalog.done.revision,
      done: catalog.done,
    }),
    done: catalog.doneReads,
    reading: {
      ...makeMe.aMachineAnswer.observing(record).please(),
      revision: "overview",
      historyRevision: "history-1",
    },
    machineReads: { readHistorySince },
  });
  const entry = doneCard(owner.title).getByRole("article", {
    name: `Ad hoc session for ${title}`,
  });
  const details = entry.getByRole("button", { name: "Session details" });
  await expect.element(entry).toBeVisible();
  const summary = () =>
    entry.element().querySelector(".session-entry-summary")?.textContent;
  const shown = summary();
  expect(shown).toContain("Done");
  expect(readHistorySince).not.toHaveBeenCalled();

  await details.click();
  await expect.poll(() => readHistorySince.mock.calls).toEqual([[undefined]]);
  await expect.element(details).toHaveAttribute("aria-expanded", "true");
  expect(summary()).toBe(shown);

  await details.click();
  await expect
    .poll(() => readHistorySince.mock.calls)
    .toEqual([[undefined], [undefined]]);
  await expect.element(details).toHaveAttribute("aria-expanded", "false");
  expect(summary()).toBe(shown);
});
