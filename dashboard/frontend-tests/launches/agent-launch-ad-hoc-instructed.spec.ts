// Start session with typed text, against a controlled launch boundary that
// accepts it and a machine that then lists its session: with the Side panel
// closed it stays closed, and once the startup has ended the keyboard returns
// to Start session. The started session itself is
// ../../../e2e/launches/agent-launch-ad-hoc-instructed.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../test-support/support/frontendLaunchSubstitutes.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../test-support/launchStoryCardPage.ts";
import { sidePanelContents } from "../../test-support/support/sidePanelContents.ts";
import { takenAdHocSession } from "../../test-support/support/startedAdHocSession.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const text = "summarize the open issues";

test("an instructed Start session with the Side panel closed leaves it closed and returns the keyboard to Start session", async ({
  page,
  frontendServices,
}) => {
  const sessionId = "instructed-session-1";
  // The machine accepts the start, which launches the session at once.
  await installFrontendLaunchBoundary(page, {
    accept: (request) => {
      const attempt = makeMe.anAttemptObservation
        .of(
          makeMe.anAcceptedAttempt
            .requesting(request)
            .launched({ host: "claude", sessionId })
            .settledAt("2026-01-01T00:00:05.000Z")
            .please(),
        )
        .owned(true)
        .running(false)
        .afterChanges(1)
        .please();
      frontendServices.answerMachine(
        makeMe.aMachineAnswer
          .answeringAttempts(attempt)
          .observingOpen(
            makeMe.aLaunchRecord
              .adHoc({ instruction: text, title: text })
              .inClaudeSession({ sessionId, shortId: "instruct" })
              .please(),
          )
          .please(),
      );
      return { kind: "accepted", attempt };
    },
  });
  await openFrontendTakenBacklog(page);
  const sidePanel = sidePanelContents(page);
  await expect(sidePanel).toHaveCount(0);

  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  await startSessionField(dialog).fill(text);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  // The button is unavailable during the startup, so it holds the keyboard
  // only once the startup has ended.
  await expect(startSession(page, "Open Dough")).toBeFocused();
  await expect(takenAdHocSession(page, text)).toHaveCount(1);
  await expect(sidePanel).toHaveCount(0);
});
