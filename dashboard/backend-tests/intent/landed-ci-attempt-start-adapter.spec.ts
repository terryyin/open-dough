// Retained adapter bounds are refreshed only from that discovered attempt.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { adapterProject } from "../../tests/intentCiAdapterProofProject.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  keepLandedCiHistory,
  landedCiHistory,
  restartAsLandedCiReader,
} from "../../tests/support/landedCiHistory.ts";
import { publishedLanding } from "../../tests/support/landedCiTrunk.ts";
import { buildKeyOf } from "../../src/landedCiBuildKey.ts";

test.use({ serverMode: "boundary" });

test("legacy adapter timing refreshes the original opaque attempt, never the newer discovered attempt; restart reads locally", async ({
  origin,
  startServer,
  github,
}) => {
  const home = path.join(origin.machine, "home");
  const recorded = await publishedLanding(origin, {
    title: "adapter",
    receipt: "ffffffff-0000-4000-8000-000000000001",
    at: "2026-11-05T09:00:00Z",
  });
  const original = makeMe.aCiAdapterAttempt
    .passed({
      sha: recorded.revision,
      runId: "original/run",
      attemptId: "first:1",
      branch: "main",
      startedAt: "2026-11-05T10:01:00Z",
      completedAt: "2026-11-05T10:03:00Z",
    })
    .please();
  const newer = makeMe.aCiAdapterAttempt
    .passed({
      ...original,
      attemptId: "repeat:2",
      startedAt: "2026-11-05T11:00:00Z",
      completedAt: "2026-11-05T11:00:10Z",
    })
    .please();
  const adapter = adapterProject(home);
  adapter.answer({
    discover: { main: [newer, original] },
    proof: { unavailable: "No declared proof" },
  });
  const landing = makeMe.aLaunchLanding
    .comparing({ base: "b".repeat(40), revision: recorded.revision })
    .deliveredAs({ delivery: "adapter", receipt: recorded.receipt })
    .receivedAt(recorded.at)
    .please();
  const adapterAttempt = {
    runId: original.runId,
    attemptId: original.attemptId,
  };
  const build = makeMe.aKeptBuild
    .with({
      revision: recorded.revision,
      state: "pass" as const,
      adapterAttempt,
      runUrl: "https://ci.invalid/builds/original",
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: original.completedAt,
      timingBasis: undefined,
    })
    .please();
  await keepLandedCiHistory(
    home,
    makeMe.aLandedCiHistory
      .inTrunkOrder([recorded.revision])
      .recording(landing, buildKeyOf(build), build)
      .please(),
  );
  const server = await startServer();
  await expect
    .poll(() => landedCiHistory(server))
    .toMatchObject({
      body: {
        entries: [
          {
            kind: "point",
            adapterAttempt,
            startedAt: original.startedAt,
            completedAt: original.completedAt,
          },
        ],
      },
    });
  const reader = await restartAsLandedCiReader(server, origin, "boundary");
  try {
    const requests = adapter.discoverRequests().length;
    expect(await landedCiHistory(reader)).toMatchObject({
      body: {
        entries: [
          { kind: "point", adapterAttempt, startedAt: original.startedAt },
        ],
      },
    });
    expect(adapter.discoverRequests()).toHaveLength(requests);
    expect(
      github.calls.filter(({ request }) => request.kind.startsWith("actions-")),
    ).toEqual([]);
  } finally {
    await reader.close();
  }
});
