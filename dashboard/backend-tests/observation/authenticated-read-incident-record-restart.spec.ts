// A dev server restarted in place keeps the incident record
// (../../server/incidentRecord.ts) of each of its instances apart: Vite
// restarts the server in the same process when a file its config imports
// changes, loading the record's module again, and the restarted instance's
// entries and lifecycle stay its own (../../server/incidentProcesses.ts).
// A dev server that `restartable` starts (../../tests/fixtures/restarting-dev-server.mjs)
// restarts on SIGUSR2, as an edit to a server file would. A process's
// lifecycle without a restart: ./authenticated-read-incident-record-lifecycle.spec.ts.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../../tests/support/pageTest.ts";
import { everyRepository } from "../../tests/support/fakeGitHub.ts";
import { httpErrorAnswer } from "../../tests/originAnswers.ts";
import { processRunning } from "../../tests/support/processGroup.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import {
  developmentBoundary,
  incidentEntries,
  inspect,
  knownSourceId,
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/readDiagnostics.ts";

async function failedRead(server: DashboardServer): Promise<void> {
  const failed = await rawRequest({
    url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
    headers: { Origin: server.origin },
  });
  expect(failed.status).toBe(502);
}

test("a dev server restarted in place lists both instances' failures, reads the closed instance as ended and the running one as current, and a kill after the restart as lost", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-incident-restart-"));
  // A loaded machine may add stalls of its own.
  const linesOf = (pid: number) =>
    incidentEntries(machine).filter(
      (entry) => entry.pid === pid && entry.kind !== "stall",
    );
  try {
    const restarted = await startDashboardServer({
      mode: "dev",
      restartable: true,
      machine,
    });
    const { pid } = restarted;
    try {
      restarted.github.serve(everyRepository, () =>
        Promise.resolve(httpErrorAnswer(503, "unavailable")),
      );
      await failedRead(restarted);
      await expect
        .poll(() => linesOf(pid).map((entry) => entry.kind), {
          timeout: 10_000,
        })
        .toEqual(["process-started", "failed-read"]);

      process.kill(pid, "SIGUSR2");
      await expect
        .poll(() => restarted.output().includes("Restarted"), {
          timeout: 60_000,
        })
        .toBe(true);
      await failedRead(restarted);

      const seen = await inspect(restarted);
      expect(seen.status).toBe(200);
      const failures = seen.record.failures.filter(
        (entry) => entry.pid === pid,
      );
      expect(failures).toHaveLength(2);
      const instances = failures.map((entry) => entry.serverInstance);
      expect(new Set(instances).size).toBe(2);
      const instancesOfPid = seen.record.processes.filter(
        (entry) => entry.pid === pid,
      );
      expect(instancesOfPid).toHaveLength(2);
      const [running, closed] = instancesOfPid;
      expect(running).toMatchObject({ state: "current" });
      expect(running?.endedAt).toBeUndefined();
      expect(closed).toMatchObject({ state: "ended" });
      expect(closed?.endedAt).toEqual(expect.any(String));
      expect(instances).toEqual([
        running?.serverInstance,
        closed?.serverInstance,
      ]);

      process.kill(pid, "SIGKILL");
      await expect
        .poll(() => processRunning(pid), { timeout: 10_000 })
        .toBe(false);
    } finally {
      await restarted.close();
    }

    const successor = await startDashboardServer({
      ...developmentBoundary,
      machine,
    });
    try {
      const seen = await inspect(successor);
      expect(seen.status).toBe(200);
      expect(
        seen.record.failures.filter((entry) => entry.pid === pid),
      ).toHaveLength(2);
      const killed = seen.record.processes.filter((entry) => entry.pid === pid);
      expect(killed.map((entry) => entry.state)).toEqual(["lost", "ended"]);
      expect(killed[0]?.endedAt).toBeUndefined();
      expect(seen.record.processes[0]).toMatchObject({
        pid: successor.pid,
        state: "current",
      });
    } finally {
      await successor.close();
    }
  } finally {
    rmSync(machine, { recursive: true, force: true });
  }
});
