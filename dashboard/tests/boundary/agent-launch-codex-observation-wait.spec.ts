// A slow machine-session observation (../../server/machineSessionObservation.ts)
// with a shortened read wait: waiters share it while it is held, one leaving
// ends only its own wait, waiters past the bound are told to ask again, and
// none of that starts a second observation while the first runs.
import { setTimeout as delay } from "node:timers/promises";
import { startDashboardServer } from "../support/dashboardServer.ts";
import type { FakeCodex } from "../support/fakeCodex.ts";
import { abandonedRequest } from "../support/rawHttp.ts";
import { test, expect } from "../support/codexLaunch.ts";
import {
  observationRecord as record,
  saveObservations as save,
  askSessions,
  sessionsRequest,
  sessionStatesIn,
  passive,
} from "../support/codexObservation.ts";

test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });

const waitMs = 1_500;

const counts = (native: FakeCodex) =>
  ["initialized", "thread/read"].map(
    (method) => native.calls.filter((call) => call.method === method).length,
  );

const holdReads = (native: FakeCodex, hold: boolean) => {
  native.observations.set("slow", {
    status: { type: "idle" },
    turns: [{ id: "slow-turn", status: "completed" }],
    holdRead: hold,
  });
};

const review = {
  kind: "available",
  availability: "loaded",
  activity: "review",
};

test("waiters share a held observation, a departing one ends only its own wait, and past the bound they are told to ask again", async ({
  machine,
  codexProtocol: native,
  dashboard,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  holdReads(native, true);
  save(dashboard, [record(dashboard, native, "slow")]);
  await dashboard.close();
  const server = await startDashboardServer({
    mode: "boundary",
    machine,
    projectFolders: ["open-dough"],
    codexProtocol: native,
    sessionsReuseMs: 1,
    extraEnv: { DOUGH_SESSIONS_WAIT_MS: String(waitMs) },
  });
  try {
    // Released within the bound: two waiters answered, one gone.
    const waiters = [askSessions(server), askSessions(server)];
    abandonedRequest(sessionsRequest(server)).cutAfter(200);
    await expect.poll(() => counts(native)).toEqual([1, 1]);
    await delay(400);
    native.releaseReads();
    const answered = await Promise.all(waiters);
    expect(answered.map(({ status }) => status)).toEqual([200, 200]);
    expect(answered.map(({ body }) => sessionStatesIn(body))).toEqual([
      [review],
      [review],
    ]);
    expect(counts(native)).toEqual([1, 1]);

    // Held past the bound: told to ask again, with no second observation.
    holdReads(native, true);
    await delay(50);
    const askedAt = Date.now();
    const late = [askSessions(server), askSessions(server)];
    abandonedRequest(sessionsRequest(server)).cutAfter(200);
    await expect.poll(() => counts(native)).toEqual([2, 2]);
    const refused = await Promise.all(late);
    expect(Date.now() - askedAt).toBeGreaterThanOrEqual(waitMs - 100);
    expect(refused.map(({ status }) => status)).toEqual([503, 503]);
    expect(
      (JSON.parse(refused[0]?.body ?? "") as { error: string }).error,
    ).toMatch(/not observed within .* Ask again\./);
    const rejoined = askSessions(server);
    await delay(300);
    expect(counts(native)).toEqual([2, 2]);
    holdReads(native, false);
    native.releaseReads();
    expect((await rejoined).status).toBe(200);
    const next = await askSessions(server);
    expect(next.status).toBe(200);
    expect(sessionStatesIn(next.body)).toEqual([review]);
    // Asked after the held one settled, it observed afresh.
    expect(counts(native)).toEqual([3, 3]);
    passive(native.calls);
  } finally {
    await server.close();
  }
});
