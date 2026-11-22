import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { launchDialog } from "./ad-hoc-launch-page.ts";
import { box } from "./launch-layout-page.ts";
import { mountStoryStartup } from "./story-startup-page.ts";

const work = () =>
  makeMe.aWorkEntry
    .with({
      identity: "SEED-B#b",
      title: "Keep an uncertain start protected",
      dependencies: { status: "not-recorded", entries: [], blocking: [] },
    })
    .please();

test("an accepted start hands focus to its protected story and a later uncertain outcome belongs in recovery", async () => {
  const entry = work();
  const attempt = makeMe.anAcceptedAttempt.executing(entry);
  const observation = makeMe.anAttemptObservation.owned(true);
  const ui = await mountStoryStartup(entry);
  const accepted = observation.of(attempt.please()).running(true).please();
  let answerAcceptance = () => undefined;
  ui.accept.mockReturnValueOnce(
    new Promise((resolve) => {
      answerAcceptance = () => {
        resolve({ kind: "accepted", attempt: accepted });
        return undefined;
      };
    }),
  );
  await ui.execution.click();
  const form = launchDialog();
  await form.start.click();
  await expect.element(ui.execution).toBeDisabled();
  answerAcceptance();

  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect.element(ui.card).toHaveFocus();
  await expect
    .element(
      ui.card.getByText("Starting execution in Claude Code…", { exact: true }),
    )
    .toBeVisible();
  await expect.element(ui.execution).toBeDisabled();

  const explanation =
    "Claude Code did not answer in time, so the session may or may not have started. Check `claude agents` for it.";
  const timedOut = attempt
    .ended({ kind: "uncertain", reason: "timed-out", explanation })
    .please();
  ui.read(
    makeMe.aMachineAnswer
      .answeringAttempts(observation.of(timedOut).running(false).please())
      .please(),
  );
  const status = ui.card.getByText(/^Startup needs reconciliation/);
  await expect.element(status).toBeVisible();
  expect(box(status).bottom).toBeLessThanOrEqual(box(ui.actions).top);
  await expect
    .element(ui.card.getByText(/^Launch uncertain:/))
    .not.toBeInTheDocument();
  await expect.element(ui.execution).toBeDisabled();
  await expect.element(ui.refinement).toBeDisabled();
  await expect
    .element(ui.execution)
    .toHaveAccessibleDescription(/Startup needs reconciliation/);
  await expect.element(ui.card).toHaveFocus();
  await expect
    .element(ui.card.getByRole("list", { name: "Sessions" }))
    .not.toBeInTheDocument();

  const continueStart = ui.recovery.getByRole("button", {
    name: /^Continue execution start/,
  });
  const nativeAdvice =
    "Check claude agents before continuing: continuing starts its session again unless its kept evidence resumes it.";
  await expect
    .element(
      ui.recovery.getByText(
        /Its last answer: Claude Code did not answer in time, so the session may or may not have started\. Check claude agents for it\./,
      ),
    )
    .toBeVisible();
  await expect.element(continueStart).toBeEnabled();
  await expect.element(continueStart).toHaveAccessibleDescription(nativeAdvice);
  const commands = ui.recovery.element().querySelectorAll("code");
  expect(Array.from(commands, (command) => command.textContent)).toEqual([
    "claude agents",
    "claude agents",
  ]);
  const adviceId = continueStart.element().getAttribute("aria-describedby");
  expect(adviceId).toBeTruthy();
  expect(
    document.getElementById(adviceId ?? "")?.querySelector("code")?.textContent,
  ).toBe("claude agents");
  await expect
    .element(ui.recovery.getByRole("button", { name: /^Recheck / }))
    .toBeEnabled();
  expect(ui.accept).toHaveBeenCalledTimes(1);
});

test("a lost acknowledgment says uncertain beside Start when a subsequent read shows the attempt", async () => {
  const entry = work();
  const other = makeMe.aWorkEntry
    .with({
      identity: "SEED-C#c",
      title: "An independent story",
      dependencies: { status: "not-recorded", entries: [], blocking: [] },
    })
    .please();
  const ui = await mountStoryStartup(entry, { other });
  const explanation =
    "The local dashboard server could not be reached, so the launch may or may not have been accepted and its session may or may not have started. Check `claude agents` for it.";
  ui.accept.mockResolvedValueOnce({
    kind: "uncertain",
    unacknowledged: true,
    explanation,
  });
  await ui.execution.click();
  const form = launchDialog();
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect
    .element(
      ui.card.getByText(
        /^Startup needs reconciliation: the answer to this execution start was lost/,
      ),
    )
    .toBeVisible();
  await expect
    .element(ui.recovery.getByRole("button", { name: /^Recheck / }))
    .toBeEnabled();
  await expect
    .element(ui.recovery.getByRole("button", { name: /^Continue/ }))
    .not.toBeInTheDocument();
  const seen = makeMe.anAttemptObservation
    .of(makeMe.anAcceptedAttempt.executing(entry).please())
    .owned(true)
    .running(true)
    .please();
  ui.read(makeMe.aMachineAnswer.answeringAttempts(seen).please());

  await expect
    .element(
      ui.card.getByText(
        /^Launch uncertain: The local dashboard server could not be reached, so the launch may or may not have been accepted/,
      ),
    )
    .toBeVisible();
  await expect
    .element(ui.card.getByText(/^Local startup in progress/))
    .toBeVisible();
  await expect.element(ui.execution).toBeDisabled();
  await expect.element(ui.refinement).toBeDisabled();
  const independent = page.getByRole("article", {
    name: other.title,
    exact: true,
  });
  await expect
    .element(independent.getByRole("button", { name: "Start execution" }))
    .toBeEnabled();
  await expect
    .element(independent.getByRole("button", { name: "Start refinement" }))
    .toBeEnabled();
  expect(ui.accept).toHaveBeenCalledTimes(1);
});

test("Cursor recovery offers Recheck and Continue without another host's native-check advice", async () => {
  const observed = makeMe.anAttemptObservation
    .of(makeMe.anAcceptedAttempt.adHoc({ host: "cursor" }).please())
    .owned(false)
    .running(false)
    .please();
  const { recovery } = await mountStoryStartup(work(), {
    machine: makeMe.aMachineAnswer.answeringAttempts(observed).please(),
  });
  await expect
    .element(
      recovery.getByRole("heading", {
        name: "Ad hoc session · session start in Cursor",
      }),
    )
    .toBeVisible();
  await expect.element(recovery.getByText(/It never settled\./)).toBeVisible();
  await expect
    .element(recovery.getByRole("button", { name: "Recheck Ad hoc session" }))
    .toBeEnabled();
  const continueStart = recovery.getByRole("button", {
    name: "Continue session start of Ad hoc session",
  });
  await expect.element(continueStart).toBeEnabled();
  await expect
    .element(recovery.getByText(/before continuing/))
    .not.toBeInTheDocument();
  expect(recovery.element().querySelector('[id$="-check"]')).toBeNull();
  await expect.element(continueStart).not.toHaveAttribute("aria-describedby");
  await expect.element(continueStart).toHaveAccessibleDescription("");
});
