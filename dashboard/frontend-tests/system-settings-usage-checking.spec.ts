// Refresh owns its checking state through filter reads and its current-cohort reread.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  usageRefreshEndpoint,
  usageTokenIndexEndpoint,
} from "../src/usageTokenIndex.ts";
import { test } from "../tests/support/frontendApp.ts";
import {
  answerHeld,
  holdAnswer,
} from "../tests/support/frontendSubstituteAnswers.ts";
import { visitUsage } from "../tests/support/systemSettingsUsagePage.ts";

const oldCheck = "2026-11-15T09:00:00.000Z";
const nextCheck = "2026-11-15T10:00:00.000Z";
const executions = () =>
  makeMe.aTokenIndexAnswer
    .with({
      indexes: [
        1_000, 1_100, 1_200, 1_300, 1_400, 1_500, 1_600, 1_700, 1_800, 1_900,
      ],
    })
    .checkedAt(oldCheck)
    .please();
const refinements = (at: string, extra = 0) =>
  makeMe.aTokenIndexAnswer
    .inWorkflow("refinement")
    .with({
      indexes: [
        2_000, 2_100, 2_200, 2_300, 2_400, 2_500, 2_600, 2_700, 2_800, 2_900,
      ].map((value) => value + extra),
    })
    .checkedAt(at)
    .please();

test("checking survives a selected cohort read and waits for Refresh's selected-cohort reread", async ({
  page,
}) => {
  const refresh = holdAnswer(page);
  const selection = holdAnswer(page);
  const reread = holdAnswer(page);
  let selectedReads = 0;
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    async (route) => {
      if (
        new URL(route.request().url()).searchParams.get("workflow") !==
        "refinement"
      )
        return route.fulfill({ json: executions() });
      selectedReads++;
      return answerHeld(
        selectedReads === 1 ? selection.hold : reread.hold,
        () =>
          route.fulfill({
            json: refinements(
              selectedReads === 1 ? oldCheck : nextCheck,
              selectedReads === 1 ? 0 : 1_000,
            ),
          }),
      );
    },
  );
  await page.route(
    (url) => url.pathname === usageRefreshEndpoint,
    (route) =>
      answerHeld(refresh.hold, () =>
        route.fulfill({ json: { checkedAt: nextCheck } }),
      ),
  );
  const usage = await visitUsage(page);
  await usage.showsAverage("1,450");
  await usage.refresh();
  await refresh.held.received;
  await usage.showsChecking();
  await usage.choose("Launch workflow", "Refinement");
  await selection.held.received;
  await usage.showsChecking();
  selection.held.release();
  await usage.showsAverage("2,450");
  await usage.showsChecking();
  refresh.held.release();
  await reread.held.received;
  await usage.showsChecking();
  await usage.showsAverage("2,450");
  reread.held.release();
  await usage.showsAverage("3,450");
  await usage.showsCheckedAt(nextCheck);
  await usage.showsChecked();
});

test("a failed Refresh after a filter change retains the selected chart and time beside its error", async ({
  page,
}) => {
  const refresh = holdAnswer(page);
  const selectedCheck = "2026-11-15T09:30:00.000Z";
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) =>
      route.fulfill({
        json:
          new URL(route.request().url()).searchParams.get("workflow") ===
          "refinement"
            ? refinements(selectedCheck)
            : executions(),
      }),
  );
  await page.route(
    (url) => url.pathname === usageRefreshEndpoint,
    (route) =>
      answerHeld(refresh.hold, () =>
        route.fulfill({
          status: 503,
          json: {
            error: "Usage could not be refreshed: rollouts unavailable.",
          },
        }),
      ),
  );
  const usage = await visitUsage(page);
  await usage.showsAverage("1,450");
  await usage.refresh();
  await refresh.held.received;
  await usage.choose("Launch workflow", "Refinement");
  await usage.showsAverage("2,450");
  await usage.showsCheckedAt(selectedCheck);
  await usage.showsChecking();
  refresh.held.release();
  await usage.showsProblem(
    "Usage could not be refreshed: rollouts unavailable.",
  );
  await usage.showsAverage("2,450");
  await usage.showsCheckedAt(selectedCheck);
  await usage.showsChecked();
});
