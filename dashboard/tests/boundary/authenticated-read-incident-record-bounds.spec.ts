// Bounds of this user's incident record (../../server/incidentRecord.ts,
// files: ../../server/incidentRecordFiles.ts) across processes: it keeps its
// newest entries within its entry and byte bounds and counts what it
// dropped. Each server also records its start and, on its clean close, its
// end (../../server/incidentLifecycle.ts); its stall threshold is raised so
// no stall a loaded machine causes changes the counts. The record across a
// replacement: ./authenticated-read-incident-record.spec.ts.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { everyRepository } from "../support/fakeGitHub.ts";
import { httpErrorAnswer } from "../originAnswers.ts";
import { rawRequest } from "../support/rawHttp.ts";
import {
  incidentEntryLines,
  incidentFiles,
  inspect,
  knownSourceId,
  secretMarker,
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../support/readDiagnostics.ts";

test("the incident record keeps its newest entries within its entry and byte bounds and counts what it dropped", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-incident-bounds-"));
  const failOnce = async (server: DashboardServer, wave: string) => {
    server.github.serve(everyRepository, () =>
      Promise.resolve(httpErrorAnswer(503, `${wave} ${secretMarker}`)),
    );
    expect(
      (
        await rawRequest({
          url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
          headers: { Origin: server.origin },
        })
      ).status,
    ).toBe(502);
  };
  const entryLines = () => incidentEntryLines(machine);
  const noStalls = { DOUGH_STALL_THRESHOLD_MS: String(600_000) };
  try {
    const byCount = await startDashboardServer({
      ...developmentBoundary,
      machine,
      extraEnv: { ...noStalls, DOUGH_INCIDENT_RECORD_ENTRIES: "3" },
    });
    let startedAt: string | undefined;
    try {
      for (let wave = 1; wave <= 5; wave += 1)
        await failOnce(byCount, `wave-${String(wave)}`);
      await expect
        .poll(async () => (await inspect(byCount)).record.dropped, {
          timeout: 10_000,
        })
        .toBe(3);
      const seen = await inspect(byCount);
      // This process still reports all five; the record keeps the newest
      // three entries, after its start (seq 1) and the first two failures.
      expect(seen.failures).toHaveLength(5);
      expect(seen.record.failures.map((entry) => entry.seq)).toEqual([6, 5, 4]);
      expect(entryLines()).toHaveLength(3);
      startedAt = seen.record.startedAt;
    } finally {
      await byCount.close();
    }

    const lineBytes = Math.max(
      ...entryLines().map((line) => Buffer.byteLength(line) + 1),
    );
    const bytes = 2 * lineBytes + 16;
    const byBytes = await startDashboardServer({
      ...developmentBoundary,
      machine,
      extraEnv: { ...noStalls, DOUGH_INCIDENT_RECORD_BYTES: String(bytes) },
    });
    try {
      await failOnce(byBytes, "wave-6");
      await failOnce(byBytes, "wave-7");
      // Every entry written is kept or counted once pruning settles: the
      // first server's start, five failures, and end, and this one's start
      // and two failures.
      await expect
        .poll(
          async () =>
            (await inspect(byBytes)).record.dropped + entryLines().length,
          { timeout: 10_000 },
        )
        .toBe(10);
      const kept = entryLines();
      expect(
        kept.reduce((total, line) => total + Buffer.byteLength(line) + 1, 0),
      ).toBeLessThanOrEqual(bytes);
      expect(kept.length).toBeGreaterThanOrEqual(1);
      expect(kept.length).toBeLessThanOrEqual(2);
      const seen = await inspect(byBytes);
      expect(seen.record.failures).toHaveLength(
        kept.filter((line) => line.includes('"kind":"failed-read"')).length,
      );
      expect(seen.record.dropped).toBe(10 - kept.length);
      expect(seen.record.startedAt).toBe(startedAt);
      // The newest kept is this process's last failure.
      expect(seen.record.failures[0]).toMatchObject({ seq: 3, status: 503 });
      expect(seen.body).not.toContain(secretMarker);
      for (const file of incidentFiles(machine).files) {
        expect(file.text).not.toContain(secretMarker);
        expect(file.mode).toBe(0o600);
      }
    } finally {
      await byBytes.close();
    }
  } finally {
    rmSync(machine, { recursive: true, force: true });
  }
});
