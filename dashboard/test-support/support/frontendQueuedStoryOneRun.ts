// A queued story's one-run Summary beside a Done story's comparison
// (./frontendIntentDoneStory.ts): trunk after the Done story lists its
// dashboard/tests children with one more and its removed file gone, and CI
// status names run 41 whose proof times each file
// (./frontendCiRunProofAnswers.ts). The queued story's comparison stays
// unavailable (./frontendIntentCi.ts). Choosing that run is the Backend's
// (../../backend-tests/intent/ci-proof-*.spec.ts).
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { serveFrontendRunProof } from "./frontendCiRunProofAnswers.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";

// Each trunk test file and its run-41 time; distinct times order the sort.
const trunkFiles = {
  "dashboard/tests/folder/a.spec.ts": 14_000,
  "dashboard/tests/folder/nested/c.spec.ts": 410,
  "dashboard/tests/added.spec.ts": 800,
  "dashboard/tests/later.spec.ts": 300,
  "dashboard/tests/renamed.spec.ts": 2_100,
  "dashboard/tests/root.spec.ts": 1_200,
} as const;

export async function answerQueuedStoryOneRun(
  page: Page,
  services: FrontendServiceState,
) {
  const paths = Object.keys(trunkFiles);
  Object.assign(services, {
    locations: {
      revision: services.revision,
      locations: [
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting(...paths)
          .please(),
      ],
      recovery: undefined,
    },
  });
  const evidence = makeMe.aCiProofEvidence.inUnit("case");
  for (const [path, durationMs] of Object.entries(trunkFiles))
    evidence.withFile(path, { passed: 1, durationMs });
  await serveFrontendRunProof(
    page,
    [
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .holding(evidence.please())
        .please(),
    ],
    { subject: "Story A landed" },
  );
}
