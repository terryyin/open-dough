import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountBoard, reducedBoardMotion } from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { sessions, sidebar } from "./board-session-view.ts";
import { withWidthStorage } from "./side-panel-width-view.ts";
import { boardWork, story } from "./board-work.ts";

test("opening and leaving Start execution on a shown Taken card keeps the view on Taken and Recently done", async () => {
  withWidthStorage();
  await reducedBoardMotion();
  const taken = story("Resume the Taken story", 59);
  const { keptStarts } = makeMe.aMachineAnswer
    .keepingStarts({
      host: "claude",
      workflow: "execution",
      source: "open-dough",
      identity: taken.identity,
      workspace: "/tmp/board-paging-launch-dialog",
      branch: "claude/taken",
    })
    .please();
  const mounted = await mountBoard(
    [
      boardWork(
        [story("Read the first story", 8), story("Read the second story", 9)],
        { taken: [taken] },
      ),
    ],
    { width: 1100, height: 900 },
    {
      keptStartOf: (source, identity, workflow) =>
        keptStarts.find(
          (start) =>
            start.source === source &&
            start.identity === identity &&
            start.workflow === workflow,
        ),
    },
  );
  await sessions.click();
  await expect.element(sidebar).toBeVisible();
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  await board.control("Recently done").click();
  const atTaken = () =>
    board.shows(["Taken", "Recently done"], ["Backlog 2 entries"]);
  await atTaken();
  const card = board
    .column("Taken")
    .getByRole("article", { name: taken.title, exact: true });
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await card
    .getByRole("button", { name: "Start execution", exact: true })
    .click();
  await expect.element(dialog).toBeVisible();
  await expect
    .poll(() => dialog.element().contains(document.activeElement))
    .toBe(true);
  await atTaken();
  await userEvent.keyboard("{Escape}");
  await expect.element(dialog).not.toBeInTheDocument();
  await atTaken();
  mounted.restart(1);
  await expect.element(sidebar).toBeVisible();
  await atTaken();
});
