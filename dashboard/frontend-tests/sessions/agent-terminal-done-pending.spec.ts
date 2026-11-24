import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import {
  execution,
  holdExecutionMark,
  mountSessionCards,
  sessionsReading,
  workingSession,
} from "./session-card-mount.ts";
import { cardSession } from "./session-card-page.ts";
import {
  markWorkingTerminalDone,
  openCardTerminal,
  terminal,
  terminalClose,
  terminalMarkDone,
  terminalMaximize,
  terminalRestore,
  terminalStatus,
} from "./session-terminal-page.ts";
import { openAttachedTerminal } from "./session-terminal-socket.ts";

async function openWorkingSession(markDone: MachineReadSource["markDone"]) {
  await mountSessionCards({
    reading: sessionsReading("working", workingSession(execution)),
    markDone,
    openTerminal: openAttachedTerminal,
  });
  await openCardTerminal();
}

test.describe("pending Mark as done from the terminal", () => {
  test("Maximize and Close stay usable while Done is held, and releasing still closes the panel", async () => {
    const mark = holdExecutionMark();
    await openWorkingSession(() => mark.answer);
    await markWorkingTerminalDone();
    const marking = terminalStatus.getByText("Marking as done…");
    await expect.element(marking).toBeVisible();
    await expect.element(terminalMarkDone).toBeDisabled();

    await userEvent.click(terminalMaximize);
    await expect.element(terminalRestore).toBeVisible();
    await expect.element(terminalClose).toBeEnabled();
    await expect.element(marking).toBeVisible();
    await expect.element(terminalMarkDone).toBeDisabled();

    mark.release();
    await expect.element(terminal).not.toBeInTheDocument();
    await expect.element(cardSession().entry).not.toBeInTheDocument();
  });

  test("a failed Done answer leaves the same recoverable unresolved state without claiming the mark failed", async () => {
    const markDone = vi.fn<MachineReadSource["markDone"]>();
    markDone.mockResolvedValue({ kind: "unresolved" });
    await openWorkingSession(markDone);
    await markWorkingTerminalDone();

    const retry = terminalStatus.getByText(
      "Mark as done did not finish. Try again.",
    );
    await expect.element(retry).toBeVisible();
    await expect
      .element(
        terminalStatus.getByText("The session could not be marked done."),
      )
      .not.toBeInTheDocument();
    await expect.element(terminalMarkDone).toBeEnabled();
    await expect.element(terminal).toBeVisible();
    await expect.element(terminalMaximize).toBeEnabled();
    await expect.element(terminalClose).toBeEnabled();
    expect(markDone).toHaveBeenCalledTimes(1);
  });
});
