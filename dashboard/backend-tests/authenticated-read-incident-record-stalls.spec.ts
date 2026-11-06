// How sparsely a dashboard process records its own stalls in this user's
// incident record (../../server/eventLoopWatch.ts): within one window the
// first three are written as they are read, and the rest are folded into one
// entry written when the window ends or the process closes, so a sustained
// stall cannot flood the record. One stall read by the next diagnostics
// read: ./authenticated-read-incident-record-lifecycle.spec.ts.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../tests/support/pageTest.ts";
import { rawRequest } from "../tests/support/rawHttp.ts";
import {
  incidentEntries,
  inspect,
  developmentBoundary,
  startDashboardServer,
  type RecordedStall,
} from "../tests/support/readDiagnostics.ts";

test("stalls past the third in one window are folded into one entry, with the longest delay, their count, and the first one's time, written on close", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-incident-folds-"));
  try {
    // A window no loaded machine ends between the blocks.
    const server = await startDashboardServer({
      ...developmentBoundary,
      machine,
      extraEnv: {
        DOUGH_TEST_EVENT_LOOP_BLOCK: "allow",
        DOUGH_STALL_WINDOW_MS: String(600_000),
      },
    });
    const blocks: { from: number; until: number }[] = [];
    try {
      for (const ms of [800, 800, 800, 800, 1_500]) {
        const blocked = await rawRequest({
          url: `${server.baseURL}/__test/event-loop-block?ms=${String(ms)}`,
          method: "POST",
        });
        expect(blocked.status).toBe(200);
        const times = JSON.parse(blocked.body) as {
          blockedFrom: string;
          blockedUntil: string;
        };
        blocks.push({
          from: Date.parse(times.blockedFrom),
          until: Date.parse(times.blockedUntil),
        });
        // A diagnostics read samples the delay at once, so each block is a
        // stall of its own, never merged with the next.
        expect((await inspect(server)).status).toBe(200);
      }
      // The folded stalls are not written before their window ends.
      const before = (await inspect(server)).record.stalls;
      expect(before).toHaveLength(3);
      for (const stall of before) expect(stall.stalls).toBe(1);
    } finally {
      await server.close();
    }

    const written = incidentEntries(machine).filter(
      (entry): entry is RecordedStall => entry.kind === "stall",
    );
    // A loaded machine may add stalls of its own; each is counted too.
    expect(written).toHaveLength(4);
    const [first, second, third, folded] = written;
    for (const stall of [first, second, third]) expect(stall?.stalls).toBe(1);
    expect(folded?.stalls).toBeGreaterThanOrEqual(2);
    expect(
      written.reduce((total, stall) => total + stall.stalls, 0),
    ).toBeGreaterThanOrEqual(blocks.length);
    // The longest delay folded: the last block's.
    expect(folded?.delayMs).toBeGreaterThanOrEqual(1_400);
    const [, , , fourth, last] = blocks;
    // The first folded stall's time, no later than the fourth block, not the
    // longest one's.
    const foldedAt = Date.parse(folded?.at ?? "");
    expect(foldedAt).toBeGreaterThanOrEqual(Date.parse(third?.at ?? ""));
    expect(foldedAt).toBeLessThanOrEqual(fourth?.until ?? 0);
    expect(foldedAt).toBeLessThan((last?.from ?? 0) - 250);
    expect(folded?.loadAverage).toHaveLength(3);
    expect(folded?.revision).toMatch(/^[0-9a-f]{40}$/);
  } finally {
    rmSync(machine, { recursive: true, force: true });
  }
});
