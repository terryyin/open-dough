// Explicit empty CI answers needed for whole-app story/Project scope changes.
// Judgment/acquisition belongs to existing Backend and E2E proof.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { scopeHistoryGlanceSchema } from "../../src/ciScopeHistory.ts";
import { serveFrontendCiStatus } from "./frontendCiStatusAnswers.ts";
import { serveFrontendCiHistory } from "./frontendCiHistoryAnswers.ts";
import { storyCiComparisonAnswerSchema } from "../../src/storyCiComparison.ts";

export async function answerFrontendIntentCi(page: Page, revision: string) {
  const judgment = makeMe.anIntentCiStatus
    .with({
      branch: "main",
      revision,
      state: "unread",
      subject: "No readable result",
      laterWithoutResult: 0,
      reason:
        "No result of the selected check was found in the readable history",
      checkedAt: "2026-11-01T00:00:00.000Z",
      freshness: "fresh",
    })
    .please();
  await serveFrontendCiStatus(page, { main: judgment });
  await serveFrontendCiHistory(page, makeMe.aCiHistoryAnswer.please());
  await answerEmptyScopeHistory(page, revision);
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "ci-comparison",
    (route) =>
      route.fulfill({
        json: storyCiComparisonAnswerSchema.parse(
          makeMe.aStoryCiComparison
            .with({
              kind: "unavailable",
              identity:
                new URL(route.request().url()).searchParams.get("identity") ??
                "",
              explanation: "This story has no published completion record.",
              checkedAt: "2026-11-01T00:00:00.000Z",
            })
            .please(),
        ),
      }),
  );
}

// Answers each scope history read as empty: no landed history at `revision`
// unless the read names another.
export async function answerEmptyScopeHistory(page: Page, revision: string) {
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "ci-history" &&
      url.searchParams.has("scope"),
    (route) => {
      const params = new URL(route.request().url()).searchParams;
      const scope = params.get("scope");
      return route.fulfill({
        json: scopeHistoryGlanceSchema.parse(
          makeMe.aScopeHistoryGlance
            .with({
              path: scope ?? "",
              selectedRevision: params.get("revision") ?? revision,
              availability: "empty",
              entries: [],
            })
            .please(),
        ),
      });
    },
  );
}
