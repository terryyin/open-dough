import { expect, onTestFinished, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import type { MachineSessionsRead } from "../../src/machineSessionsRevision.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import {
  execution,
  mountSessionCards,
  otherStory,
  readyStory,
  revealPage,
  sessionsReading,
  unknown,
  workingSession,
} from "./session-card-mount.ts";
import {
  card,
  cardSession,
  expectDeletedSession,
  namedCard,
  recentExecution,
  sidebar,
  sidebarButton,
} from "./session-card-page.ts";

const working = workingSession(execution);

async function unknownSession(deleteRecord: MachineReadSource["deleteRecord"]) {
  const machine = await mountSessionCards({
    reading: sessionsReading("unknown", unknown),
    deleteRecord,
  });
  const session = cardSession();
  await expect
    .element(session.state)
    .toHaveTextContent(
      "State unknown: Claude Code's session list could not be read",
    );
  return { machine, session };
}

async function expectKnownSession() {
  const session = cardSession();
  await expect.element(session.state).toHaveTextContent("Working");
  await expect.element(session.question).not.toBeInTheDocument();
  await expect.element(session.remove).not.toBeInTheDocument();
  await expect.element(session.confirm).not.toBeInTheDocument();
}

test("the question and Delete record… go when a later read lists the session as known, deleting nothing", async () => {
  const deleteRecord = vi.fn<MachineReadSource["deleteRecord"]>();
  const { machine, session } = await unknownSession(deleteRecord);
  await session.askToDelete();
  const reveal = revealPage();
  machine.answerWith(sessionsReading("working", working));
  reveal();
  await expectKnownSession();
  expect(deleteRecord).not.toHaveBeenCalled();
});

test("a click that finds the state known keeps the record and says so beside the state", async () => {
  const { session } = await unknownSession(() =>
    Promise.resolve({ kind: "state-known", record: working }),
  );
  await session.askToDelete();
  await userEvent.click(session.confirm);
  await expect
    .element(session.status)
    .toHaveTextContent("This session's state is now known");
  await expectKnownSession();
  await expect.element(recentExecution).not.toBeInTheDocument();
});

test("a refused delete reports its first failure in the persistent card entry status, retains buttons and focus, and retries without success speech", async () => {
  const reason = "EACCES: permission denied, unlink 'launches.json'";
  const deleteRecord = vi
    .fn<MachineReadSource["deleteRecord"]>()
    .mockResolvedValueOnce({ kind: "failed", reason })
    .mockResolvedValueOnce({ kind: "deleted" });
  const { session } = await unknownSession(deleteRecord);
  await expect.element(session.status).toBeEmptyDOMElement();
  const initialStatus = session.status.element();
  for (let at: Element | null = initialStatus; at; at = at.parentElement) {
    const style = getComputedStyle(at);
    expect(style.display).not.toBe("none");
    expect(style.visibility).toBe("visible");
    expect(at.hasAttribute("hidden")).toBe(false);
    expect(at.getAttribute("aria-hidden")).not.toBe("true");
  }
  await session.askToDelete();

  await userEvent.click(session.confirm);
  await expect
    .element(session.status)
    .toHaveTextContent(`The session record could not be deleted. ${reason}`);
  expect(session.status.element()).toBe(initialStatus);
  await expect.element(session.status).toBeVisible();
  await expect.element(session.question).toBeVisible();
  await expect.element(session.confirm).toBeEnabled();
  await expect.element(session.keep).toBeEnabled();
  await expect.element(session.confirm).toHaveFocus();
  await expect.element(session.entry).toBeVisible();
  await expect.element(recentExecution).not.toBeInTheDocument();

  await userEvent.click(session.confirm);
  await expectDeletedSession();
  await expect.element(card).toHaveFocus();
  expect(deleteRecord).toHaveBeenCalledTimes(2);
});

test("a read asked before the deletion and answered after it does not bring the entry back", async () => {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const { machine, session } = await unknownSession(() =>
    Promise.resolve({ kind: "deleted" }),
  );
  await userEvent.click(sidebarButton);
  await expect
    .element(sidebar.getByRole("heading", { name: readyStory.title }))
    .toBeVisible();
  let answerLate: (answer: MachineSessionsRead) => void = () => {
    throw new Error("No machine read is held.");
  };
  const held = new Promise<MachineSessionsRead>((resolve) => {
    answerLate = resolve;
  });
  machine.answerWith(held);
  await vi.advanceTimersByTimeAsync(checkIntervalMs);
  await expect
    .poll(() => machine.readSessionsSince.mock.calls.length)
    .toBeGreaterThan(1);
  await vi.advanceTimersByTimeAsync(1);

  await session.askToDelete();
  await userEvent.click(session.confirm);
  await expectDeletedSession();

  const otherLaunch = makeMe.aLaunchRecord.executing(otherStory).please();
  const otherRunning = workingSession(otherLaunch);
  answerLate(sessionsReading("stale", unknown, otherRunning));
  await expect
    .element(cardSession(namedCard(otherStory.title)).state)
    .toHaveTextContent("Working");
  await expectDeletedSession();
});
