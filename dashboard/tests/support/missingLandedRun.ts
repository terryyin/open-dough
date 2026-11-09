// Published Story Branch landing with independent Baseline/Branch builds;
// no run exists at the landing or any later trunk revision until the case
// supplies one. Every answer still passes through the production CI reader.
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

export { capturedComparisonLanding } from "./capturedComparisonLanding.ts";
