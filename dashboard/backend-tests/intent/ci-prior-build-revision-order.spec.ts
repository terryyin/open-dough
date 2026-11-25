// Measured builds that were not themselves dashboard landings still need
// local revision order. No completion date can establish this boundary.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  parseIntentCiHistoryRead,
  performIntentCiHistoryRead,
} from "../../server/intentCiHistoryRead.ts";
import { commonGitDir } from "../../test-support/support/launchLanding.ts";
import { keepLandedCiHistory } from "../../test-support/support/landedCiHistory.ts";
import { landedTrunk } from "../../test-support/support/landedCiTrunk.ts";
import { startOrigin } from "../../test-support/support/startOrigin.ts";

const source = makeMe.aPublishedSource.openDough.please();
let home = "";

afterEach(() => {
  if (home !== "") rmSync(home, { recursive: true, force: true });
  home = "";
});

test("the local history read orders unrecorded measured revisions and excludes a future proxy from an earlier landing", async () => {
  home = mkdtempSync(path.join(tmpdir(), "ci-prior-build-revision-order-"));
  const origin = await startOrigin();
  try {
    const names = [
      "prior",
      "measured-between",
      "cancelled-before",
      "selected",
      "future",
    ];
    const trunk = landedTrunk(
      origin,
      names.map((title) => ({ title, kind: "code" })),
      ["prior", "cancelled-before", "selected"],
    );
    const builder = makeMe.aLandedCiHistory.inTrunkOrder(
      trunk.landings.map((landing) => landing.revision),
    );
    for (const [title, measured, runId, selection] of [
      ["prior", "measured-between", 1, "later"],
      ["cancelled-before", "future", 2, "later"],
      ["selected", "selected", 3, "exact"],
    ] as const) {
      const facts = trunk.landing(title);
      const revision = trunk.revision(measured);
      const landing = makeMe.aLaunchLanding
        .capturedFrom({ repository: commonGitDir(origin.project) })
        .comparing({ base: trunk.revision("prior"), revision: facts.revision })
        .deliveredAs({ delivery: facts.receipt, receipt: facts.receipt })
        .receivedAt(facts.at)
        .please();
      builder.recording(
        landing,
        `run/${runId}/1`,
        makeMe.aKeptBuild
          .with({
            revision,
            state: "pass",
            runId,
            runAttempt: 1,
            // All wall times and timestamps are identical; they cannot order builds.
            startedAt: "2026-11-05T10:00:00Z",
            completedAt: "2026-11-05T10:01:40Z",
            proof: makeMe.aCiProof
              .forRun({ revision, runId })
              .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
              .please(),
          })
          .please(),
        selection,
      );
    }
    await keepLandedCiHistory(home, builder.please());
    const named = parseIntentCiHistoryRead(
      new URLSearchParams({
        source: "open-dough",
        intent: "ci-history",
      }),
    );
    expect(named).toMatchObject({ kind: "intent-ci-history" });
    if (named?.kind !== "intent-ci-history")
      throw new Error("expected intent-ci-history read");
    const outcome = await performIntentCiHistoryRead(source, named, {
      home,
      localRepository: origin.project,
    });
    expect(outcome).toMatchObject({
      kind: "answered",
      answer: {
        reference: {
          endpoint: trunk.revision("selected"),
          sampleCount: 1,
          selected: { key: "run/3/1", ms: 100000 },
          evidence: [
            { key: "run/1/1", status: "included", ms: 100000 },
            {
              key: "run/2/1",
              status: "excluded",
              reason: "Measured build is at or after the selected endpoint",
            },
            { key: "run/3/1", status: "selected", ms: 100000 },
          ],
        },
      },
    });
  } finally {
    origin.cleanup();
  }
});
