// Real matching over raw namespaced launch/history documents and a controlled
// clock; optional local evidence never replaces published endpoint facts.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  baseline,
  landing,
  completion,
  comparisonProject,
} from "../support/comparisonRead.ts";
import {
  finalityComparisonFacts,
  finalityIdentity,
  finalityRun,
  trunkSide,
} from "../support/finalityComparisonFacts.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import { capturedComparisonLanding } from "../../tests/support/capturedComparisonLanding.ts";
import {
  expect,
  test,
  observedComparisonSource,
  comparisonAcquisitions,
} from "../support/comparisonMemory.ts";
import type { LandingReceiptFacts } from "../../server/landedCiReceipt.ts";

const hour = 3_600_000;
const receivedAt = "2026-11-05T15:00:00.000Z";
const captureFacts = {
  identity: finalityIdentity,
  baseline,
  landingMerge: landing,
};
const record = (capture: ReturnType<typeof capturedComparisonLanding>) =>
  makeMe.aLaunchRecord
    .executing({
      source: comparisonProject.id,
      identity: finalityIdentity,
      title: "Comparison",
    })
    .withCapturedLanding(capture)
    .please();

for (const capture of ["launch", "retained history"] as const) {
  test(`${capture} fixes the earliest matching receipt hour without moving the deadline`, async ({
    comparisonRead,
  }) => {
    const facts = finalityComparisonFacts("code");
    const earliest = capturedComparisonLanding(captureFacts, receivedAt);
    const duplicate = capturedComparisonLanding(
      captureFacts,
      "2026-11-05T15:20:00.000Z",
      {
        receipt: "55555555-5555-4555-8555-555555555555",
      },
    );
    const old = "2026-11-05T13:00:00.000Z";
    const wrongProject = capturedComparisonLanding(captureFacts, old);
    const records = [
      capturedComparisonLanding(captureFacts, old, {
        target: "refs/heads/other",
      }),
      capturedComparisonLanding(captureFacts, old, {
        identity: "SEED-other#story",
      }),
      capturedComparisonLanding(captureFacts, old, { revision: trunkSide }),
      capturedComparisonLanding(captureFacts, old, { revision: completion }),
      ...(capture === "launch" ? [duplicate, earliest] : []),
    ].map(record);
    const launchesByProject = new Map([
      [comparisonProject.id, records],
      ["other-project", [record(wrongProject)]],
    ]);
    const retained = makeMe.aLandedCiHistory;
    const receipts: LandingReceiptFacts = {
      launchesByProject,
      retained: {
        kind: "document",
        document: {
          [comparisonProject.id]:
            capture === "launch"
              ? retained.please()
              : retained
                  .pending(duplicate, { kind: "pending", waitsFor: "run" })
                  .pending(earliest, { kind: "pending", waitsFor: "run" })
                  .please(),
          "other-project": retained
            .pending(wrongProject, { kind: "pending", waitsFor: "run" })
            .please(),
        },
      },
    };
    let now = Date.parse(receivedAt) + hour - 1;
    const observed = observedComparisonSource(
      storyCiComparisonEvidence({ ...facts, now: () => now, receipts }).source,
    );
    const before = await comparisonRead(observed.source);
    expect(before).toMatchObject({
      landed: { kind: "none", requestedStatus: { kind: "no-build" } },
    });
    const pending = comparisonAcquisitions(observed);
    await comparisonRead(observed.source);
    expect(observed.reads.runs).toBeGreaterThan(pending.reads.runs);
    if (capture === "retained history") launchesByProject.clear();
    now += 1;
    const final = await comparisonRead(observed.source);
    expect(final).toMatchObject({
      landed: { kind: "none", requestedStatus: { kind: "no-build" } },
    });
    const answered = comparisonAcquisitions(observed);
    facts.runs.push(finalityRun(landing, 103));
    expect(await comparisonRead(observed.source)).toBe(final);
    expect(comparisonAcquisitions(observed)).toEqual(answered);
  });
}

for (const capture of [
  "unrelated",
  "legacy history",
  "unreadable launch",
  "unreadable history",
] as const) {
  test(`${capture} cannot supply age or hide published completion`, async ({
    comparisonRead,
  }) => {
    const facts = finalityComparisonFacts("code");
    const old = "2026-11-05T13:00:00.000Z";
    const matching = capturedComparisonLanding(captureFacts, old);
    const { target, ...legacy } = matching;
    expect(target).toBe("refs/heads/main");
    const receipts: LandingReceiptFacts =
      capture === "unreadable launch"
        ? {
            launchesByProject: undefined,
            retained: { kind: "document", document: {} },
          }
        : capture === "unreadable history"
          ? {
              launchesByProject: new Map(),
              retained: { kind: "unreadable" },
            }
          : capture === "legacy history"
            ? {
                launchesByProject: new Map(),
                retained: {
                  kind: "document",
                  document: {
                    [comparisonProject.id]: makeMe.aLandedCiHistory
                      .pendingLanding({ ...legacy, waitsFor: "run" })
                      .please(),
                  },
                },
              }
            : {
                launchesByProject: new Map([
                  ["other-project", [record(matching)]],
                  [
                    comparisonProject.id,
                    [
                      capturedComparisonLanding(captureFacts, old, {
                        target: "refs/heads/other",
                      }),
                      capturedComparisonLanding(captureFacts, old, {
                        identity: "SEED-999#other",
                      }),
                      capturedComparisonLanding(captureFacts, old, {
                        revision: completion,
                      }),
                    ].map(record),
                  ],
                ]),
                retained: { kind: "document", document: {} },
              };
    const observed = observedComparisonSource(
      storyCiComparisonEvidence({
        ...facts,
        now: () => Date.parse(receivedAt) + 3 * hour,
        receipts,
      }).source,
    );
    expect(await comparisonRead(observed.source)).toMatchObject({
      landed: { kind: "none" },
    });
    facts.runs.push(finalityRun(landing, 103));
    expect(await comparisonRead(observed.source)).toMatchObject({
      landed: {
        kind: "build",
        selection: "exact",
        revision: landing,
        runId: 103,
      },
    });
  });
}
