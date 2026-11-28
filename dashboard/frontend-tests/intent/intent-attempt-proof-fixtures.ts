import { vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { CiProof, CiProofEntry } from "../../src/ciProof.ts";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  inertCiReads,
  judgedRun,
  judgedStatus,
  openDoughSource,
  unconfiguredIntentReads,
} from "./intent-ci-status-fixtures.ts";

export const attemptUrl = "https://ci.invalid/runs/41";
export const failedVerdict = "Failed at a1b2c3d (Add login)";

const locations = makeMe.anIntentLocationsAnswer
  .locating(
    makeMe.anIntentLocation
      .at("dashboard/tests")
      .ofKind("typescript", ["**/*.spec.ts"])
      .selecting("dashboard/tests/browse.spec.ts")
      .please(),
    makeMe.anIntentLocation
      .at("tests")
      .ofKind("shell", ["*.sh"])
      .selecting()
      .please(),
    makeMe.anIntentLocation
      .at("e2e")
      .ofKind("typescript", ["**/*.spec.ts"])
      .labelled("E2E Test")
      .selecting("e2e/install.spec.ts")
      .please(),
  )
  .please();

export const proofOfJudgedRun = (entries: readonly CiProofEntry[]) =>
  makeMe.aCiProof
    .forRun({ repository: openDoughSource.repository, ...judgedRun })
    .entries([...entries])
    .please();

// Project Intent's homepage, with real location navigation and typed CI reads.
export async function mountFailedAttemptProof(
  proof: CiProof | Promise<CiProof>,
) {
  const status = judgedStatus(
    "main",
    "failed",
    judgedRun.revision,
    "Add login",
    {
      ...judgedRun,
      runBranch: "main",
      runUrl: attemptUrl,
    },
  );
  const readProof = vi.fn<IntentCiReadSource["readProof"]>(() =>
    Promise.resolve(proof),
  );
  await mountIntentCiPage({
    work: makeMe.aPublishedWork
      .of(openDoughSource)
      .at(judgedRun.revision)
      .please(),
    reads: {
      intent: {
        ...unconfiguredIntentReads,
        readLocations: () => Promise.resolve(locations),
      },
      ci: inertCiReads({
        readStatus: () => Promise.resolve(status),
        readProof,
      }),
    },
  });
  return { readProof };
}
