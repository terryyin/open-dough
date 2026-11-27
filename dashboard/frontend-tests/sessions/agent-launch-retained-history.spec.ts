import { expect, onTestFinished, test, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import type { MachineSessionsRead } from "../../src/machineSessionsRevision.ts";
import { sessionListing } from "../../src/sessionListing.ts";
import { boardWork, story } from "../navigation/board-work.ts";
import { doneCard } from "./recently-done-column-page.ts";
import { mountSessionCards } from "./session-card-mount.ts";

// A retained ad hoc session of a published Done story, at a fixed now.
function retainedSession(title: string) {
  vi.useFakeTimers({
    toFake: ["Date"],
    now: new Date("2026-10-28T10:00:00.000Z"),
  });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const owner = story("Read retained history", 608);
  const completed = makeMe.aDoneRecord
    .completed({ ...owner, completedAt: "2026-10-28T09:55:00.000Z" })
    .please();
  const catalog = makeMe.aDoneCatalog.holding([completed]).please();
  const session = makeMe.aLaunchRecord
    .adHoc({ instruction: title, title, storyIdentity: owner.identity })
    .launchedAt("2026-10-28T09:30:00.000Z")
    .markedDoneAt("2026-10-28T09:55:00.000Z");
  const observed = (record: ReturnType<typeof session.please>) =>
    makeMe.anObservedLaunch
      .of(record)
      .withSessionState(makeMe.aSessionState.retained("review").please())
      .please();
  return {
    owner,
    session,
    observed,
    published: boardWork([], {
      revision: catalog.done.revision,
      done: catalog.done,
    }),
    done: catalog.doneReads,
    // The overview of `listed`, naming the history revision it is part of.
    reading: (
      ...listed: ReturnType<typeof observed>[]
    ): MachineSessionsRead => ({
      ...makeMe.aMachineAnswer.observing(...listed).please(),
      revision: "overview",
      historyRevision: "history-1",
    }),
  };
}

test("a failed history read leaves retained sessions as shown and the next opening asks again", async () => {
  const title = "Retained through a failure";
  const { owner, session, observed, published, done, reading } =
    retainedSession(title);
  const record = observed(session.please());
  const readHistorySince = vi
    .fn<MachineReadSource["readHistorySince"]>()
    .mockResolvedValueOnce(undefined)
    .mockResolvedValue({
      revision: "history-1",
      records: [record],
      attempts: [],
    });
  await mountSessionCards({
    published,
    done,
    reading: reading(record),
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

test("a history answer adding a retained session's detail keeps its Needs review cue shown", async () => {
  const title = "Retained with its reporting";
  const { session, observed, published, done, reading } =
    retainedSession(title);
  const full = observed(
    session
      .reportingThrough({
        origin: "https://dashboard.example",
        reference: "retained-reporting",
        command: "node report.mjs",
      })
      .please(),
  );
  let answerHistory = () => {};
  const readHistorySince = vi.fn<MachineReadSource["readHistorySince"]>(
    () =>
      new Promise((resolve) => {
        answerHistory = () => {
          resolve({ revision: "history-1", records: [full], attempts: [] });
        };
      }),
  );
  await mountSessionCards({
    published,
    done,
    reading: reading(sessionListing(full)),
    machineReads: { readHistorySince },
    reviewStates: () => Promise.resolve(new Map()),
  });
  await page.getByRole("button", { name: /^Sessions/ }).click();
  const region = page.getByRole("region", { name: "Recently done sessions" });
  const header = region.getByRole("button", { name: "Recently done sessions" });
  if (header.element().getAttribute("aria-expanded") !== "true")
    await header.click();
  const cue = region.getByText("Needs review", { exact: true });
  await expect.element(cue).toBeVisible();
  await expect.poll(() => readHistorySince.mock.calls).toEqual([[undefined]]);
  let dropped = false;
  const watching = new MutationObserver(() => {
    if (cue.query() === null) dropped = true;
  });
  watching.observe(region.element(), { subtree: true, childList: true });
  onTestFinished(() => {
    watching.disconnect();
  });
  answerHistory();
  // Gives the answer its renders and the links their next read.
  for (let frame = 0; frame < 3; frame += 1)
    await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(dropped).toBe(false);
  await expect.element(cue).toBeVisible();
});
