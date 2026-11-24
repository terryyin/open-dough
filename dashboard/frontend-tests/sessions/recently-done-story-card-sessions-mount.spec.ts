// A done story's card on the mounted Board, over typed machine answers and a
// published done catalog: it holds this machine's closed sessions of the
// story, newest first and marked Done, while an open session of that story
// stays in Taken with its controls, and entries order by completion. Closed
// sessions here are retained without a live terminal.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardReading } from "../navigation/board-reading-page.ts";
import { boardWork } from "../navigation/board-work.ts";
import {
  doneCard,
  heldSessions,
  recentlyDone,
  standaloneEntry,
  topLevelEntries,
} from "./recently-done-column-page.ts";

const day = 24 * 60;

// The page's quiet text colour where `entry` sits.
function quietText(entry: Element) {
  const probe = document.createElement("span");
  probe.style.color = "var(--quiet)";
  entry.append(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
}

// The page's raised surface colour where `entry` sits: a nested entry is set
// off on it from its card.
function raisedSurface(entry: Element) {
  const probe = document.createElement("div");
  probe.style.backgroundColor = "var(--raised-surface)";
  entry.parentElement?.append(probe);
  const colour = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return colour;
}
const executed = { identity: "SEED-302#executed", title: "Card shows avatar" };
const lastWeek = { identity: "SEED-303#last-week", title: "Done last week" };
const removed = { identity: "SEED-304#removed", title: "Removed queued" };

test("a done story's card holds this machine's closed sessions for it, newest first, while its open session stays local Taken, and done cards order by completion", async () => {
  const catalog = makeMe.aDoneCatalog
    .holding(
      [
        [executed, 10],
        [removed, 120],
        [lastWeek, 7 * day],
      ].map(([story, ago]) =>
        makeMe.aDoneRecord
          .completed({
            ...(story as typeof executed),
            completedAt: minutesAgo(ago as number),
          })
          .please(),
      ),
    )
    .please();
  const session = (
    story: typeof executed,
    sessionId: string,
    launched: number,
    done?: number,
  ) => {
    const record = (
      done === undefined
        ? makeMe.aLaunchRecord.refining(story)
        : makeMe.aLaunchRecord.executing(story)
    )
      .inClaudeSession({ sessionId })
      .launchedAt(minutesAgo(launched));
    if (done !== undefined) record.markedDoneAt(minutesAgo(done));
    return record.please();
  };
  const adHoc = makeMe.aLaunchRecord
    .adHoc({ title: "Open Dough session" })
    .inClaudeSession({ sessionId: "ad-hoc-done" })
    .launchedAt(minutesAgo(5))
    .markedDoneAt(minutesAgo(4))
    .please();
  await mountBoardFrame(
    boardWork([], { done: catalog.done }),
    { width: 1280, height: 900 },
    "stories",
    {
      answer: makeMe.aMachineAnswer
        .observingOpen(session(executed, "executed-open", 3))
        .observingUnavailable(
          session(executed, "older-closed-card-session", 60, 30),
          session(executed, "newer-closed-card-session", 40, 20),
          session(lastWeek, "launched-yesterday", day, day - 10),
          adHoc,
        )
        .please(),
    },
    { done: catalog.doneReads },
  );
  await expect.element(doneCard(lastWeek.title)).toBeVisible();
  expect(topLevelEntries()).toEqual(
    [
      standaloneEntry("Open Dough session"),
      doneCard(executed.title),
      doneCard(removed.title),
      doneCard(lastWeek.title),
    ].map((entry) => entry.element()),
  );

  await expect.poll(() => heldSessions(executed.title).all()).toHaveLength(2);
  expect(
    heldSessions(executed.title)
      .all()
      .map((entry) => entry.element().getAttribute("data-shows-session")),
  ).toEqual([
    "claude:newer-closed-card-session",
    "claude:older-closed-card-session",
  ]);
  for (const closed of heldSessions(executed.title).all()) {
    await expect
      .element(closed)
      .toHaveAccessibleName(`Execution session for ${executed.title}`);
    expect(closed.element().querySelector(".session-state")?.textContent).toBe(
      "Done",
    );
    expect(
      closed.getByRole("button", { name: "More session actions" }).all(),
    ).toHaveLength(0);
    expect(
      closed.getByRole("button", { name: /^Open terminal/ }).all(),
    ).toHaveLength(0);
    expect(getComputedStyle(closed.element()).backgroundColor).toBe(
      raisedSurface(closed.element()),
    );
    // In-card text: the entry reads in its card's colour, its local facts quiet.
    const cardColour = getComputedStyle(
      doneCard(executed.title).element(),
    ).color;
    const quiet = quietText(closed.element());
    expect(cardColour).not.toBe(quiet);
    expect(getComputedStyle(closed.element()).color).toBe(cardColour);
    const local = closed.element().querySelector(".launch-local");
    expect(local && getComputedStyle(local).color).toBe(quiet);
  }
  const local = boardReading
    .column("Taken")
    .getByRole("article", { name: `Refinement session for ${executed.title}` });
  await expect
    .element(local.getByText("Working", { exact: true }))
    .toBeVisible();
  await expect.element(local.getByText(executed.identity)).toBeVisible();
  await expect
    .element(local.getByRole("button", { name: /^Open terminal/ }))
    .toBeVisible();
  await expect
    .element(local.getByRole("button", { name: "More session actions" }))
    .toBeVisible();
  expect(
    recentlyDone()
      .getByRole("article", {
        name: `Refinement session for ${executed.title}`,
      })
      .all(),
  ).toHaveLength(0);

  await expect
    .element(heldSessions(lastWeek.title))
    .toHaveAccessibleName(`Execution session for ${lastWeek.title}`);
  expect(heldSessions(removed.title).all()).toHaveLength(0);
});
