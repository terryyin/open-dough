// This user's incident record (../../server/incidentRecord.ts) through the
// local diagnostics read (../../server/readDiagnostics.ts): a replaced
// server lists the failed reads an earlier one retained, with where each
// failed and the request owner it was sent to, in private files that hold
// nothing secret. This process's own failures:
// ./authenticated-read-diagnostics.spec.ts. The record's bounds:
// ./authenticated-read-incident-record-bounds.spec.ts.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  privateRequestOwner,
  withdrawRequestOwners,
} from "../../../Distribution/tests/skills/dough-execute-plan/github-request-owner-test-fixtures.mjs";
import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  everyRepository,
  failsWith,
  hangs,
  publishes,
  startFakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import { httpErrorAnswer } from "../../test-support/originAnswers.ts";
import { checkedAt, pinnedAt } from "../../test-support/support/sharedReads.ts";
import { defaultRepository } from "../../test-support/publishedOriginBasics.ts";
import { expectServedHomesReach } from "../../test-support/support/fixtureOriginRoute.ts";
import {
  incidentEntries,
  incidentFiles,
  inspect,
  knownSourceId,
  secretMarker,
  developmentBoundary,
  startDashboardServer,
} from "../../test-support/support/readDiagnostics.ts";

test("a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-incidents-"));
  const owner = privateRequestOwner();
  const github = await startFakeGitHub();
  try {
    const first = await startDashboardServer({
      ...developmentBoundary,
      liveServer: "separate process",
      machine,
      github,
      requestOwnerRoot: owner.root,
      extraEnv: { GH_TOKEN: secretMarker },
    });
    let standing: {
      pid: number;
      generation: number;
      protocol: number;
      secrets: string[];
    };
    try {
      // A read that succeeds starts the owner, whose record names its
      // socket and caller token.
      const published = publishes({});
      github.serve(everyRepository, published);
      expectServedHomesReach(github, defaultRepository, published.revision);
      const initial = await checkedAt(first);
      expect(initial.status).toBe(200);
      expect(JSON.parse(initial.body)).toMatchObject({
        revision: published.revision,
      });
      const [record] = owner.records() as {
        pid: number;
        protocol: number;
        socket: string;
        token: string;
        directory: string;
        file: string;
      }[];
      if (record === undefined) throw new Error("no request owner stood");
      const socketPath = path.join(record.directory, record.socket);
      standing = {
        pid: record.pid,
        generation: Number(/owner\.(\d+)\.json$/.exec(record.file)?.[1]),
        protocol: record.protocol,
        secrets: [secretMarker, socketPath, record.token, owner.root],
      };
      // GitHub refuses: an upstream failure, whose body names the owner's
      // socket path and a token.
      github.serve(everyRepository, () =>
        Promise.resolve(
          httpErrorAnswer(403, `forbidden ${socketPath} ${secretMarker}`),
        ),
      );
      expect((await pinnedAt(first)).status).toBe(502);
      // `gh` fails after the owner asked: where it failed is unknown.
      github.serve(
        everyRepository,
        failsWith(`fatal: dial ${socketPath}\nGH_TOKEN=${secretMarker}\n`),
      );
      expect((await pinnedAt(first)).status).toBe(502);
      // The owner ends while the read waits on it: a local failure.
      github.serve(everyRepository, hangs);
      const callsBefore = first.ghCalls().length;
      const held = pinnedAt(first);
      await expect
        .poll(() => first.ghCalls().length, { timeout: 10_000 })
        .toBeGreaterThan(callsBefore);
      withdrawRequestOwners(owner.root);
      expect((await held).status).toBe(502);
      // Written to the record, which the request never waited for.
      await expect
        .poll(
          () =>
            incidentEntries(machine).filter(
              (entry) => entry.kind === "failed-read",
            ).length,
          { timeout: 10_000 },
        )
        .toBe(3);
    } finally {
      await first.close();
    }

    const second = await startDashboardServer({
      ...developmentBoundary,
      liveServer: "separate process",
      machine,
      github,
    });
    try {
      const callsBefore = second.ghCalls().length;
      const seen = await inspect(second);
      expect(seen.status).toBe(200);
      // Nothing failed in this process; the earlier one's failures remain.
      expect(seen.failures).toEqual([]);
      const listed = seen.record.failures;
      expect(listed.map((entry) => entry.failureCategory)).toEqual([
        "local",
        "unknown",
        "upstream",
      ]);
      const times = listed.map((entry) => Date.parse(entry.at));
      expect(times).toEqual(times.toSorted((a, b) => b - a));
      for (const entry of listed) {
        expect(entry).toMatchObject({
          kind: "failed-read",
          source: knownSourceId,
          category: "content",
          ownerPid: standing.pid,
          ownerGeneration: standing.generation,
          ownerProtocol: standing.protocol,
        });
        expect(entry.ownerProtocol).toEqual(expect.any(Number));
        expect(entry.pid).not.toBe(second.pid);
        expect(entry.processAgeMs).toBeGreaterThan(0);
        expect(entry.revision).toMatch(/^[0-9a-f]{40}$/);
      }
      const [local, unknown, upstream] = listed;
      expect(local).toMatchObject({
        cause: "owner-unavailable",
        ownerCause: "connection-lost",
        dispatched: false,
      });
      expect(local?.queueWaitMs).toBeUndefined();
      expect(local?.status).toBeUndefined();
      expect(unknown).toMatchObject({ cause: "failed", dispatched: true });
      expect(unknown?.queueWaitMs).toBeGreaterThanOrEqual(0);
      expect(unknown?.status).toBeUndefined();
      expect(upstream).toMatchObject({
        cause: "http",
        status: 403,
        dispatched: true,
      });
      expect(upstream?.queueWaitMs).toBeGreaterThanOrEqual(0);
      expect(seen.record.dropped).toBe(0);
      expect(Date.parse(seen.record.startedAt ?? "")).toBeLessThanOrEqual(
        Math.min(...times),
      );
      expect(second.ghCalls()).toHaveLength(callsBefore);

      const kept = incidentFiles(machine);
      expect(kept.mode).toBe(0o700);
      expect(kept.files.map((file) => file.name).toSorted()).toEqual([
        "entries.jsonl",
        "record.json",
      ]);
      for (const file of kept.files) expect(file.mode).toBe(0o600);
      for (const secret of standing.secrets) {
        expect(seen.body).not.toContain(secret);
        for (const file of kept.files) expect(file.text).not.toContain(secret);
      }
      for (const raw of ["forbidden", "fatal:", "GH_TOKEN", "dial "]) {
        expect(seen.body).not.toContain(raw);
        for (const file of kept.files) expect(file.text).not.toContain(raw);
      }
    } finally {
      await second.close();
    }
  } finally {
    await owner.end();
    await github.close();
    rmSync(machine, { recursive: true, force: true });
  }
});
