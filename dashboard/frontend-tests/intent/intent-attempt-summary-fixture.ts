import { vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { CiProof, CiProofEntry } from "../../src/ciProof.ts";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import {
  attemptUrl,
  proofOfJudgedRun,
} from "./intent-attempt-proof-fixtures.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  inertCiReads,
  judgedRun,
  judgedStatus,
  openDoughSource,
  unconfiguredIntentReads,
} from "./intent-ci-status-fixtures.ts";

const treeRevision = "b2".repeat(20);
const dashboardSpecs = [
  "dashboard/tests/root.spec.ts",
  "dashboard/tests/added.spec.ts",
  "dashboard/tests/folder/a.spec.ts",
  "dashboard/tests/folder/b.spec.ts",
  "dashboard/tests/folder/nested/c.spec.ts",
];

const locations = makeMe.anIntentLocationsAnswer
  .locating(
    makeMe.anIntentLocation
      .at("dashboard/tests")
      .ofKind("typescript", ["**/*.spec.ts"])
      .selecting(...dashboardSpecs)
      .please(),
    makeMe.anIntentLocation
      .at("tests")
      .ofKind("shell", ["*.sh"])
      .selecting("tests/root.sh")
      .please(),
  )
  .please();

export async function mountAttemptSummary(
  entries: readonly CiProofEntry[],
  options: { readonly proof?: CiProof; readonly refreshFailure?: string } = {},
) {
  const status = judgedStatus("main", "pass", judgedRun.revision, "Add login", {
    ...judgedRun,
    runBranch: "main",
    runUrl: attemptUrl,
  });
  const proof = options.proof ?? proofOfJudgedRun(entries);
  const readProof = vi.fn<IntentCiReadSource["readProof"]>(() =>
    Promise.resolve(proof),
  );
  const kept = makeMe.anIntentCiStatus
    .with({ ...status, freshness: "kept" })
    .please();
  const { refreshFailure } = options;
  let lastRetrieved: typeof kept | undefined;
  const readStatus: IntentCiReadSource["readStatus"] = () => {
    if (lastRetrieved !== undefined && refreshFailure !== undefined)
      return Promise.reject(new Error(refreshFailure));
    lastRetrieved = kept;
    return Promise.resolve(status);
  };
  const readKeptStatus: IntentCiReadSource["readKeptStatus"] = () =>
    Promise.resolve(lastRetrieved ?? { none: true });
  await mountIntentCiPage({
    viewport: { width: 1280, height: 900 },
    work: makeMe.aPublishedWork.of(openDoughSource).at(treeRevision).please(),
    reads: {
      intent: {
        ...unconfiguredIntentReads,
        readLocations: () => Promise.resolve(locations),
        readFile: (...[, path]) =>
          Promise.resolve(
            path === "tests/root.sh" ? "#!/usr/bin/env bash\n" : "",
          ),
      },
      ci: inertCiReads({ readStatus, readKeptStatus, readProof }),
    },
  });
  return { readProof };
}

// The same entry totals with either file breakdowns or only entry figures.
export function summaryEntries(byFile: boolean) {
  const dashboard = makeMe.aCiProofEvidence.inUnit("case").inParts(2);
  const shell = makeMe.aCiProofEvidence.inUnit("file");
  if (byFile) {
    dashboard
      .withFile("dashboard/tests/root.spec.ts", {
        passed: 2,
        durationMs: 1200,
        untimed: 1,
      })
      .withFile("dashboard/tests/folder/a.spec.ts", {
        passed: 1,
        failed: 1,
        durationMs: 550,
      })
      .withFile("dashboard/tests/folder/b.spec.ts", {
        passed: 1,
        durationMs: 0,
      })
      .withFile("dashboard/tests/folder/nested/c.spec.ts", {
        passed: 1,
        other: 1,
        durationMs: 45,
      });
    shell
      .withFile("tests/root.sh", { passed: 1, durationMs: 2500 })
      .withFile("tests/support/check.sh", { passed: 1, durationMs: 500 });
  } else {
    dashboard.counting(5, 1, 1).timed(1795).withUntimed(1);
    shell.counting(2).timed(3000);
  }
  return [
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .holding(dashboard.please())
      .please(),
    makeMe.aCiProofEntry.at("tests").holding(shell.please()).please(),
  ];
}
