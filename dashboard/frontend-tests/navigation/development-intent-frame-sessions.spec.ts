import { expect, onTestFinished, test, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { noSessions } from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import {
  answerTerminal,
  backlogCard,
  machineWorking,
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
  project,
  pygardonStory,
  showsUnconfiguredIntent,
} from "./development-intent-frame-page.ts";
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
  await mountPerspectiveFrame(
    { width: 1440, height: 900 },
    {
      sessions: {
        ...noSessions,
        ...machineWorking(openRecord(openDoughStory), pygardonSession),
      },
    },
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
  const compactProject = page.getByRole("button", {
    name: "Project",
    exact: true,
  });
  await expect
    .poll(() => {
      const compact = compactProject.query();
      const tab = project("Pygardon").query();
      return (
        compact?.textContent.trim() === "Pygardon" ||
        (tab instanceof HTMLInputElement && tab.checked)
      );
    })
    .toBe(true);
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
      intent.getByText(/^No intent locations are configured for Pygardon\./),
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
