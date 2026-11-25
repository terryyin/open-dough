// Real unreadable launch-store or history bytes in a case home cannot supply
// age or hide published completion; typed receipt variants stay with
// ci-comparison-finality-receipts.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  finalityComparisonFacts,
  finalityRun,
} from "../support/finalityComparisonFacts.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import { test } from "../support/comparisonMemory.ts";
import { comparisonProject, landing } from "../support/comparisonRead.ts";
import { storyCiComparisonSource } from "../../server/storyCiComparisonSource.ts";
import { keepLaunchStoreText } from "../../test-support/support/launchStore.ts";
import { keepLandedCiHistory } from "../../test-support/support/landedCiHistory.ts";
import { machineDocumentAt } from "../../server/machineHome.ts";

const hour = 3_600_000;
const receivedAt = "2026-11-05T15:00:00.000Z";
let home = "";

afterEach(() => {
  if (home !== "") rmSync(home, { recursive: true, force: true });
  home = "";
});

for (const capture of ["unreadable launch", "unreadable history"] as const) {
  test(`${capture} cannot supply age or hide published completion`, async ({
    comparisonRead,
  }) => {
    home = mkdtempSync(path.join(tmpdir(), "intent-ci-comparison-receipt-"));
    if (capture === "unreadable launch") {
      keepLaunchStoreText(home, "unreadable capture");
    } else {
      await keepLandedCiHistory(home, makeMe.aLandedCiHistory.please());
      writeFileSync(
        machineDocumentAt("landed-ci-history.json", home),
        "unreadable history",
      );
    }
    const facts = finalityComparisonFacts("code");
    const production = storyCiComparisonSource(
      comparisonProject,
      new AbortController().signal,
      home,
    );
    const evidence = storyCiComparisonEvidence({
      ...facts,
      now: () => Date.parse(receivedAt) + 3 * hour,
    }).source;
    expect(
      await comparisonRead({
        ...evidence,
        landingReceipts: () => production.landingReceipts(),
      }),
    ).toMatchObject({
      landed: { kind: "none" },
    });
    facts.runs.push(finalityRun(landing, 103));
    expect(
      await comparisonRead({
        ...evidence,
        landingReceipts: () => production.landingReceipts(),
      }),
    ).toMatchObject({
      landed: {
        kind: "build",
        selection: "exact",
        revision: landing,
        runId: 103,
      },
    });
  });
}
