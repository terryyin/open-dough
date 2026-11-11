// A landed CI history a case keeps (../../tests/support/landedCiHistory.ts)
// on a machine whose dashboard server is collecting is the history that
// machine keeps. A collector's replacement in flight
// (../../server/machineJsonStore.ts) read the file before the case kept its
// own, so it must not replace the case's history with what it read.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { z } from "zod";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { replaceMachineJson } from "../../server/machineJsonStore.ts";
import { historyFile } from "../../tests/support/collectedScopeHistory.ts";
import {
  keepLandedCiHistory,
  keptLandedCiHistory,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/pageTest.ts";

// One landing whose own build took `seconds`.
function historyMeasuring(seconds: number) {
  const receivedAt = "2026-11-10T06:00:00.000Z";
  return makeMe.aLandedCiHistory
    .measuredLanding({
      receipt: "11111111-0000-4000-8000-000000000001",
      revision: "a".repeat(40),
      receivedAt,
      runId: 1,
      startedAt: receivedAt,
      completedAt: new Date(
        Date.parse(receivedAt) + seconds * 1000,
      ).toISOString(),
    })
    .please();
}

test("a history a case keeps while a collector's replacement is in flight is the one the machine keeps", async () => {
  const home = mkdtempSync(path.join(tmpdir(), "dough-kept-history-"));
  try {
    await keepLandedCiHistory(home, historyMeasuring(100));
    let collectorRead!: () => void;
    const untilCollectorRead = new Promise<void>((resolve) => {
      collectorRead = resolve;
    });
    let caseAsked!: () => void;
    const untilCaseAsked = new Promise<void>((resolve) => {
      caseAsked = resolve;
    });
    // A collection pass that keeps what it read, as one that changes nothing
    // does, held between its read and its replacement.
    const collected = replaceMachineJson(
      {
        file: historyFile(home),
        schema: z.record(z.string(), z.unknown()),
        empty: {},
      },
      async (read) => {
        collectorRead();
        await untilCaseAsked;
        return read;
      },
    );
    await untilCollectorRead;
    const kept = keepLandedCiHistory(home, historyMeasuring(300));
    caseAsked();
    await Promise.all([collected, kept]);
    expect(keptLandedCiHistory(home)).toEqual(historyMeasuring(300));
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
