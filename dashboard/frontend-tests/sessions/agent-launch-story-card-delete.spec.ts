import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import {
  execution,
  mountSessionCards,
  otherStory,
  readyStory,
  sessionsReading,
  unknown,
} from "./session-card-mount.ts";
import {
  card,
  cardSession,
  expectDeletedSession,
  namedCard,
  sidebar,
  sidebarButton,
} from "./session-card-page.ts";

const unknownState =
  "State unknown: Claude Code's session list could not be read";

test("Delete record… on a State unknown entry asks first, Keep and Escape delete nothing, and confirming removes the entry everywhere and moves the keyboard", async () => {
  const deleteRecord = vi.fn<MachineReadSource["deleteRecord"]>(() =>
    Promise.resolve({ kind: "deleted" }),
  );
  await mountSessionCards({
    reading: sessionsReading("unknown", unknown),
    deleteRecord,
  });
  const session = cardSession();
  await userEvent.click(sidebarButton);
  await expect
    .element(sidebar.getByRole("heading", { name: readyStory.title }))
    .toBeVisible();
  await expect.element(session.state).toHaveTextContent(unknownState);
  expect(card.element().querySelector(".story-card-attention")).toBeNull();

  const topInBoard = () => {
    const element = card.element();
    return (
      element.getBoundingClientRect().top +
      (element.closest(".board-scroll")?.scrollTop ?? 0)
    );
  };
  const top = topInBoard();
  await session.askToDelete();
  await expect.element(session.confirm).toBeEnabled();
  await expect.element(session.keep).toHaveFocus();
  await expect.element(session.remove).not.toBeInTheDocument();
  await expect.element(session.state).toHaveTextContent(unknownState);
  await expect.element(session.open).toBeVisible();
  expect(topInBoard()).toBe(top);

  await userEvent.click(session.keep);
  await expect.element(session.remove).toHaveFocus();
  await expect.element(session.question).not.toBeInTheDocument();
  expect(deleteRecord).not.toHaveBeenCalled();

  await session.askToDelete();
  await expect.element(session.keep).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.element(session.remove).toHaveFocus();
  await expect.element(session.question).not.toBeInTheDocument();
  expect(deleteRecord).not.toHaveBeenCalled();

  await session.askToDelete();
  await userEvent.click(session.confirm);
  await expectDeletedSession();
  await expect.element(card).toHaveFocus();
  expect(deleteRecord).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ session: unknown.session }),
  );
  const backlog = page.getByRole("region", { name: "Backlog", exact: true });
  for (const { title } of [readyStory, otherStory]) {
    await expect
      .element(backlog.getByRole("article", { name: title }))
      .toBeVisible();
  }
  await expect
    .element(
      page
        .getByRole("region", { name: "Taken" })
        .getByRole("article", { name: "Repair the installer's update report" }),
    )
    .toBeVisible();
});

test("a Session unavailable entry offers Delete record…, asks, and confirming removes it from its card, Recently done and the sidebar", async () => {
  const unavailable = makeMe.anObservedLaunch
    .of(execution)
    .withSessionState(makeMe.aSessionState.unavailable().please())
    .please();
  await mountSessionCards({
    reading: sessionsReading("unavailable", unavailable),
    deleteRecord: () => Promise.resolve({ kind: "deleted" }),
  });
  await userEvent.click(sidebarButton);
  await expect
    .element(sidebar.getByRole("heading", { name: readyStory.title }))
    .toBeVisible();
  const session = cardSession();
  await expect.element(session.state).toHaveTextContent("Session unavailable");
  await session.askToDelete();
  await expect.element(session.keep).toHaveFocus();
  await userEvent.click(session.confirm);
  await expectDeletedSession();
});

test("a Working or Needs input entry offers no Delete record…", async () => {
  const refining = makeMe.aLaunchRecord.refining(readyStory).please();
  const working = makeMe.aLaunchRecord.executing(otherStory).please();
  await mountSessionCards({
    reading: sessionsReading(
      "active",
      makeMe.anObservedLaunch
        .of(refining)
        .withSessionState(makeMe.aSessionState.loaded("waiting").please())
        .please(),
      makeMe.anObservedLaunch
        .of(working)
        .withSessionState(makeMe.aSessionState.loaded("working").please())
        .please(),
    ),
  });
  const blocked = cardSession(card, "Refinement session");
  const active = cardSession(namedCard(otherStory.title));
  for (const [session, state] of [
    [blocked, "Needs input"],
    [active, "Working"],
  ] as const) {
    await expect.element(session.state).toHaveTextContent(state);
    await userEvent.click(session.actions);
    await expect.element(session.done).toBeVisible();
    await expect.element(session.remove).not.toBeInTheDocument();
  }
});
