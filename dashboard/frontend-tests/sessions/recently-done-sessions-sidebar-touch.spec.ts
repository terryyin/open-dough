// Coarse Session details for Done rows in Recently done sessions against a
// controlled machine answer: completion identity, not launch age.
import { tapWhereShown } from "../../tests/pageLayout.ts";
import { browserLocaleString } from "../../tests/browserLocale.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { recentlyDoneParts } from "../../tests/recentlyDoneSessionsSidebarPage.ts";
import {
  sessionsSidebarDetailsOf,
  sessionsSidebarElapsedOf,
} from "../../tests/sessionsSidebarPage.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { phoneLaunchTouchViewport } from "../../tests/touchLaunchPage.ts";
import { openFrontendThreeProjects } from "../../tests/support/frontendRecentlyDoneSidebar.ts";

test.describe("touch Session details for Done entries", () => {
  const phone = phoneLaunchTouchViewport.portrait;
  test.use({ viewport: phone, hasTouch: true });

  test("Session details identifies completion, not launch age", async ({
    page,
    frontendServices,
  }) => {
    const doneAt = new Date(Date.now() - 2 * 60_000).toISOString();
    const launchedAt = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    const title = "Touch done completion age";
    frontendServices.answerMachine(
      makeMe.aMachineAnswer
        .observingUnavailable(
          makeMe.aLaunchRecord
            .executing({ identity: "SEED-902#touch-done", title })
            .inClaudeSession({ sessionId: "touch-done-completion" })
            .launchedAt(launchedAt)
            .markedDoneAt(doneAt)
            .please(),
        )
        .please(),
    );
    await openFrontendThreeProjects(page, frontendServices);
    const shown = recentlyDoneParts(page);
    await tapWhereShown(shown.button);
    await shown.header.click();
    const row = shown.row(title);
    await expect(row).toHaveCount(1);
    await expect(sessionsSidebarElapsedOf(row)).toHaveAttribute(
      "aria-label",
      /^Completed \d+m ago$/,
    );
    const { disclosure, facts: details } = sessionsSidebarDetailsOf(row);
    await expect(disclosure).toBeVisible();
    await tapWhereShown(disclosure);
    const completedWords = `Completed ${await browserLocaleString(page, doneAt)}`;
    const launchedWords = `Launched ${await browserLocaleString(page, launchedAt)}`;
    await expect(
      details.getByText(completedWords, { exact: true }),
    ).toBeVisible();
    await expect(details.getByText(launchedWords, { exact: true })).toHaveCount(
      0,
    );
    await expect(details.getByText(title, { exact: true })).toBeVisible();
    await expect(
      details.getByText("SEED-902#touch-done", { exact: true }),
    ).toBeVisible();
  });
});
