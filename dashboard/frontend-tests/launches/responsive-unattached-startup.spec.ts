import { createElement } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type {
  AttemptObservation,
  MachineAnswer,
} from "../../src/agentLaunch.ts";
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
const admissionProgress =
  "Starting a session in Open Dough… Admitting a story.";

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

async function mountStartSession(running: AttemptObservation) {
  const source = {
    accept: vi.fn<LaunchAttemptSource["accept"]>().mockResolvedValue({
      kind: "accepted",
      attempt: running,
    }),
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
  return {
    source,
    presentTerminal,
    answer: (machine: MachineAnswer, answeredAsk: number) => {
      rerender(view(machine, answeredAsk));
    },
  };
}

async function startWith(typed?: string) {
  const instruction = typed?.trim() || undefined;
  await emulateMedia([{ name: "prefers-reduced-motion", value: "reduce" }]);
  const accepted = makeMe.anAcceptedAttempt.adHoc(
    instruction === undefined ? {} : { instruction },
  );
  const running = makeMe.anAttemptObservation
    .of(accepted.please())
    .owned(true)
    .running(true)
    .please();
  const { source, presentTerminal, answer } = await mountStartSession(running);
  const button = startSession(project.label);
  await expect.element(button).toBeEnabled();
  button.element().focus();
  await userEvent.keyboard("{Enter}");
  const form = launchDialog("Start a session in Open Dough in Claude Code");
  await expect.element(form.instruction).toHaveFocus();
  if (typed !== undefined) await userEvent.keyboard(typed);
  await expect.element(form.start).toBeEnabled();
  form.start.element().focus();
  await userEvent.keyboard("{Enter}");

  const progress = page.getByText(admissionProgress, { exact: true });
  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect.element(progress).toHaveFocus();
  await expect.element(button).toBeDisabled();
  await expect.element(button).toHaveAccessibleDescription(admissionProgress);
  expect(source.accept).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      workflow: "ad-hoc",
      host: "claude",
      ...(instruction === undefined ? {} : { instruction }),
    }),
    false,
  );
  if (instruction === undefined)
    expect(source.accept.mock.calls[0]?.[0]).not.toHaveProperty("instruction");
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
  answer(machine, 1);
  await expect.element(button).toBeEnabled();
  await expect.element(progress).not.toBeInTheDocument();
  await expect.element(task).toHaveFocus();
  await expect
    .element(page.getByText("Ad hoc session started", { exact: true }))
    .not.toBeInTheDocument();
  return { presentTerminal, button, record };
}

test.each([
  { start: "a blank", typed: undefined },
  { start: "a whitespace-only", typed: "   " },
])(
  "$start keyboard start sends no instruction and presents its terminal without taking focus from another task",
  async ({ typed }) => {
    const { presentTerminal, button, record } = await startWith(typed);
    expect(presentTerminal).toHaveBeenCalledTimes(1);
    const [presentation] = presentTerminal.mock.calls[0] ?? [];
    expect(presentation?.record.session).toEqual(record.session);
    expect(presentation?.control).toBe(button.element());
    expect(presentation?.takesKeyboard).toBe(false);
  },
);

test("an instructed keyboard start leaves the terminal closed and keeps the other task focused", async () => {
  const { presentTerminal } = await startWith("why is CI slow?");
  expect(presentTerminal).not.toHaveBeenCalled();
});

test("a refused default admission lets Start repeat the same request and present the retried attempt", async () => {
  const attempt = makeMe.anAcceptedAttempt.requesting({
    source: project.id,
    workflow: "ad-hoc",
    host: "claude",
    effort: "medium",
  });
  const observation = makeMe.anAttemptObservation.owned(true);
  const running = observation.of(attempt.please()).running(true).please();
  const { source, presentTerminal, answer } = await mountStartSession(running);
  const launcher = startSession(project.label);
  const form = launchDialog("Start a session in Open Dough in Claude Code");
  const progress = page.getByText(admissionProgress, { exact: true });

  await launcher.click();
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect.element(progress).toHaveFocus();
  await expect.element(launcher).toBeDisabled();

  const explanation =
    "Origin refused the story admission. Continue or send the same Start request to retry.";
  const failed = attempt
    .ended({ kind: "failed", reason: "start-refused", explanation })
    .please();
  const refusal = observation.of(failed).running(false).please();
  answer(makeMe.aMachineAnswer.answeringAttempts(refusal).please(), 1);
  await expect
    .element(launcher)
    .toHaveAccessibleDescription(`Launch failed: ${explanation}`);
  await expect.element(launcher).toHaveFocus();
  expect(presentTerminal).not.toHaveBeenCalled();

  await launcher.click();
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect.element(progress).toHaveFocus();
  expect(source.accept.mock.calls).toEqual([
    [running.request, false],
    [running.request, false],
  ]);

  const resumed = observation
    .of(running)
    .running(true)
    .afterChanges(2)
    .please();
  answer(makeMe.aMachineAnswer.answeringAttempts(resumed).please(), 2);
  await expect
    .poll(() => source.waitForChange.mock.calls.map(([read]) => read))
    .toContainEqual({ id: running.id, changes: 2 });
  const record = makeMe.aLaunchRecord.adHoc({ title: "Ad hoc work" }).please();
  const launched = observation
    .of(attempt.launched(record.session).please())
    .running(false)
    .please();
  const machine = makeMe.aMachineAnswer
    .answeringAttempts(launched)
    .observingOpen(record)
    .please();
  answer(machine, 3);
  await expect.element(launcher).toBeEnabled();
  await expect.element(progress).not.toBeInTheDocument();
  expect(presentTerminal).toHaveBeenCalledOnce();
  const [shown] = presentTerminal.mock.calls[0] ?? [];
  expect(shown?.record.session).toEqual(record.session);
  expect(shown?.control).toBe(launcher.element());
  expect(shown?.takesKeyboard).toBe(true);
});
