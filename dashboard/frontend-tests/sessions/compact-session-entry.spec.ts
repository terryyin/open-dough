import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  mountSessionCards,
  readyStory,
  revealPage,
  sessionsReading,
  workingSession,
} from "./session-card-mount.ts";
import { card, cardSession, recentExecution } from "./session-card-page.ts";
import { terminal, terminalClose } from "./session-terminal-page.ts";
import { terminalSocket } from "./session-terminal-socket.ts";

test("a compact session discloses technical details and secondary actions without hiding attention or terminal access", async () => {
  const launch = makeMe.aLaunchRecord
    .executing(readyStory)
    .requestingModel("sonnet")
    .requestingEffort("medium");
  const record = launch.please();
  const done = makeMe.anObservedLaunch
    .of(launch.markedDone().please())
    .withSessionState(makeMe.aSessionState.retained("review").please())
    .please();
  const machine = await mountSessionCards({
    reading: sessionsReading("empty"),
    markDone: () => Promise.resolve({ kind: "marked", record: done }),
    openTerminal: () => terminalSocket("attached to execution").socket,
  });
  const ready = card.getByText("Ready for execution", { exact: true });
  const inspect = card.getByRole("button", {
    name: "Inspect story",
    exact: true,
  });
  const assessment = card.getByText(/^Assessment: Ready/);
  await expect.element(ready).toBeVisible();
  const revealWork = revealPage();
  machine.answerWith(sessionsReading("working", workingSession(record)));
  revealWork();

  const session = cardSession();
  const id = session.entry.getByText(record.session.sessionId, { exact: true });
  const effort = session.entry.getByText("Effort: medium (requested)", {
    exact: true,
  });
  await expect.element(session.state).toHaveTextContent("Working");
  await expect
    .element(session.details)
    .toHaveAttribute("aria-expanded", "false");
  await expect.element(id).not.toBeVisible();
  await expect.element(effort).not.toBeVisible();
  await expect
    .element(
      session.entry.getByText("Model: Sonnet (requested)", { exact: true }),
    )
    .toBeVisible();
  await expect
    .element(session.entry.getByText("Claude Code", { exact: true }))
    .toBeVisible();
  await expect.element(ready).not.toBeInTheDocument();
  await userEvent.click(inspect);
  await expect.element(assessment).toBeVisible();
  await userEvent.click(card.getByRole("button", { name: "Hide detail" }));
  await expect.element(session.open).toBeVisible();
  await expect.element(session.done).not.toBeInTheDocument();

  session.details.element().focus();
  await userEvent.keyboard("{Enter}");
  await expect
    .element(session.details)
    .toHaveAttribute("aria-expanded", "true");
  await expect.element(id).toBeVisible();
  await expect.element(effort).toBeVisible();
  await userEvent.keyboard(" ");
  await expect
    .element(session.details)
    .toHaveAttribute("aria-expanded", "false");
  await expect.element(session.details).toHaveFocus();

  await userEvent.click(session.open);
  await expect
    .element(terminal.getByText("attached to execution", { exact: true }))
    .toBeVisible();
  await userEvent.click(terminalClose);
  await expect.element(session.open).toHaveFocus();

  session.actions.element().focus();
  await userEvent.keyboard("{Enter}");
  await expect
    .element(session.actions)
    .toHaveAttribute("aria-expanded", "true");
  await userEvent.keyboard("{Escape}");
  await expect
    .element(session.actions)
    .toHaveAttribute("aria-expanded", "false");
  await expect.element(session.actions).toHaveFocus();
  await userEvent.keyboard(" ");
  await session.askToMarkDone();
  await userEvent.keyboard("{Escape}");
  await expect.element(session.done).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect
    .element(session.actions)
    .toHaveAttribute("aria-expanded", "false");
  await expect.element(session.actions).toHaveFocus();

  const waiting = makeMe.anObservedLaunch
    .of(record)
    .withSessionState(
      makeMe.aSessionState
        .loaded("waiting")
        .waitingFor("Review the migration before continuing.")
        .please(),
    )
    .please();
  const revealWaiting = revealPage();
  machine.answerWith(sessionsReading("waiting", waiting));
  revealWaiting();
  await expect
    .element(session.state)
    .toHaveTextContent("Needs input: Review the migration before continuing.");
  await expect
    .element(session.details)
    .toHaveAttribute("aria-expanded", "false");
  await expect.element(session.open).toBeVisible();
  await page.viewport(360, 800);
  await userEvent.click(session.details);
  await expect.element(id).toBeVisible();
  expect(
    session.entry.element().getBoundingClientRect().width,
  ).toBeLessThanOrEqual(360);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(360);

  await expect.element(recentExecution).not.toBeInTheDocument();
  const confirmDone = await session.askToMarkDone();
  await userEvent.click(confirmDone);
  await expect
    .poll(() => card.element().querySelector(".story-card-sessions"))
    .toBeNull();
  await expect.element(ready).toBeVisible();
  inspect.element().focus();
  await userEvent.click(inspect);
  await expect.element(assessment).toBeVisible();
});
