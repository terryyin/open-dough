// Each answer's `Server-Timing` (../../server/readTiming.ts) at the local
// authenticated read boundary (../../server/authenticatedRead.ts), in process
// over real HTTP with a real CLI `gh` answering from a fake GitHub: it names
// admission, `gh`, rest and total, attributing time to where the read spent
// it relative to events at GitHub. Sharing between simultaneous reads:
// ./authenticated-read-shared-requests.spec.ts.

import { afterAll, beforeAll, expect, test } from "vitest";
import { execGh } from "../../server/ghRead.ts";
import { startInProcessAuthenticatedRead } from "../../test-support/support/inProcessAuthenticatedRead.ts";
import {
  everyRepository,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import { heldInTurn } from "../../test-support/support/heldGitHubAnswer.ts";
import type { RawResponse } from "../../test-support/support/rawHttp.ts";
import {
  otherSeedPath,
  readAt,
  sharedReadsPublished,
  sharedSeedRead,
} from "../../test-support/support/sharedReads.ts";

const turns = 8;

let boundary: Awaited<ReturnType<typeof startInProcessAuthenticatedRead>>;
let server: Parameters<typeof readAt>[0] & { readonly github: FakeGitHub };

beforeAll(async () => {
  boundary = await startInProcessAuthenticatedRead({ ghTransport: "cli" });
  server = {
    baseURL: boundary.origin,
    origin: boundary.origin,
    github: boundary.github,
  };
});

afterAll(async () => {
  await boundary.close();
});

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
      const [name = "", dur = "", desc] = metric.split(";");
      if (!/^dur=\d+$/.test(dur)) {
        throw new Error(`Not a Server-Timing metric: ${metric}`);
      }
      return [
        name,
        {
          dur: Number(dur.slice("dur=".length)),
          ...(desc !== undefined && {
            desc: desc.replace(/^desc="(.*)"$/, "$1"),
          }),
        },
      ];
    }),
  );
}

test("an answer's Server-Timing names admission, gh, rest and total: a held read spent the hold in gh, a queued one its wait in admission, and one answered from memory or refused spent neither", async () => {
  const revision = "8f".repeat(20);
  const published = sharedReadsPublished(revision);
  server.github.serve(everyRepository, published);
  expect((await readAt(server, `&revision=${revision}`)).status).toBe(200);
  const held = heldInTurn(published, ({ kind }) => kind === "content");
  const arrivals: (() => void)[] = [];
  server.github.serve(everyRepository, (call) => {
    const answer = held.answer(call);
    arrivals.shift()?.();
    return answer;
  });
  const arrival = () =>
    new Promise<void>((arrived) => {
      arrivals.push(arrived);
    });
  const before = server.github.calls.length;

  // The pinned read reaches GitHub first; seven calls of this process's own
  // take the remaining turns.
  let reaching = arrival();
  const atGitHub = readAt(server, sharedSeedRead(revision));
  await reaching;
  const reachedAt = Date.now();
  const busy = [];
  for (let index = 1; index < turns; index += 1) {
    reaching = arrival();
    busy.push(
      execGh(
        [
          "api",
          "-H",
          "Accept: application/vnd.github.raw",
          `repos/terryyin/open-dough/contents/busy-${String(index)}.md?ref=${revision}`,
        ],
        new AbortController().signal,
      ),
    );
    await reaching;
  }
  const queued = readAt(
    server,
    `&revision=${revision}&path=${encodeURIComponent(otherSeedPath)}`,
  );
  // Answered while every turn is taken, with no `gh` call of its own.
  const refused = await readAt(server, "&revision=main");
  expect(refused.status).toBe(400);
  const queuedSince = Date.now();
  const fromMemory = await readAt(server, `&revision=${revision}`);
  expect(fromMemory.status).toBe(200);
  await expect.poll(() => Date.now() - queuedSince).toBeGreaterThan(0);
  const heldFor = Date.now() - reachedAt;
  const queuedFor = Date.now() - queuedSince;
  expect(server.github.calls.length - before).toBe(turns);

  reaching = arrival();
  held.releaseOldest();
  await reaching;
  held.releaseAll();
  const answers = await Promise.all([atGitHub, queued]);
  await Promise.all(busy);
  expect(answers.map(({ status }) => status)).toEqual([200, 200]);

  const [heldTiming, queuedTiming] = answers.map(serverTiming);
  for (const timing of [
    heldTiming,
    queuedTiming,
    serverTiming(refused),
    serverTiming(fromMemory),
  ]) {
    expect(Object.keys(timing ?? {})).toEqual([
      "admission",
      "gh",
      "rest",
      "total",
    ]);
    expect(timing?.["rest"]?.dur).toBeLessThanOrEqual(
      timing?.["total"]?.dur ?? 0,
    );
  }
  expect(heldTiming?.["gh"]?.desc).toBe("1 call");
  expect(heldTiming?.["gh"]?.dur).toBeGreaterThanOrEqual(heldFor);
  expect(heldTiming?.["total"]?.dur).toBeGreaterThanOrEqual(heldFor);
  expect(queuedTiming?.["gh"]?.desc).toBe("1 call");
  expect(queuedTiming?.["admission"]?.dur).toBeGreaterThanOrEqual(queuedFor);
  for (const unasked of [serverTiming(refused), serverTiming(fromMemory)]) {
    expect(unasked["admission"]).toEqual({ dur: 0 });
    expect(unasked["gh"]).toEqual({ dur: 0, desc: "0 calls" });
  }
});
