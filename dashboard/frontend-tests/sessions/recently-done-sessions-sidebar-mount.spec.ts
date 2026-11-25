// Recently done sessions in the production Sessions sidebar, mounted in the
// configured dashboard frame over typed machine answers: retained rows across
// projects, project identity, newest-first order and completion age.
import { expect, onTestFinished, test, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import { fortyFiveDoneSessions } from "../../test-support/retainedDoneSessions.ts";
import {
  ageShown,
  machineReader,
  mountSessions,
  openSessionRow,
  pollNow,
} from "./recently-done-sidebar-mount-page.ts";

test("Recently done lists completed sessions across projects newest completion first, with completion age and project identity", async () => {
  const done = (
    title: string,
    source: string,
    launched: number,
    completed: number,
  ) =>
    makeMe.aLaunchRecord
      .adHoc({ instruction: title, title, source })
      .inClaudeSession({ sessionId: title.replaceAll(" ", "-") })
      .launchedAt(minutesAgo(launched))
      .markedDoneAt(minutesAgo(completed))
      .please();
  const newest = done("Newest completion", "doughnut", 24 * 60, 1);
  const middle = done("Middle completion", "open-dough", 2, 5);
  const older = makeMe.aLaunchRecord
    .executing({
      identity: "SEED-401#done-yesterday",
      title: "Older completion",
      source: "pygardon",
    })
    .inClaudeSession({ sessionId: "done-yesterday" })
    .launchedAt(minutesAgo(2 * 24 * 60))
    .markedDoneAt(minutesAgo(24 * 60))
    .please();
  const stillOpen = makeMe.aLaunchRecord
    .executing({
      identity: "SEED-301#still-open",
      title: "Pygardon story still open",
      source: "pygardon",
    })
    .inClaudeSession({ sessionId: "still-open" })
    .launchedAt(minutesAgo(4))
    .please();
  const shown = await mountSessions(
    makeMe.aMachineAnswer
      .observingDone(newest, middle)
      .observingUnavailable(older)
      .observingOpen(stillOpen)
      .please(),
  );

  await expect.element(shown.header).toHaveAttribute("aria-expanded", "false");
  await shown.header.click();
  await expect.element(shown.header).toHaveAttribute("aria-expanded", "true");
  await expect
    .poll(shown.titles)
    .toEqual(["Newest completion", "Middle completion", "Older completion"]);
  expect(shown.region.element().textContent).not.toContain(
    "Pygardon story still open",
  );
  expect(
    [
      ...document.querySelectorAll(
        ".sessions-sidebar-sessions li.sessions-sidebar-session-entry h3",
      ),
    ].map((heading) => heading.textContent),
  ).toEqual(["Pygardon story still open"]);
  const ageOf = (title: string) => ageShown(shown.row(title))?.textContent;
  expect(ageOf("Newest completion")).toBe("1m");
  expect(ageOf("Middle completion")).toBe("5m");
  expect(ageOf("Older completion")).toBe("1d");
  const tooltipOf = (title: string) =>
    shown.row(title)?.querySelector("[title]")?.getAttribute("title");
  expect(tooltipOf("Newest completion")).toMatch(/(^|\n)Doughnut · /);
  expect(tooltipOf("Older completion")).toMatch(
    /(^|\n)Pygardon · Execution(\n|$)/,
  );
  const facts = shown
    .row("Newest completion")
    ?.querySelector(".sessions-sidebar-session-entry-facts")?.textContent;
  expect(facts).toContain(
    `Completed ${new Date(newest.doneAt ?? "").toLocaleString()}`,
  );
  expect(facts).not.toContain(
    `Launched ${new Date(newest.launchedAt).toLocaleString()}`,
  );
});

test("an open session in the Sessions sidebar shows its launch age and Launched time", async () => {
  const stillOpen = makeMe.aLaunchRecord
    .adHoc({ instruction: "Still open", title: "Still open" })
    .inClaudeSession({ sessionId: "still-open" })
    .launchedAt(minutesAgo(4))
    .please();
  await mountSessions(makeMe.aMachineAnswer.observingOpen(stillOpen).please());

  const openRow = openSessionRow();
  expect(ageShown(openRow)?.textContent).toBe("4m");
  expect(openRow?.querySelector("[title]")?.getAttribute("title")).toContain(
    `Launched ${new Date(stillOpen.launchedAt).toLocaleString()}`,
  );
});

test("an expanded Recently done with no retained sessions says none are listed", async () => {
  const empty = await mountSessions(makeMe.aMachineAnswer.please());
  await empty.header.click();
  await expect
    .poll(() => empty.region.element().textContent)
    .toContain("No sessions marked done are listed.");
  expect(empty.titles()).toEqual([]);
});

test("Recently done reads, reveals 20, 40 and 45 newest first, keeps that range through collapse, hiding, a cross-project Select and refresh, and moves focus off a removed row", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  // Two of them share a completion time and keep their order.
  const { titles, records } = fortyFiveDoneSessions(Date.now());
  const machine = machineReader(
    makeMe.aMachineAnswer.observingUnavailable(...records).please(),
  );
  const releaseFirst = machine.hold();
  const selectStory = "SEED-401#older-cross-project";
  const shown = await mountSessions(machine, {
    awaitSessionsRead: false,
    association: () =>
      Promise.resolve({ kind: "linked", identity: selectStory }),
  });
  await shown.header.click();
  await expect
    .poll(() => shown.region.element().textContent)
    .toContain("Reading sessions…");
  expect(shown.titles()).toEqual([]);
  releaseFirst();
  await expect.poll(shown.titles).toEqual(titles.slice(0, 20));

  await expect
    .poll(shown.titlesRevealingThrough(40))
    .toEqual(titles.slice(0, 40));
  await expect.poll(shown.titlesRevealingThrough(45)).toEqual(titles);
  shown.revealOlder();
  await expect.poll(shown.titles).toEqual(titles);

  await shown.header.click();
  await expect.element(shown.header).toHaveAttribute("aria-expanded", "false");
  await shown.header.click();
  const sessionsButton = page.getByRole("button", { name: /^Sessions/ });
  await sessionsButton.click();
  await sessionsButton.click();
  await expect.poll(shown.titles).toEqual(titles);

  const olderCrossProject = titles[40] ?? "";
  await shown.select(olderCrossProject).click();
  await expect
    .element(shown.select(olderCrossProject))
    .toHaveAttribute("aria-pressed", "true");
  await expect
    .element(page.getByRole("radio", { name: "Doughnut" }))
    .toBeChecked();
  expect(shown.titles()).toEqual(titles);

  const removed = titles[24] ?? "";
  const newTitle = "Brand new completion";
  shown.select(removed).element().focus();
  machine.answer(
    makeMe.aMachineAnswer
      .observingUnavailable(
        makeMe.aLaunchRecord
          .adHoc({ instruction: newTitle, title: newTitle, source: "doughnut" })
          .inClaudeSession({ sessionId: "done-new" })
          .launchedAt(minutesAgo(1))
          .markedDoneAt(new Date().toISOString())
          .please(),
        ...records.filter((record) => record.request.title !== removed),
      )
      .please(),
  );
  pollNow();
  const refreshed = [newTitle, ...titles.filter((title) => title !== removed)];
  await expect.poll(shown.titles).toEqual(refreshed);
  expect(document.activeElement).not.toBe(document.body);
  expect(document.activeElement?.isConnected).toBe(true);
  expect(document.activeElement?.textContent).not.toContain(removed);

  machine.fail();
  const readsBeforeFailure = machine.reads();
  pollNow();
  await expect.poll(machine.reads).toBeGreaterThan(readsBeforeFailure);
  await expect.poll(shown.titles).toEqual(refreshed);
  expect(shown.region.element().textContent).not.toContain(
    "No sessions marked done",
  );
});

test("the reached range of 45 survives a project change", async () => {
  const { titles, records } = fortyFiveDoneSessions(Date.now());
  const shown = await mountSessions(
    makeMe.aMachineAnswer.observingUnavailable(...records).please(),
  );
  await shown.header.click();
  await expect.poll(shown.titles).toHaveLength(20);
  await expect.poll(shown.titlesRevealingThrough(45)).toEqual(titles);

  const pygardon = page.getByRole("radio", { name: "Pygardon", exact: true });
  await pygardon.click();
  await expect.element(pygardon).toBeChecked();
  expect(shown.titles()).toEqual(titles);
});
