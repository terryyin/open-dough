import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import {
  execution,
  mountSessionCards,
  sessionsReading,
  workingSession,
} from "./session-card-mount.ts";
import { cardSession, recentExecution } from "./session-card-page.ts";

test("a refused mark keeps the session on its card and says so on its entry", async () => {
  const working = workingSession(execution);
  const markDone = vi.fn<MachineReadSource["markDone"]>(() =>
    Promise.resolve({ kind: "refused" }),
  );
  await mountSessionCards({
    reading: sessionsReading("working", working),
    markDone,
  });
  const session = cardSession();
  await expect.element(session.entry).toBeVisible();
  await expect.element(recentExecution).not.toBeInTheDocument();

  const confirmDone = await session.askToMarkDone();
  await userEvent.click(confirmDone);

  await expect
    .element(session.status)
    .toHaveTextContent("The session could not be marked done.");
  await expect.element(session.entry).toBeVisible();
  await expect.element(recentExecution).not.toBeInTheDocument();
  await expect.element(session.done).toBeEnabled();
  expect(markDone).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ session: execution.session }),
  );
});
