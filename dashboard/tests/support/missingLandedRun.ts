// Published Story Branch landing with independent Baseline/Branch builds;
// no run exists at the landing or any later trunk revision until the case
// supplies one. Every answer still passes through the production CI reader.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { publishUnbuiltStoryLanding } from "./storyCiComparisonSkippedLandingFixture.ts";
import { passedFrom, trunkRun, usableProofOf } from "./landedCiTrunk.ts";
import type { StartOrigin } from "./startOrigin.ts";

export async function missingLandedRun(origin: StartOrigin) {
  const setup = await publishUnbuiltStoryLanding(origin, "code");
  const baseline = trunkRun(
    setup.baseline,
    101,
    passedFrom("2026-11-05T12:00:00Z", 180_000),
  );
  const branch = trunkRun(
    setup.branchSide,
    102,
    passedFrom("2026-11-05T13:00:00Z", 200_000),
  );
  const exact = trunkRun(
    setup.landingMerge,
    103,
    passedFrom("2026-11-05T14:00:00Z", 240_000),
  );
  return {
    ...setup,
    runs: [baseline, branch],
    exact,
    proofs: {
      101: usableProofOf(baseline),
      102: usableProofOf(branch),
      103: usableProofOf(exact),
    },
  };
}

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
