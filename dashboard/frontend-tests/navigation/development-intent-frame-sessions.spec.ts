import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { boardReading as board } from "./board-reading-page.ts";
import { emptyMachineAnswer } from "./board-frame-observation-supply.ts";
import {
  answerTerminal,
  backlogCard,
  openRecord,
  openSidebarSession,
  sessions,
  sidebar,
  terminal,
} from "./board-session-view.ts";
import {
  currentHistoryIndex,
  development,
  intent,
  intentChoice,
  mountPerspectiveFrame,
  openDoughStory,
  params,
  pygardonStory,
  showsUnconfiguredIntent,
} from "./development-intent-frame-page.ts";
import { showsChosenProject } from "./dashboard-header-reading.ts";
import { withWidthStorage } from "./side-panel-width-view.ts";

test("a Sessions sidebar entry from Intent goes to its project's Development stories and session, and the terminal stays attached across perspectives", async () => {
  withWidthStorage();
  answerTerminal();
  const reveal = vi.spyOn(Element.prototype, "scrollIntoView");
  onTestFinished(() => {
    reveal.mockRestore();
  });
  const pygardonSession = makeMe.aLaunchRecord
    .refining({
      identity: pygardonStory.identity,
      title: pygardonStory.title,
      source: "pygardon",
    })
    .inClaudeSession({ sessionId: pygardonStory.identity })
    .please();
  const answer = {
    ...emptyMachineAnswer(),
    ...makeMe.aMachineAnswer
      .observingOpen(openRecord(openDoughStory), pygardonSession)
      .please(),
  };
  await mountPerspectiveFrame(
    { width: 1440, height: 900 },
    { machine: { answer } },
  );

  await intentChoice.click();
  await showsUnconfiguredIntent("Open Dough");
  await sessions.click();
  await expect
    .element(
      sidebar.getByRole("button", { name: openDoughStory.title, exact: true }),
    )
    .toBeVisible();
  const entry = sidebar.getByRole("button", {
    name: pygardonStory.title,
    exact: true,
  });
  const before = currentHistoryIndex();
  await openSidebarSession(pygardonStory.title);
  await expect.poll(() => showsChosenProject("Pygardon")).toBe(true);
  await expect.element(development).toBeChecked();
  await expect.element(intent).not.toBeInTheDocument();
  expect(params().get("project")).toBe("pygardon");
  expect(params().get("view")).toBeNull();
  expect(params().get("perspective")).toBeNull();
  expect(currentHistoryIndex()).toBe(before + 1);
  const card = backlogCard(pygardonStory.title);
  await expect
    .element(card.getByText("Shown in terminal", { exact: true }))
    .toBeVisible();
  await expect.poll(() => board.inReadingRoom(card.element())).toBe(true);
  await expect
    .element(board.column("Taken").getByRole("article"))
    .not.toBeInTheDocument();
  await expect.element(entry).toHaveAttribute("aria-current", "true");
  const screen = terminal.element();

  await intentChoice.click();
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", pygardonStory.identity);
  await expect
    .element(
      intent.getByText(/^No Intent locations are configured for Pygardon\./),
    )
    .toBeInTheDocument();
  expect(terminal.element()).toBe(screen);
  await development.click();
  await expect.element(intent).not.toBeInTheDocument();
  expect(terminal.element()).toBe(screen);

  await intentChoice.click();
  await expect.element(intent).toBeVisible();
  const from = currentHistoryIndex();
  const alreadyRevealed = reveal.mock.contexts.length;
  await entry.click();
  await expect.element(intent).not.toBeInTheDocument();
  await expect.element(development).toBeChecked();
  expect(currentHistoryIndex()).toBe(from + 1);
  await expect
    .poll(() =>
      reveal.mock.contexts.slice(alreadyRevealed).includes(card.element()),
    )
    .toBe(true);
  await expect.poll(() => board.inReadingRoom(card.element())).toBe(true);
  expect(terminal.element()).toBe(screen);
  await expect.element(entry).toHaveAttribute("aria-current", "true");
});
