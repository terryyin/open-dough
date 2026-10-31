// Every viewer's sessions answer and the notification observer share one
// machine-session observation (../../server/machineSessionObservation.ts),
// counted by the Codex native fixture's calls: one native connection
// (`initialized`) and one `thread/read` per session per observation.
import { setTimeout as delay } from "node:timers/promises";
import { startDashboardServer } from "../support/dashboardServer.ts";
import type { FakeCodex } from "../support/fakeCodex.ts";
import { rawRequest } from "../support/rawHttp.ts";
import { test, expect } from "../support/codexLaunch.ts";
import {
  observationRecord as record,
  saveObservations as save,
  askSessions,
  sessionStatesIn,
  observed,
  passive,
} from "../support/codexObservation.ts";

test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });

const observations = (native: FakeCodex) =>
  native.calls.filter((call) => call.method === "initialized").length;
const reads = (native: FakeCodex) =>
  native.calls.filter((call) => call.method === "thread/read").length;

// A server whose settled observation serves later asks for the production
// second, with this spec's records and native fixture.
const reusingServer = (
  machine: string | undefined,
  native: FakeCodex,
  alertCheckMs?: number,
) =>
  startDashboardServer({
    mode: "boundary",
    machine,
    projectFolders: ["open-dough"],
    codexProtocol: native,
    sessionsReuseMs: 1_000,
    ...(alertCheckMs === undefined ? {} : { alertCheckMs }),
  });

test("eight viewers and the notification observer share one held observation", async ({
  machine,
  codexProtocol: native,
  dashboard,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  native.observations.set("shared", {
    status: { type: "idle" },
    turns: [{ id: "shared-turn", status: "completed" }],
    holdRead: true,
  });
  save(dashboard, [record(dashboard, native, "shared")]);
  await dashboard.close();
  // The observer polls every 50 ms; a settled observation serves a second.
  const server = await reusingServer(machine, native, 50);
  try {
    // The observer's own poll starts the observation and waits on it.
    await expect.poll(() => reads(native)).toBe(1);
    const viewers = Array.from({ length: 8 }, () => askSessions(server));
    await delay(300);
    expect([observations(native), reads(native)]).toEqual([1, 1]);
    native.releaseReads();
    const answers = await Promise.all(viewers);
    expect(answers.map(({ status }) => status)).toEqual(Array(8).fill(200));
    // One serialization answers every viewer, records and attempts alike.
    expect(new Set(answers.map(({ body }) => body)).size).toBe(1);
    const body = answers[0]?.body ?? "";
    expect(sessionStatesIn(body)).toEqual([
      { kind: "available", availability: "loaded", activity: "review" },
    ]);
    expect((JSON.parse(body) as { attempts: unknown[] }).attempts).toEqual([]);
    // The observer's further polls within the window are served by it too.
    await delay(500);
    expect([observations(native), reads(native)]).toEqual([1, 1]);
    passive(native.calls);
  } finally {
    await server.close();
  }
});

test("a settled observation serves asks within a second, and a later ask observes afresh", async ({
  machine,
  codexProtocol: native,
  dashboard: closed,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  observed(native, "settled", { type: "idle" }, "completed");
  save(closed, [record(closed, native, "settled")]);
  await closed.close();
  const dashboard = await reusingServer(machine, native);
  try {
    const first = await askSessions(dashboard);
    const settledAt = Date.now();
    expect(first.status).toBe(200);
    const once = [observations(native), reads(native)];
    expect(once[1]).toBe(1);
    await delay(400 - (Date.now() - settledAt));
    const reused = await askSessions(dashboard);
    expect(reused.body).toBe(first.body);
    expect([observations(native), reads(native)]).toEqual(once);
    await delay(1_500 - (Date.now() - settledAt));
    observed(native, "settled", { type: "active", activeFlags: [] });
    const fresh = await askSessions(dashboard);
    expect([observations(native), reads(native)]).toEqual(
      once.map((count) => count * 2),
    );
    expect(sessionStatesIn(fresh.body)).toEqual([
      { kind: "available", availability: "loaded", activity: "working" },
    ]);
    passive(native.calls);
  } finally {
    await dashboard.close();
  }
});

test("a project catalog change is observed afresh within the reuse window", async ({
  machine,
  codexProtocol: native,
  dashboard: closed,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  observed(native, "catalog", { type: "idle" }, "completed");
  save(closed, [record(closed, native, "catalog")]);
  await closed.close();
  const dashboard = await reusingServer(machine, native);
  try {
    const before = await askSessions(dashboard);
    expect(
      (JSON.parse(before.body) as { records: unknown[] }).records,
    ).toHaveLength(1);
    const removed = await rawRequest({
      url: `${dashboard.baseURL}/__project-configuration/remove`,
      method: "POST",
      headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
      body: JSON.stringify({ id: "open-dough" }),
    });
    expect(removed.status).toBe(200);
    const after = await askSessions(dashboard);
    expect((JSON.parse(after.body) as { records: unknown[] }).records).toEqual(
      [],
    );
  } finally {
    await dashboard.close();
  }
});
