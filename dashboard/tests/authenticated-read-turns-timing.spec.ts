// Where one boundary request's time went, told in its answer's
// `Server-Timing` (../server/readTiming.ts), at the local authenticated read
// boundary over real HTTP with the synthetic `gh`: its wait for a turn at
// GitHub apart from its `gh` time, while GitHub holds every answer and
// releases them one at a time (./support/turnReads.ts). Compared with this
// machine's clock across events the test orders, never with a duration of
// its own choosing. The turns themselves: ./authenticated-read-turns.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import { onServerOfItsOwn } from "./support/directedWait.ts";
import type { RawResponse } from "./support/rawHttp.ts";
import { readAt } from "./support/sharedReads.ts";
import {
  arrived,
  revisionOf,
  seedPaths,
  seedRead,
  servedInTurn,
  turns,
  underWay,
} from "./support/turnReads.ts";

// One answer's `Server-Timing` metrics by name: whole milliseconds, and the
// description when it has one.
function serverTiming(
  answer: RawResponse,
): Readonly<Record<string, { readonly dur: number; readonly desc?: string }>> {
  const header = answer.headers["server-timing"];
  if (typeof header !== "string") {
    throw new Error("The answer carries no Server-Timing header.");
  }
  return Object.fromEntries(
    header.split(", ").map((metric) => {
      const [name, dur, desc] = metric.split(";");
      if (name === undefined || !/^dur=\d+$/.test(dur ?? "")) {
        throw new Error(`Not a Server-Timing metric: ${metric}`);
      }
      return [
        name,
        {
          dur: Number(dur?.slice("dur=".length)),
          ...(desc !== undefined && {
            desc: desc.replace(/^desc="(.*)"$/, "$1"),
          }),
        },
      ];
    }),
  );
}

test("an answer's Server-Timing names its wait for a turn, its gh time, the rest, and the total: a read GitHub holds spent the hold in gh, one waiting its turn spent the wait in admission, and one answered from memory or refused spent neither", async () => {
  await onServerOfItsOwn(async (server) => {
    const revision = revisionOf("8f");
    const held = await servedInTurn(server, revision);
    const first = await underWay(
      server,
      revision,
      held.before,
      seedPaths.slice(0, turns),
    );
    // Every turn's read has reached GitHub, so each was asked before now.
    const atGitHub = Date.now();
    const [waitingPath] = seedPaths.slice(turns) as [string];
    const waiting = readAt(server, seedRead(revision, waitingPath));
    // Answered once the ninth read waits its turn, with no `gh` of its own.
    const refused = await readAt(server, "&revision=main");
    expect(refused.status).toBe(400);
    const inLine = Date.now();
    const fromMemory = await readAt(server, `&revision=${revision}`);
    expect(fromMemory.status).toBe(200);
    // The hold and the wait both span at least one tick of the clock.
    await expect.poll(() => Date.now() - inLine).toBeGreaterThan(0);
    const heldFor = Date.now() - atGitHub;
    const queuedFor = Date.now() - inLine;

    held.releaseOldest();
    await arrived(server, held.before, turns + 1);
    held.releaseAll();
    const answers = await Promise.all([...first, waiting]);
    expect(answers.map(({ status }) => status)).toEqual(
      [...first, waiting].map(() => 200),
    );

    const timings = answers.map(serverTiming);
    for (const timing of [
      ...timings,
      serverTiming(refused),
      serverTiming(fromMemory),
    ]) {
      expect(Object.keys(timing)).toEqual(["admission", "gh", "rest", "total"]);
      expect(timing["rest"]?.dur).toBeLessThanOrEqual(
        timing["total"]?.dur ?? 0,
      );
    }
    for (const timing of timings.slice(0, turns)) {
      expect(timing["gh"]?.desc).toBe("1 call");
      expect(timing["gh"]?.dur).toBeGreaterThanOrEqual(heldFor);
      expect(timing["total"]?.dur).toBeGreaterThanOrEqual(heldFor);
    }
    const queued = timings[turns];
    expect(queued?.["gh"]?.desc).toBe("1 call");
    expect(queued?.["admission"]?.dur).toBeGreaterThanOrEqual(queuedFor);
    expect(queuedFor).toBeGreaterThan(0);
    for (const unasked of [serverTiming(refused), serverTiming(fromMemory)]) {
      expect(unasked["admission"]).toEqual({ dur: 0 });
      expect(unasked["gh"]).toEqual({ dur: 0, desc: "0 calls" });
    }
  });
});
