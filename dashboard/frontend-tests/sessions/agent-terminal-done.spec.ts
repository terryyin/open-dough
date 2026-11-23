import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  execution,
  holdExecutionMark,
  mountSessionCards,
  otherStory,
  sessionsReading,
  workingSession,
} from "./session-card-mount.ts";
import { cardSession, namedCard } from "./session-card-page.ts";
import {
  markWorkingTerminalDone,
  openCardTerminal,
  terminal,
  terminalInput,
  terminalMarkDone,
  terminalStatus,
} from "./session-terminal-page.ts";
import {
  openAttachedTerminal,
  terminalSocket,
} from "./session-terminal-socket.ts";

function problemColour() {
  const sample = document.body.appendChild(document.createElement("span"));
  sample.style.color = "var(--problem)";
  const colour = getComputedStyle(sample).color;
  sample.remove();
  return colour;
}

test("a refused mark keeps the panel open and says so as a problem, as an ended terminal does", async () => {
  let endTerminal: () => void = () => {
    throw new Error("The execution terminal was not opened.");
  };
  await mountSessionCards({
    reading: sessionsReading("working", workingSession(execution)),
    markDone: () => Promise.resolve({ kind: "refused" }),
    openTerminal: () => {
      const connection = terminalSocket("attached execution");
      endTerminal = connection.end;
      return connection.socket;
    },
  });
  await openCardTerminal();
  await markWorkingTerminalDone();

  const refused = terminalStatus.getByText(
    "The session could not be marked done.",
  );
  await expect.element(refused).toBeVisible();
  expect(getComputedStyle(refused.element()).color).toBe(problemColour());
  await expect.element(terminal).toBeVisible();
  await expect.element(terminalMarkDone).toBeEnabled();

  endTerminal();
  const ended = terminalStatus.getByText("The terminal ended");
  await expect.element(ended).toBeVisible();
  expect(getComputedStyle(ended.element()).color).toBe(problemColour());
  await expect
    .element(terminalStatus.getByRole("button", { name: "Open again" }))
    .toBeEnabled();
});

test("a mark answered after another session replaced the panel leaves the keyboard in the new terminal", async () => {
  const refinement = makeMe.aLaunchRecord.refining(otherStory).please();
  const mark = holdExecutionMark();
  await mountSessionCards({
    reading: sessionsReading(
      "working",
      workingSession(execution),
      workingSession(refinement),
    ),
    markDone: () => mark.answer,
    openTerminal: openAttachedTerminal,
  });
  await openCardTerminal();
  await markWorkingTerminalDone();
  await expect.element(terminalStatus).toHaveTextContent("Marking as done…");

  await openCardTerminal(
    cardSession(namedCard(otherStory.title), "Refinement session"),
  );
  const refinementPanel = terminal.getByText("Refinement session", {
    exact: true,
  });
  await expect.element(refinementPanel).toBeVisible();
  mark.release();

  await expect.element(cardSession().entry).not.toBeInTheDocument();
  await expect.element(refinementPanel).toBeVisible();
  await expect.element(terminalInput).toHaveFocus();
});
