// Canonical captured landing facts, independent of published Git preparation.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

export function capturedComparisonLanding(
  setup: { identity: string; baseline: string; landingMerge: string },
  receivedAt: string,
  facts: Partial<
    Pick<
      import("../../src/launchLanding.ts").LaunchLanding,
      "target" | "revision" | "identity" | "receipt"
    >
  > = {},
) {
  return makeMe.aLaunchLanding
    .capturedFrom({
      repository: "open-dough",
      identity: facts.identity ?? setup.identity,
      target: facts.target ?? "refs/heads/main",
    })
    .comparing({
      base: setup.baseline,
      revision: facts.revision ?? setup.landingMerge,
    })
    .receivedAt(receivedAt)
    .deliveredAs({
      delivery: "33333333-3333-4333-8333-333333333333",
      receipt: facts.receipt ?? "44444444-4444-4444-8444-444444444444",
    })
    .please();
}
