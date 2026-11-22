import { createElement } from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { StartupRecovery } from "../../src/StartupRecovery.tsx";
import type {
  AttemptEvidence,
  StartupRecoveryItem,
} from "../../src/startupRecoveries.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { launchDialog } from "./ad-hoc-launch-page.ts";
import { box } from "./launch-layout-page.ts";
import { mountStoryStartup } from "./story-startup-page.ts";

const entry = makeMe.aWorkEntry
  .with({
    identity: "SEED-B#b",
    title: "Keep an uncertain start protected",
    dependencies: { status: "not-recorded", entries: [], blocking: [] },
  })
  .please();

const nothing = () => undefined;

async function mountRecovery(
  items: readonly StartupRecoveryItem[],
  evidence: AttemptEvidence = "read",
) {
  const actions = {
    continueStartup: nothing,
    updateWorktreeAndRetry: nothing,
    recheckStartups: nothing,
  };
  await mountComponent(
    createElement(StartupRecovery, { items, evidence, actions }),
  );
  return { recovery: page.getByRole("region", { name: "Startup recovery" }) };
}

test("an uncertain attempt keeps its last answer and points Continue at the host's native check", async () => {
  const explanation =
    "Claude Code did not answer in time, so the session may or may not have started. Check `claude agents` for it.";
  const attempt = makeMe.anAttemptObservation
    .of(
      makeMe.anAcceptedAttempt
        .executing(entry)
        .ended({ kind: "uncertain", reason: "timed-out", explanation })
        .please(),
    )
    .owned(true)
    .running(false)
    .please();
  const ui = await mountRecovery([
    makeMe.aStartupRecoveryItem.keeping(attempt).please(),
  ]);
  const continueStart = ui.recovery.getByRole("button", {
    name: `Continue execution start of ${entry.title} (${entry.identity})`,
  });
  await expect
    .element(
      ui.recovery.getByText(
        /Its last answer: Claude Code did not answer in time, so the session may or may not have started\. Check claude agents for it\./,
      ),
    )
    .toBeVisible();
  await expect.element(continueStart).toBeEnabled();
  await expect
    .element(continueStart)
    .toHaveAccessibleDescription(
      "Check claude agents before continuing: continuing starts its session again unless its kept evidence resumes it.",
    );
  const commands = ui.recovery.element().querySelectorAll("code");
  expect(Array.from(commands, (command) => command.textContent)).toEqual([
    "claude agents",
    "claude agents",
  ]);
  const adviceId = continueStart.element().getAttribute("aria-describedby");
  expect(
    document.getElementById(adviceId ?? "")?.querySelector("code")?.textContent,
  ).toBe("claude agents");
  await expect
    .element(ui.recovery.getByRole("button", { name: /^Recheck / }))
    .toBeEnabled();
});

test("Cursor recovery offers Recheck and Continue without another host's native-check advice", async () => {
  const observed = makeMe.anAttemptObservation
    .of(makeMe.anAcceptedAttempt.adHoc({ host: "cursor" }).please())
    .owned(false)
    .running(false)
    .please();
  const { recovery } = await mountRecovery([
    makeMe.aStartupRecoveryItem.keeping(observed).please(),
  ]);
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

test("a lost acknowledgment offers only Recheck, and unanswered evidence offers Recheck launch evidence", async () => {
  const lost = makeMe.aStartupRecoveryItem
    .executionStartLost(
      entry,
      "The local dashboard server could not be reached, so the launch may or may not have been accepted and its session may or may not have started. Check `claude agents` for it.",
    )
    .please();
  const ui = await mountRecovery([lost], "unanswered");
  await expect
    .element(
      ui.recovery.getByText(
        "Startup needs reconciliation: the answer to this execution start was lost, so it may or may not have been accepted.",
      ),
    )
    .toBeVisible();
  await expect
    .element(
      ui.recovery.getByText(
        /The local dashboard server could not be reached, so the launch may or may not have been accepted and its session may or may not have started\. Check claude agents for it\./,
      ),
    )
    .toBeVisible();
  await expect
    .element(ui.recovery.getByRole("button", { name: /^Continue/ }))
    .not.toBeInTheDocument();
  await expect
    .element(
      ui.recovery.getByRole("button", {
        name: `Recheck ${entry.title} (${entry.identity})`,
      }),
    )
    .toBeEnabled();
  await expect
    .element(
      ui.recovery.getByText(
        /^The local dashboard server has not answered with this machine's launch evidence/,
      ),
    )
    .toBeVisible();
  await expect
    .element(
      ui.recovery.getByRole("button", { name: "Recheck launch evidence" }),
    )
    .toBeEnabled();
});

test("an accepted start hands focus to its protected story and a later uncertain outcome belongs in recovery", async () => {
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

  const timedOut = attempt
    .ended({
      kind: "uncertain",
      reason: "timed-out",
      explanation: "Claude Code did not answer in time.",
    })
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
  await expect
    .element(
      ui.recovery.getByRole("button", { name: /^Continue execution start/ }),
    )
    .toBeEnabled();
  expect(ui.accept).toHaveBeenCalledTimes(1);
});
