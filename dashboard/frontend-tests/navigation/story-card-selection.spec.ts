import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { contrastRatio } from "../../test-support/composedColours.ts";
import { decorativeIcon, paintedBackground } from "./board-accessibility.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { noSessions, withBoardStorage } from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";
import { tapWhereShown } from "./board-touch-page.ts";

type Card = ReturnType<typeof page.getByRole>;

const detail = (card: Card) =>
  card.getByRole("region", { name: /^Detail for / });
const heading = (card: Card, title: string) =>
  card.getByRole("heading", { name: title, exact: true }).first();

async function inspected(card: Card, open: boolean) {
  await expect
    .element(
      card.getByRole("button", {
        name: open ? "Hide detail" : "Inspect story",
      }),
    )
    .toHaveAttribute("aria-expanded", String(open));
  if (open) await expect.element(detail(card)).toBeVisible();
  else await expect.element(detail(card)).not.toBeInTheDocument();
}

async function inspectionChevronPoints(control: Card, transform: RegExp) {
  await expect.element(control).toBeVisible();
  const button = control.element();
  decorativeIcon(button);
  const icon = button.querySelector("svg.lucide-chevron-right");
  if (!icon) throw new Error("Inspect story has no chevron.");
  expect(button.firstChild).toBe(icon);
  expect(
    contrastRatio(getComputedStyle(icon).color, paintedBackground(button)),
  ).toBeGreaterThanOrEqual(3);
  await expect.poll(() => getComputedStyle(icon).transform).toMatch(transform);
}

test("empty-area clicks toggle the selected story on active and Recently done cards without opening or closing detail, and nested controls do not select", async () => {
  withBoardStorage("0");
  const activeStory = story(
    "Prepare stories in a clear developer workspace workflow",
    8,
    {
      dependencies: {
        status: "unavailable",
        problem: "The recorded dependency facts could not be read.",
      },
    },
  );
  const completed = makeMe.aDoneRecord
    .completed({
      identity: "SEED-38#card-shows-avatar",
      title: "Card shows avatar",
      completedAt: new Date(Date.now() - 30_000).toISOString(),
    })
    .please();
  const closed = makeMe.aLaunchRecord
    .executing(completed)
    .inClaudeSession({ sessionId: "done-card-session" })
    .launchedAt(new Date(Date.now() - 120_000).toISOString())
    .markedDoneAt(new Date(Date.now() - 60_000).toISOString())
    .please();
  const { records } = makeMe.aMachineAnswer
    .observingUnavailable(closed)
    .please();
  const { done, doneReads } = makeMe.aDoneCatalog.holding([completed]).please();
  const startLaunch = vi.fn();
  const readHistory = vi.fn();
  await mountBoardFrame(
    boardWork([activeStory], { taken: [], done }),
    { width: 1280, height: 900 },
    "stories",
    {
      ...noSessions,
      records,
      launched: records,
      start: startLaunch,
      readHistory,
    },
    { done: doneReads },
  );

  const active = board
    .column("Backlog")
    .getByRole("article", { name: activeStory.title, exact: true });
  const doneCard = board
    .column("Recently done")
    .getByRole("article", { name: completed.title, exact: true });
  const activeArea = heading(active, activeStory.title);
  const doneArea = heading(doneCard, completed.title);
  await activeArea.click();
  await board.expectStoryHighlight(active);
  await inspected(active, false);
  await activeArea.click();
  await board.expectStorySelection(active, false);
  await inspected(active, false);

  const inspect = active.getByRole("button", { name: "Inspect story" });
  const hide = active.getByRole("button", { name: "Hide detail" });
  await inspectionChevronPoints(inspect, /^none$/);
  await inspect.click();
  await inspected(active, true);
  await inspectionChevronPoints(hide, /^matrix\((?:-?0|[\d.]+e-\d+), 1, -1, /);
  await board.expectStorySelection(active, false);
  await detail(active).click();
  await board.expectStorySelection(active, false);
  await activeArea.click();
  await board.expectStoryHighlight(active);
  await inspected(active, true);
  await activeArea.click();
  await board.expectStorySelection(active, false);
  await inspected(active, true);
  await hide.click();
  await inspected(active, false);
  await inspectionChevronPoints(inspect, /^none$/);
  await board.expectStorySelection(active, false);

  await activeArea.click();
  await board.expectStoryHighlight(active);
  const start = active.getByRole("button", { name: "Start execution" });
  await expect.element(start).toBeDisabled();
  await tapWhereShown(start.element());
  await board.expectStoryHighlight(active);
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  expect(startLaunch).not.toHaveBeenCalled();

  await doneArea.click();
  await board.expectStoryHighlight(doneCard);
  await board.expectStorySelection(active, false);
  await inspected(active, false);
  await expect.element(detail(doneCard)).not.toBeInTheDocument();
  const session = doneCard
    .getByRole("list", { name: "Sessions" })
    .getByRole("article");
  await expect.element(session).toBeVisible();
  await session
    .getByRole("heading", { name: completed.title, exact: true })
    .click();
  await board.expectStoryHighlight(doneCard);
  await expect.element(detail(doneCard)).not.toBeInTheDocument();
  expect(readHistory).toHaveBeenCalled();
  expect(document.querySelector(".side-panel")).toBeNull();

  const intent = page.getByRole("main", { name: "Intent", exact: true });
  const intentChoice = page.getByRole("radio", { name: "Intent", exact: true });
  const development = page.getByRole("radio", {
    name: "Development",
    exact: true,
  });
  const only = intent.getByText("Selected story only", { exact: true });
  await intentChoice.click();
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", completed.identity);
  await expect.element(only).not.toBeInTheDocument();
  await expect
    .element(intent.getByRole("checkbox", { name: "Selected story only" }))
    .not.toBeInTheDocument();
  await development.click();
  await board.expectStoryHighlight(doneCard);
  await doneArea.click();
  await board.expectStorySelection(doneCard, false);
  await intentChoice.click();
  await expect.element(intent).toBeVisible();
  await expect.element(intent).not.toHaveAttribute("data-selected-story");
  await expect.element(only).not.toBeInTheDocument();
  await development.click();
});
