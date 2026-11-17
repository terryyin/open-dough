// Intent CI run Proof answers for frontend-only journeys: the authenticated
// read's `intent=ci-proof` family (../../src/authenticatedIntentCiProofRead.ts)
// for the run a CI status judgment names. Reading the run's artifacts into a
// proof is the Backend's (../../backend-tests/intent/ci-proof-*.spec.ts) and
// E2E's (../../../e2e/intent/intent-ci-proof*.spec.ts).

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { IntentCiStatus } from "../../src/authenticatedIntentCiStatusRead.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import type { CiProof, CiProofEntry } from "../../src/ciProof.ts";
import { proofOf, run } from "../intentCiProofPage.ts";
import { judged, runUrl } from "../intentCiStatusPage.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
} from "./frontendSubstituteAnswers.ts";
import {
  judgedCiStatus,
  openServedFrontendCiStatus,
} from "./frontendCiStatusAnswers.ts";

// Opens Intent's CI status on main, judged at the judged commit by run 41
// (../intentCiProofPage.ts) as `facts` add, Passed unless they say otherwise,
// whose proof (`intent=ci-proof`, ../../src/authenticatedIntentCiProofRead.ts)
// holds `entries`, or the unavailable `proof` given instead; with `hold` its
// answer waits until `held` is released. `reads` counts the page's proof
// reads; `ci` serves the CI status reads.
export async function openFrontendRunProof(
  page: Page,
  entries: readonly CiProofEntry[],
  facts: Partial<IntentCiStatus> = {},
  answer: { readonly hold?: boolean; readonly proof?: CiProof } = {},
) {
  const status = judgedCiStatus("main", "pass", judged, "Add login", {
    runUrl,
    runId: run.runId,
    runAttempt: run.attempt,
    ...facts,
  });
  const proof =
    answer.proof ??
    makeMe.aCiProof
      .forRun({
        repository: run.repository,
        revision: run.revision,
        runId: run.runId,
        runAttempt: run.attempt,
      })
      .entries([...entries])
      .please();
  const hold = answer.hold === true ? holdAnswer(page) : undefined;
  let reads = 0;
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "ci-proof",
    async (route) => {
      reads += 1;
      await answerHeld(hold?.hold, () =>
        fulfillJson(route, {
          runId: status.runId,
          runAttempt: status.runAttempt,
          revision: status.revision,
          checkedAt: status.checkedAt,
          proof,
        }),
      );
    },
  );
  const { panel, ci } = await openServedFrontendCiStatus(page, status);
  return {
    panel,
    ci,
    proof: proofOf(panel),
    held: hold?.held,
    reads: () => reads,
  };
}
