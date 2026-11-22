import { expect, test } from "vitest";
import type { Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type {
  AgentLaunchRequest,
  LaunchAttemptRecord,
  LaunchWorkflow,
} from "../../src/agentLaunch.ts";
import { launchDialog } from "./ad-hoc-launch-page.ts";
import { box } from "./launch-layout-page.ts";
import { mountStoryStartup } from "./story-startup-page.ts";

const story = () =>
  makeMe.aWorkEntry
    .with({
      identity: "SEED-B#b",
      title: "Read launch results",
      dependencies: { status: "not-recorded", entries: [], blocking: [] },
      preparation: {
        status: "recorded",
        refinement: "refined",
        approach: { kind: "planless" },
        assessment: { status: "ready", changedSinceReview: false, reasons: [] },
      },
    })
    .please();

function running(attempt: LaunchAttemptRecord) {
  return makeMe.anAttemptObservation
    .of(attempt)
    .owned(true)
    .running(true)
    .please();
}

const runAccepted = (request: AgentLaunchRequest) =>
  Promise.resolve({
    kind: "accepted" as const,
    attempt: running(makeMe.anAcceptedAttempt.requesting(request).please()),
  });

async function submit(action: Locator) {
  await action.click();
  const form = launchDialog();
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
}

test("accepted execution without an establishing skill says Starting execution in Claude Code", async () => {
  const { accept, card, execution } = await mountStoryStartup(story());
  accept.mockImplementationOnce(runAccepted);
  await submit(execution);
  await expect
    .element(
      card.getByText("Starting execution in Claude Code…", { exact: true }),
    )
    .toBeVisible();
  await expect.element(execution).toBeDisabled();
  expect(accept).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ workflow: "execution" }),
    false,
  );
});

test("accepted execution with an establishing skill says Preparing until the attempt settles", async () => {
  const entry = story();
  const read = makeMe.aMachineAnswer.establishing({
    source: "open-dough",
    workflow: "execution",
    host: "claude",
  });
  const attempt = makeMe.anAcceptedAttempt.executing(entry);
  const {
    accept,
    card,
    execution,
    read: answerRead,
  } = await mountStoryStartup(entry, { machine: read.please() });
  accept.mockResolvedValueOnce({
    kind: "accepted",
    attempt: running(attempt.please()),
  });
  await submit(execution);
  const preparing = card.getByText("Preparing execution…", { exact: true });
  await expect.element(preparing).toBeVisible();
  await expect.element(execution).toBeDisabled();
  const outcome = {
    kind: "failed",
    reason: "start-refused",
    explanation: "The installed start answered nothing it could use.",
  } as const;
  answerRead(
    read
      .answeringAttempts(
        makeMe.anAttemptObservation
          .of(attempt.ended(outcome).please())
          .owned(true)
          .running(false)
          .please(),
      )
      .please(),
  );
  await expect.element(preparing).not.toBeInTheDocument();
});

test("accepted refinement without an establishing skill says Starting refinement in Claude Code", async () => {
  const { accept, card, refinement } = await mountStoryStartup(story());
  accept.mockImplementationOnce(runAccepted);
  await submit(refinement);
  await expect
    .element(
      card.getByText("Starting refinement in Claude Code…", { exact: true }),
    )
    .toBeVisible();
  expect(accept).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ workflow: "refinement" }),
    false,
  );
});

const missingFolder =
  "The project folder ~/git/open-dough was not found on this machine. Nothing was launched.";

test("a missing folder explanation stays below Start execution and focus returns to that offer", async () => {
  const { accept, card, execution, refinement } =
    await mountStoryStartup(story());
  accept.mockResolvedValueOnce({ kind: "failed", explanation: missingFolder });
  await submit(execution);
  const answer = card.getByText(`Launch failed: ${missingFolder}`, {
    exact: true,
  });
  await expect.element(answer).toBeVisible();
  await expect.element(execution).toBeEnabled();
  await expect.element(execution).toHaveFocus();
  await expect
    .element(execution)
    .toHaveAccessibleDescription(`Launch failed: ${missingFolder}`);
  expect(box(execution).bottom).toBeLessThanOrEqual(box(answer).top);
  expect(box(answer).bottom).toBeLessThanOrEqual(box(refinement).top);
  await expect
    .element(card.getByRole("list", { name: "Sessions" }))
    .not.toBeInTheDocument();
});

test("a refinement refusal describes Start refinement alone and sits below both desktop offers", async () => {
  const { accept, card, actions, execution, refinement } =
    await mountStoryStartup(story());
  accept.mockResolvedValueOnce({ kind: "failed", explanation: missingFolder });
  await submit(refinement);
  const answer = card.getByText(`Launch failed: ${missingFolder}`, {
    exact: true,
  });
  await expect.element(answer).toBeVisible();
  await expect.element(refinement).toHaveFocus();
  await expect
    .element(refinement)
    .toHaveAccessibleDescription(`Launch failed: ${missingFolder}`);
  await expect.element(execution).toBeEnabled();
  await expect.element(execution).toHaveAccessibleDescription("");
  expect(actions.element().querySelectorAll(".launch-answer")).toHaveLength(1);
  expect(box(execution).top).toBeCloseTo(box(refinement).top, 0);
  expect(box(refinement).bottom).toBeLessThanOrEqual(box(answer).top);
  expect(box(answer).bottom).toBeLessThanOrEqual(box(actions).bottom);
});

test("a running observation with no worker phase uses its host, workflow, and installed start capability", async () => {
  const entry = story();
  const { card, execution, refinement, read } = await mountStoryStartup(entry);
  const samples = [
    [
      "claude",
      "execution",
      "Starting execution in Claude Code…",
      "Preparing execution…",
    ],
    [
      "claude",
      "refinement",
      "Starting refinement in Claude Code…",
      "Preparing refinement…",
    ],
    [
      "codex",
      "execution",
      "Starting execution in Codex…",
      "Preparing execution…",
    ],
    [
      "codex",
      "refinement",
      "Starting refinement in Codex…",
      "Preparing refinement…",
    ],
  ] as const satisfies ReadonlyArray<
    readonly [AgentLaunchRequest["host"], LaunchWorkflow, string, string]
  >;

  async function showsProgress(words: string) {
    await expect.element(card.getByText(words, { exact: true })).toBeVisible();
    await expect
      .element(
        card.getByText(
          "Local startup in progress; this story's actions are unavailable until it settles.",
        ),
      )
      .toBeVisible();
    await expect.element(execution).toBeDisabled();
    await expect.element(refinement).toBeDisabled();
    await expect
      .element(
        card.getByText(
          /^Startup needs reconciliation|^Waiting for published story state/,
        ),
      )
      .not.toBeInTheDocument();
  }

  for (const [host, workflow, starting, preparing] of samples) {
    const builder = makeMe.anAcceptedAttempt;
    const attempt = (
      workflow === "execution"
        ? builder.executing({ ...entry, host })
        : builder.refining({ ...entry, host })
    ).please();
    const machine = makeMe.aMachineAnswer.answeringAttempts(running(attempt));
    read(machine.please());
    await showsProgress(starting);
    machine.establishing({ source: attempt.request.source, workflow, host });
    read(machine.please());
    await showsProgress(preparing);
  }
});
