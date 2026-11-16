// Recovery presentation can read a known host with no native-check advice.
// Synthetic launch-record answers only; no dashboard backend or native host.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import { putFrontendMachine } from "../tests/support/frontendServiceState.ts";
import { readyStory } from "../tests/launchJourney.ts";
import { parts } from "../tests/dashboardPage.ts";
import { recoveryOf } from "../tests/responsiveRecovery.ts";
import { installFrontendLaunchBoundary } from "../tests/support/frontendLaunchSubstitutes.ts";

test("without a reported phase, story startup keeps its host and the installed start's Preparing versus Starting choice", async ({
  page,
  frontendServices,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  const starting = parts(page).backlog.getByRole("article", {
    name: readyStory,
  });
  let opened = false;
  for (const host of ["claude", "codex"] as const) {
    for (const workflow of ["execution", "refinement"] as const) {
      for (const establishes of [false, true]) {
        // An owned attempt still running with no session yet.
        const request = makeMe.aLaunchRequest
          .ofWorkflow(workflow, {
            identity: "SEED-B#b",
            title: readyStory,
            host,
          })
          .please();
        const answer = makeMe.aMachineAnswer.answeringAttempts(
          makeMe.anAttemptObservation
            .of(makeMe.anAcceptedAttempt.requesting(request).please())
            .owned(true)
            .running(true)
            .please(),
        );
        if (establishes)
          answer.establishing({
            source: request.source,
            workflow,
            host: request.host,
          });
        putFrontendMachine(frontendServices, answer.please());
        // The first startup opens the board; each later one replaces the
        // previous on the machine, and the page reads the machine again when
        // told.
        if (opened) await boundary.tellChanged();
        else await openFrontendTakenBacklog(page);
        opened = true;
        const words = establishes
          ? `Preparing ${workflow}…`
          : `Starting ${workflow} in ${host === "claude" ? "Claude Code" : "Codex"}…`;
        await expect(starting.locator(".launch-answer")).toHaveText(words);
        await expect(starting).toContainText(
          "Local startup in progress; this story's actions are unavailable until it settles.",
        );
        await expect(
          starting.getByRole("button", { name: "Start execution" }),
        ).toBeDisabled();
        await expect(
          starting.getByRole("button", { name: "Start refinement" }),
        ).toBeDisabled();
        await expect(starting).not.toContainText(
          "Startup needs reconciliation",
        );
        await expect(starting).not.toContainText(
          "Waiting for published story state",
        );
      }
    }
  }
});

test("a recovery host without native-check advice keeps its controls without borrowed advice or a description reference", async ({
  page,
  frontendServices,
}) => {
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .answeringAttempts(
        makeMe.anAttemptObservation
          .of(makeMe.anAcceptedAttempt.adHoc({ host: "cursor" }).please())
          .owned(false)
          .running(false)
          .please(),
      )
      .please(),
  );
  await openFrontendTakenBacklog(page);
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(
    "Ad hoc session · session start in Cursor",
  );
  await expect(recovery).toContainText("It never settled.");
  await expect(
    recovery.getByRole("button", { name: "Recheck Ad hoc session" }),
  ).toBeEnabled();
  const continueStart = recovery.getByRole("button", {
    name: "Continue session start of Ad hoc session",
  });
  await expect(continueStart).toBeEnabled();
  await expect(recovery).not.toContainText("before continuing");
  await expect(recovery.locator('[id$="-check"]')).toHaveCount(0);
  await expect(continueStart).not.toHaveAttribute("aria-describedby");
  await expect(continueStart).toHaveAccessibleDescription("");
});
