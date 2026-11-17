// Intent CI status answers for frontend-only journeys: the authenticated
// read's `intent=ci-status` family (../../src/authenticatedIntentCiStatusRead.ts)
// in its fresh and kept (`kept=1`) forms. Each branch's fresh answer is
// arranged by the case; a fresh answer the page received becomes the
// branch's kept one, as the Backend keeps it, and a failed fresh read keeps
// the earlier one. The family counts the page's reads by form and can fail or
// hold one branch's next fresh read. Also the story board's branches'
// answers (../intentCiStoryBoard.ts). Other authenticated reads fall through
// to ./frontendServiceSubstitutes.ts. Which answer the Backend chooses and
// acquires is proved by ../../backend-tests/intent/ and ../../../e2e/intent/.

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { IntentCiStatus } from "../../src/authenticatedIntentCiStatusRead.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { parts } from "../dashboardPage.ts";
import { failing, running } from "../intentCiStoryBoard.ts";
import { chooseCiStatus } from "../intentCiStatusPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";

export type FrontendCiStatusAnswers = {
  // The page's CI status reads so far, by form.
  readonly reads: () => { readonly fresh: number; readonly kept: number };
  // Arranges what `branch`'s next fresh reads answer.
  readonly answer: (branch: string, status: IntentCiStatus) => void;
  // `branch`'s next fresh read is refused with `status` and `error`.
  readonly failNext: (branch: string, status: number, error: string) => void;
  // Holds `branch`'s next fresh read until released.
  readonly holdNext: (branch: string) => HeldAnswer;
};

type Failure = { readonly status: number; readonly error: string };

export async function serveFrontendCiStatus(
  page: Page,
  answers: Readonly<Record<string, IntentCiStatus>>,
  trunk = "main",
): Promise<FrontendCiStatusAnswers> {
  const fresh = new Map(Object.entries(answers));
  const kept = new Map<string, IntentCiStatus>();
  const failures = new Map<string, Failure>();
  const holds = new Map<string, AnswerHold>();
  const reads = { fresh: 0, kept: 0 };
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "ci-status",
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      const branch = params.get("judged") ?? trunk;
      if (params.get("kept") === "1") {
        reads.kept += 1;
        const shown = kept.get(branch);
        await fulfillJson(route, shown === undefined ? { none: true } : shown);
        return;
      }
      reads.fresh += 1;
      const hold = holds.get(branch);
      holds.delete(branch);
      await answerHeld(hold, async () => {
        const failure = failures.get(branch);
        failures.delete(branch);
        if (failure !== undefined) {
          await fulfillJson(route, { error: failure.error }, failure.status);
          return;
        }
        const status = fresh.get(branch);
        if (status === undefined) {
          await fulfillJson(route, { error: `No CI for ${branch}` }, 500);
          return;
        }
        const checked = { ...status, checkedAt: new Date().toISOString() };
        await fulfillJson(route, { ...checked, freshness: "fresh" });
        kept.set(branch, { ...checked, freshness: "kept" });
      });
    },
  );
  return {
    reads: () => ({ ...reads }),
    answer: (branch, status) => fresh.set(branch, status),
    failNext: (branch, status, error) =>
      failures.set(branch, { status, error }),
    holdNext: (branch) => {
      const { held, hold } = holdAnswer(page);
      holds.set(branch, hold);
      return held;
    },
  };
}

// Opens Intent's CI status on main, judged as `main` says, Passed at 4774f60
// unless it says otherwise: its panel.
export async function openFrontendCiStatus(
  page: Page,
  main = judgedCiStatus("main", "pass", "4774f60", "Add login"),
) {
  await serveFrontendCiStatus(page, { main });
  return openIntentCiStatusPanel(page);
}

// Opens Intent's CI status over the answers already served: its panel.
export async function openIntentCiStatusPanel(page: Page) {
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  return chooseCiStatus(parts(page).intent);
}

// Fresh answers for trunk at 4774f60 Passed, the failing story's branch
// Failed at fa11ed0 and the running story's Running at 70a0001.
export function storyBoardCiAnswers(): Record<string, IntentCiStatus> {
  return {
    main: judgedCiStatus("main", "pass", "4774f60", "Add login"),
    [failing.branch]: judgedCiStatus(
      failing.branch,
      "failed",
      "fa11ed0",
      "Break the login",
    ),
    [running.branch]: judgedCiStatus(
      running.branch,
      "running",
      "70a0001",
      "Start the story",
    ),
  };
}

// A fresh judgment of `branch`: `state` at the commit `short` abbreviates,
// subject `subject`, with any further facts (the run it rests on).
export function judgedCiStatus(
  branch: string,
  state: IntentCiStatus["state"],
  short: string,
  subject: string,
  facts: Partial<IntentCiStatus> = {},
): IntentCiStatus {
  return makeMe.anIntentCiStatus
    .with({
      branch,
      revision: short.padEnd(40, "0"),
      subject,
      state,
      laterWithoutResult: 0,
      runBranch: branch,
      checkedAt: "2026-11-05T12:00:00Z",
      freshness: "fresh",
      ...facts,
    })
    .please();
}
