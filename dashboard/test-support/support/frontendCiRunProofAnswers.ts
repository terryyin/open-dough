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
  openIntentCiStatusPanel,
  serveFrontendCiStatus,
} from "./frontendCiStatusAnswers.ts";

type RunProofAnswer = { readonly hold?: boolean; readonly proof?: CiProof };

// Serves trunk's CI status, judged at the judged commit by run 41
// (../intentCiProofPage.ts) as `facts` add, Passed unless they say otherwise,
// and that run's proof (`intent=ci-proof`,
// ../../src/authenticatedIntentCiProofRead.ts) holding `entries`, or the
// unavailable `proof` given instead; with `hold` its answer waits until
// `held` is released. Other runs' proof reads fall through. `reads` counts
// the page's reads of this run's proof; `ci` serves the CI status reads.
export async function serveFrontendRunProof(
  page: Page,
  entries: readonly CiProofEntry[],
  facts: Partial<IntentCiStatus> = {},
  answer: RunProofAnswer = {},
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
      url.searchParams.get("intent") === "ci-proof" &&
      url.searchParams.get("run") === String(status.runId),
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
  const ci = await serveFrontendCiStatus(page, { main: status });
  return { ci, held: hold?.held, reads: () => reads };
}

// Opens Intent's CI status over serveFrontendRunProof's answers: its panel
// and the run's Proof within it.
export async function openFrontendRunProof(
  page: Page,
  entries: readonly CiProofEntry[],
  facts: Partial<IntentCiStatus> = {},
  answer: RunProofAnswer = {},
) {
  const served = await serveFrontendRunProof(page, entries, facts, answer);
  const panel = await openIntentCiStatusPanel(page);
  return { ...served, panel, proof: proofOf(panel) };
}
