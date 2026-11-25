import { createElement } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import type { LaunchAttemptSource } from "../../src/launchAttempts.ts";
import type { OpenTerminal } from "../../src/pageSessions.ts";
import { StartSession } from "../../src/StartSession.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { emulateMedia } from "../review/browser-session.ts";
import {
  adHocLaunches,
  launchDialog,
  startSession,
} from "./ad-hoc-launch-page.ts";
import { useMountedLaunchAttempts } from "./mounted-launch-attempts.ts";

const project = makeMe.aPublishedSource.openDough.please();
const otherTask = "Keep reading the backlog";

function StartSessionOnPage({
  machine,
  source,
  answeredAsk,
  presentTerminal,
}: {
  machine: MachineAnswer;
  source: LaunchAttemptSource;
  answeredAsk: number;
  presentTerminal: OpenTerminal;
}) {
  const { adHocAttemptOf, startAdHoc } = useMountedLaunchAttempts(
    machine,
    source,
    answeredAsk,
  );
  const { sessionPolicyOffer, rereadOffers } = adHocLaunches();
  return createElement(
    "main",
    null,
    createElement(StartSession, {
      project: project.label,
      sourceId: project.id,
      launches: {
        adHocAttemptOf,
        startAdHoc,
        sessionPolicyOffer,
        rereadOffers,
      },
      presentTerminal,
    }),
    createElement("button", { type: "button" }, otherTask),
  );
}

async function startWith(instruction?: string) {
  await emulateMedia([{ name: "prefers-reduced-motion", value: "reduce" }]);
  const accepted = makeMe.anAcceptedAttempt.adHoc(
    instruction === undefined ? {} : { instruction },
  );
  const running = makeMe.anAttemptObservation
    .of(accepted.please())
    .owned(true)
    .running(true)
    .please();
  const accept = vi
    .fn<LaunchAttemptSource["accept"]>()
    .mockResolvedValue({ kind: "accepted", attempt: running });
  const source = {
    accept,
    waitForChange: vi
      .fn<LaunchAttemptSource["waitForChange"]>()
      .mockResolvedValue(undefined),
  };
  const presentTerminal = vi.fn<OpenTerminal>();
  const view = (machine: MachineAnswer, answeredAsk: number) =>
    createElement(StartSessionOnPage, {
      machine,
      source,
      answeredAsk,
      presentTerminal,
    });
  const { rerender } = await mountComponent(
    view(makeMe.aMachineAnswer.please(), 0),
  );
  const button = startSession(project.label);
  await expect.element(button).toBeEnabled();
  button.element().focus();
  await userEvent.keyboard("{Enter}");
  const form = launchDialog("Start a session in Open Dough in Claude Code");
  await expect.element(form.instruction).toHaveFocus();
  if (instruction !== undefined) await userEvent.keyboard(instruction);
  await expect.element(form.start).toBeEnabled();
  form.start.element().focus();
  await userEvent.keyboard("{Enter}");

  const words = "Starting a session in Open Dough… Admitting a story.";
  const progress = page.getByText(words, { exact: true });
  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect.element(progress).toHaveFocus();
  await expect.element(button).toBeDisabled();
  await expect.element(button).toHaveAccessibleDescription(words);
  expect(accept).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      workflow: "ad-hoc",
      host: "claude",
      ...(instruction === undefined ? {} : { instruction }),
    }),
    false,
  );
  expect(presentTerminal).not.toHaveBeenCalled();

  const task = page.getByRole("button", { name: otherTask });
  await expect.element(task).toBeEnabled();
  task.element().focus();
  const record = makeMe.aLaunchRecord
    .adHoc({
      title: "Open Dough · Ad hoc",
      ...(instruction === undefined ? {} : { instruction }),
    })
    .please();
  const ended = makeMe.anAttemptObservation
    .of(accepted.launched(record.session).please())
    .owned(true)
    .running(false)
    .please();
  const machine = makeMe.aMachineAnswer
    .answeringAttempts(ended)
    .observingOpen(record)
    .please();
  rerender(view(machine, 1));
  await expect.element(button).toBeEnabled();
  await expect.element(progress).not.toBeInTheDocument();
  await expect.element(task).toHaveFocus();
  await expect
    .element(page.getByText("Ad hoc session started", { exact: true }))
    .not.toBeInTheDocument();
  return { presentTerminal, button, record };
}

test("a blank keyboard start presents its terminal without taking focus from another task", async () => {
  const { presentTerminal, button, record } = await startWith();
  expect(presentTerminal).toHaveBeenCalledTimes(1);
  const [presentation] = presentTerminal.mock.calls[0] ?? [];
  expect(presentation?.record.session).toEqual(record.session);
  expect(presentation?.control).toBe(button.element());
  expect(presentation?.takesKeyboard).toBe(false);
});

test("an instructed keyboard start leaves the terminal closed and keeps the other task focused", async () => {
  const { presentTerminal } = await startWith("why is CI slow?");
  expect(presentTerminal).not.toHaveBeenCalled();
});
