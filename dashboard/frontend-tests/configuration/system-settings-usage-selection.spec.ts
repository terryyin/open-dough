// Each selection shows only its own current read: a failure lasts until that
// selection is read again, and an answer for a selection already left never
// joins the one now shown.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  requestedCohort,
  usageTokenIndexEndpoint,
  type UsageTool,
} from "../../src/usageTokenIndex.ts";
import { test } from "../../test-support/support/frontendApp.ts";
import {
  answerHeld,
  holdAnswer,
  type AnswerHold,
} from "../../test-support/support/frontendSubstituteAnswers.ts";
import { visitUsage } from "../../test-support/support/systemSettingsUsagePage.ts";
import type { Page } from "@playwright/test";

const answerFor = (tool: UsageTool) =>
  makeMe.aTokenIndexAnswer
    .with({ indexes: tool === "claude" ? [3_000] : [1_000, 2_000] })
    .forCohort({ tool })
    .please();

// Codex answers at once; Claude Code answers as `claude` says, once its
// `hold`, if any, is released.
async function answering(
  page: Page,
  claude: () => { readonly hold?: AnswerHold; readonly fails: boolean },
) {
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => {
      const tool =
        requestedCohort(new URL(route.request().url()).searchParams)?.tool ??
        "codex";
      if (tool !== "claude") return route.fulfill({ json: answerFor(tool) });
      const { hold, fails } = claude();
      return answerHeld(hold, () =>
        (fails
          ? route.fulfill({ status: 500, json: {} })
          : route.fulfill({ json: answerFor(tool) })
        )
          // The page may have dropped a read it no longer needs.
          .catch(() => undefined),
      );
    },
  );
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
});

test("a failure leaves once its selection is read again", async ({ page }) => {
  let claude: { hold?: AnswerHold; fails: boolean } = { fails: true };
  await answering(page, () => claude);
  const usage = await visitUsage(page);
  await usage.showTool("Claude Code", true);
  await usage.showsProblem("Claude Code: Usage could not be read.");

  const next = holdAnswer(page);
  claude = { hold: next.hold, fails: false };
  await usage.showTool("Claude Code", false);
  await usage.showsPointCount(2);
  await usage.showTool("Claude Code", true);
  await usage.showsLoading();
  await usage.showsNoProblem();
  next.held.release();
  await usage.showsToolSummaries(["Codex", "Claude Code"]);
  await usage.showsPointCount(3);
  await usage.showsNoProblem();
});

test("a failure leaves once a day round trip reads its period again", async ({
  page,
}) => {
  let claude: { hold?: AnswerHold; fails: boolean } = { fails: true };
  await answering(page, () => claude);
  const usage = await visitUsage(page);
  await usage.showTool("Claude Code", true);
  await usage.showsProblem("Claude Code: Usage could not be read.");

  claude = { fails: false };
  await usage.chooseDays("7");
  await usage.showsPointCount(3);
  await usage.showsNoProblem();
  const next = holdAnswer(page);
  claude = { hold: next.hold, fails: false };
  await usage.chooseDays("30");
  await usage.showsLoading();
  await usage.showsNoProblem();
  next.held.release();
  await usage.showsPointCount(3);
  await usage.showsNoProblem();
});

test("an answer for a selection already left never joins the one shown", async ({
  page,
}) => {
  const late = holdAnswer(page);
  await answering(page, () => ({ hold: late.hold, fails: false }));
  const usage = await visitUsage(page);
  await usage.showsPointCount(2);
  await usage.showTool("Claude Code", true);
  await usage.showsLoading();
  await usage.showTool("Claude Code", false);
  await usage.showsPointCount(2);
  late.held.release();
  await late.held.delivered;
  await usage.showsToolSummaries(["Codex"]);
  await usage.showsPointCount(2);
  await usage.showsNoProblem();
});
