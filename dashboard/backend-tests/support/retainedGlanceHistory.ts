// One project's retained trunk history for the history read's glance proofs
// (../intent/ci-history-slim-response.spec.ts,
// ../intent/ci-history-glance-compatibility.spec.ts): five passed prior
// builds of 100 s with 100 ms of `tests` test cases, a failed build among
// them, the Done landing's build of 120 s with 120 ms, and a later landing's
// build, each landing's own exact build, and its local read.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { keepLandedCiHistory } from "../../tests/support/landedCiHistory.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { expect } from "../../tests/support/preparationPage.ts";

const revisionOf = (index: number) =>
  index.toString(16).padStart(2, "0").repeat(20);
const dayOf = (index: number) => `2026-11-${String(index).padStart(2, "0")}`;

// Each landing in trunk order: a passed build's CI wall time and scope time,
// or a failed build.
const landings = [
  { wallMs: 100000, scopeMs: 100 },
  { wallMs: 100000, scopeMs: 100 },
  { wallMs: 100000, scopeMs: 100 },
  { wallMs: 100000, scopeMs: 100 },
  "failed",
  { wallMs: 100000, scopeMs: 100 },
  { wallMs: 120000, scopeMs: 120 },
  { wallMs: 90000, scopeMs: 90 },
] as const;

export const glanceScope = "tests";
export const failedRevision = revisionOf(5);
export const landedRevision = revisionOf(7);
export const laterRevision = revisionOf(8);
// The Done landing as its story publishes it.
export const landedEndpoint = {
  revision: landedRevision,
  at: `${dayOf(7)}T10:00:00Z`,
};
export const glanceSource = makeMe.aPublishedSource
  .with({
    id: "open-dough",
    label: "Open Dough",
    repository: "terryyin/open-dough",
  })
  .please();

export async function keepGlanceHistory(home: string) {
  const history = makeMe.aLandedCiHistory.inTrunkOrder(
    landings.map((...[, index]) => revisionOf(index + 1)),
  );
  for (const [index, landing] of landings.entries()) {
    const runId = index + 1;
    const facts = {
      receipt: `30600000-0000-4000-8000-${String(runId).padStart(12, "0")}`,
      revision: revisionOf(runId),
      receivedAt: `${dayOf(runId)}T10:00:00Z`,
      runId,
      startedAt: `${dayOf(runId)}T09:00:00Z`,
      completedAt: new Date(
        Date.parse(`${dayOf(runId)}T09:00:00Z`) +
          (landing === "failed" ? 60000 : landing.wallMs),
      ).toISOString(),
    };
    if (landing === "failed") {
      history.failedLanding(facts);
      continue;
    }
    history.measuredLanding(facts).proofFor(
      `run/${String(runId)}/1`,
      makeMe.aCiProof
        .forRun({ revision: facts.revision, runId })
        .entries([
          makeMe.aCiProofEntry
            .at(glanceScope)
            .counting(1, "case")
            .timed(landing.scopeMs)
            .please(),
        ])
        .please(),
    );
  }
  await keepLandedCiHistory(home, history.please());
}

// The local authenticated read's JSON answer to `query`.
export async function historyAnswer(
  origin: string,
  query: Record<string, string>,
): Promise<unknown> {
  const response = await rawRequest({
    url: `${origin}/__authenticated-read?${new URLSearchParams({
      source: glanceSource.id,
      intent: "ci-history",
      ...query,
    })}`,
    headers: { Origin: origin },
  });
  expect(response.status).toBe(200);
  return JSON.parse(response.body) as unknown;
}

// The selected Done read's and the scoped read's parameters, without a
// capability.
export const doneHistoryQuery = {
  "gap-reasons": "timing-basis",
  revision: landedEndpoint.revision,
  through: landedEndpoint.at,
};
export const scopeHistoryQuery = {
  scope: glanceScope,
  revision: landedEndpoint.revision,
  through: landedEndpoint.at,
};
