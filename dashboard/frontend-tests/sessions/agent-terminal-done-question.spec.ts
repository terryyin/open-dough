import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import { boardWork } from "../navigation/board-work.ts";
import {
  execution,
  markedExecution,
  mountSessionCards,
  revealPage,
  sessionsReading,
  workingSession,
} from "./session-card-mount.ts";
import { cardSession } from "./session-card-page.ts";
import {
  markWorkingTerminalDone,
  openCardTerminal,
  terminal,
} from "./session-terminal-page.ts";
import { openAttachedTerminal } from "./session-terminal-socket.ts";

test.describe("Mark as done in the terminal asks by the session's current reading", () => {
  test("Mark as done from the panel while another project is shown, where the session has no entry, closes the panel", async () => {
    const markDone = vi.fn<MachineReadSource["markDone"]>();
    markDone.mockResolvedValue(markedExecution());
    const doughnut = boardWork([], {
      id: "doughnut",
      label: "Doughnut",
      taken: [],
    });
    await mountSessionCards({
      reading: sessionsReading("working", workingSession(execution)),
      markDone,
      openTerminal: openAttachedTerminal,
      otherProjects: [doughnut],
    });
    await page.viewport(1440, 900);
    await openCardTerminal();
    const anotherProject = page.getByRole("radio", {
      name: "Doughnut",
      exact: true,
    });
    await userEvent.click(anotherProject);
    await expect.element(anotherProject).toBeChecked();
    await expect.element(cardSession().entry).not.toBeInTheDocument();

    await markWorkingTerminalDone();

    await expect.element(terminal).not.toBeInTheDocument();
    expect(markDone).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ session: execution.session }),
    );
  });

  test("a session opened while Ready for review that then reads Working is asked about as working", async () => {
    const review = makeMe.anObservedLaunch
      .of(execution)
      .withSessionState(makeMe.aSessionState.loaded("review").please())
      .please();
    const machine = await mountSessionCards({
      reading: sessionsReading("review", review),
      markDone: () => Promise.resolve(markedExecution()),
      openTerminal: openAttachedTerminal,
    });
    await expect
      .element(
        cardSession().entry.getByText("Ready for review", { exact: true }),
      )
      .toBeVisible();
    await openCardTerminal();

    const revealWorking = revealPage();
    machine.answerWith(sessionsReading("working", workingSession(execution)));
    revealWorking();
    await expect.element(cardSession().state).toHaveTextContent("Working");

    await markWorkingTerminalDone();

    await expect.element(terminal).not.toBeInTheDocument();
    await expect.element(cardSession().entry).not.toBeInTheDocument();
  });
});
