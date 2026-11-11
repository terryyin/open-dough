// The reader already open before deployment and the current reader consume
// the same collected history through the real local authenticated boundary.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  readIntentCiDoneWallTimeHistory,
  readIntentCiHistory,
} from "../../src/authenticatedIntentCiHistoryRead.ts";
import { finalGapReasons } from "../../src/landedCiHistory.ts";
import { gapReasonWords } from "../../src/ciHistoryGapWords.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { keepLandedCiHistory } from "../../tests/support/landedCiHistory.ts";
import {
  landedCiHistorySchema as previousHistorySchema,
  measuredHistoryOf as previousMeasuredHistoryOf,
} from "../../tests/support/previousCiHistoryReader/landedCiHistory.ts";
import { gapReasonWords as previousGapReasonWords } from "../../tests/support/previousCiHistoryReader/ciHistoryGapWords.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { ciReadingTransport } from "../support/ciReadingTransport.ts";

test.use({ serverMode: "boundary" });

test("the previous reader keeps measured builds and understandable gaps by default; current project and Done readers request specific new reasons", async ({
  dashboard,
  github,
}) => {
  const facts = (index: number) => ({
    receipt: `30500000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    revision: index.toString(16).padStart(2, "0").repeat(20),
    receivedAt: "2026-11-05T10:00:00Z",
    runId: 300 + index,
    startedAt: "2026-11-05T10:01:00Z",
    completedAt: "2026-11-05T10:03:00Z",
  });
  // Exercise every current final reason against an independently frozen
  // reader, so adding a future reason also exercises this compatibility gate.
  const history = makeMe.aLandedCiHistory;
  for (const [index, reason] of finalGapReasons.entries()) {
    const landing = facts(index + 1);
    if (reason === "failed") history.failedLanding(landing);
    else if (reason === "not-recorded" || reason === "timing-basis")
      history.recording(
        makeMe.aLaunchLanding
          .comparing({ base: "b".repeat(40), revision: landing.revision })
          .deliveredAs({ delivery: landing.receipt, receipt: landing.receipt })
          .receivedAt(landing.receivedAt)
          .please(),
        `run/${landing.runId}/1`,
        {
          revision: landing.revision,
          state: "pass",
          runId: landing.runId,
          runAttempt: 1,
          startedAt: landing.startedAt,
          completedAt:
            reason === "not-recorded"
              ? landing.receivedAt
              : landing.completedAt,
          timingBasis: reason === "timing-basis" ? undefined : "attempt-start",
        },
      );
    else history.unmeasuredLanding({ ...landing, reason });
  }
  const measured = facts(finalGapReasons.length + 1);
  history
    .measuredLanding(measured)
    .inTrunkOrder(
      Array.from(
        Array<number>(finalGapReasons.length + 1).keys(),
        (i) => facts(i + 1).revision,
      ),
    );
  await keepLandedCiHistory(dashboard.home, history.please());
  const source = makeMe.aPublishedSource
    .with({
      id: "open-dough",
      label: "Open Dough",
      repository: "terryyin/open-dough",
    })
    .please();
  const endpoint = { revision: measured.revision, at: measured.receivedAt };
  const answer = async (query: URLSearchParams) => {
    const response = await rawRequest({
      url: `${dashboard.origin}/__authenticated-read?${query}`,
      headers: { Origin: dashboard.origin },
    });
    expect(response.status).toBe(200);
    return JSON.parse(response.body) as unknown;
  };
  const before = github.calls.length;
  for (const selected of [false, true]) {
    const query = new URLSearchParams({
      source: source.id,
      intent: "ci-history",
    });
    if (selected) {
      query.set("revision", endpoint.revision);
      query.set("through", endpoint.at);
    }
    const previous = previousMeasuredHistoryOf(
      previousHistorySchema.parse(await answer(query)),
    );
    expect(previous).toBeDefined();
    expect(previous?.entries.filter((entry) => entry.kind === "point")).toEqual(
      [
        expect.objectContaining({
          revision: measured.revision,
          wallTimeMs: 120000,
        }),
      ],
    );
    const oldGaps = previous?.entries.filter((entry) => entry.kind === "gap");
    expect(oldGaps).toHaveLength(finalGapReasons.length);
    expect(
      oldGaps?.every((gap) => previousGapReasonWords(gap).length > 0),
    ).toBe(true);
    const timingRevision = facts(
      finalGapReasons.indexOf("timing-basis") + 1,
    ).revision;
    const compatibleGap = oldGaps?.find(
      ({ revision }) => revision === timingRevision,
    );
    expect(compatibleGap?.reason).toBe("not-recorded");
    if (compatibleGap === undefined) throw new Error("Missing compatible gap");
    expect(previousGapReasonWords(compatibleGap)).toBe(
      "CI wall time not recorded",
    );

    const transport = ciReadingTransport(async (requested) =>
      Response.json(await answer(requested)),
    );
    try {
      const current = selected
        ? await readIntentCiDoneWallTimeHistory(
            source,
            endpoint,
            new AbortController().signal,
          )
        : await readIntentCiHistory(source, new AbortController().signal);
      const request = transport.requests[0];
      if (request === undefined)
        throw new Error("Missing current history request");
      expect(
        new URL(request.url, dashboard.origin).searchParams.get("gap-reasons"),
      ).toBe("timing-basis");
      expect(current.entries.filter((entry) => entry.kind === "point")).toEqual(
        previous?.entries.filter((entry) => entry.kind === "point"),
      );
      const specific = current.entries.find(
        (entry) => entry.kind === "gap" && entry.revision === timingRevision,
      );
      expect(specific).toMatchObject({ kind: "gap", reason: "timing-basis" });
      if (specific?.kind !== "gap") throw new Error("Missing specific gap");
      expect(gapReasonWords(specific)).toBe(
        "Retained attempt-start timing basis is unverified",
      );
      // The frozen reader really rejects this new vocabulary: using the
      // current schema here would let the original whole-answer outage pass.
      expect(previousHistorySchema.safeParse(current).success).toBe(false);
    } finally {
      transport.restore();
    }
  }
  expect(github.calls).toHaveLength(before);
});

test("history capability negotiation refuses unsupported or repeated values and mixed scope reads", async ({
  dashboard,
}) => {
  for (const query of [
    "gap-reasons=unknown",
    "gap-reasons=",
    "gap-reasons=timing-basis&gap-reasons=timing-basis",
    `scope=tests&revision=${"b".repeat(40)}&through=2026-11-05T10:00:00Z&gap-reasons=timing-basis`,
  ]) {
    const response = await rawRequest({
      url: `${dashboard.origin}/__authenticated-read?source=open-dough&intent=ci-history&${query}`,
      headers: { Origin: dashboard.origin },
    });
    expect(response.status).toBe(400);
  }
});
