// Run-local input history through real polling and the notification command
// log. Native fixtures supply observations, never alert suppression. Gaps and
// changed summaries are not work; even a new question stays quiet if all its
// intervening work escaped observation. The machine answer remains current.
import { startDashboardServer } from "../support/dashboardServer.ts";
import { test, expect } from "../support/codexLaunch.ts";
import {
  observationRecord as record,
  observationStates,
  saveObservations as save,
  observed,
  afterFurtherReads,
  passive,
} from "../support/codexObservation.ts";
import {
  afterFurtherListings,
  notices,
  start,
} from "../support/sessionAlerts.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";

test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });

test("baseline and independently notified input survive gaps, omitted records and changed summaries until observed working", async ({
  machine,
  codexProtocol,
  dashboard,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  const waiting = { type: "active", activeFlags: ["waitingOnUserInput"] };
  const words = "Codex is waiting for your input";
  observed(native, "baseline", waiting);
  observed(native, "sentinel", { type: "active", activeFlags: [] });
  const sentinel = record(dashboard, native, "sentinel");
  const baseline = [record(dashboard, native, "baseline"), sentinel];
  save(dashboard, baseline);
  const collision = dashboard.claudeListsSession({
    name: "Claude collision",
    cwd: dashboard.home,
    startedAt: Date.now(),
  });
  await dashboard.close();
  const server = await startDashboardServer({
    mode: "boundary",
    machine,
    projectFolders: ["open-dough"],
    codexProtocol: native,
    alertCheckMs: 50,
  });
  const further = () => afterFurtherReads(native, "sentinel");
  const inputs = () =>
    notices(server).filter((notice) =>
      notice.message?.startsWith("Needs input"),
    );
  const unreadable = {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32600, message: "Native read refused" },
  };
  try {
    await further();
    expect(notices(server)).toEqual([]);
    native.observations.set("baseline", unreadable);
    await further();
    expect(
      (await observationStates(server)).find(
        (entry) => entry.session.sessionId === "baseline",
      )?.sessionState,
    ).toEqual({ kind: "unknown" });
    observed(native, "baseline", waiting);
    await further();
    expect(notices(server)).toEqual([]);

    // Each session first appears waiting after baseline, with identical text.
    const first = record(server, native, collision);
    first.request.title = "First Codex";
    const second = record(server, native, "second");
    second.request.title = "Second Codex";
    const claude: LaunchRecord = {
      ...first,
      request: { ...first.request, host: "claude", title: "Claude collision" },
      session: {
        host: "claude",
        sessionId: collision,
        shortId: collision.slice(0, 8),
        name: "Claude collision",
      },
    };
    observed(native, collision, waiting);
    save(server, [...baseline, first]);
    await expect.poll(() => inputs().length).toBe(1);
    observed(native, "second", waiting);
    save(server, [...baseline, first, second]);
    await expect.poll(() => inputs().length).toBe(2);
    server.claudeSessionBecomes(collision, "blocked", words);
    const all = [...baseline, first, second, claude];
    save(server, all);
    await expect.poll(() => inputs().length).toBe(3);
    expect(inputs()).toEqual([
      {
        message: `Needs input: ${words}`,
        title: "Open Dough · First Codex",
        sound: "Glass",
      },
      {
        message: `Needs input: ${words}`,
        title: "Open Dough · Second Codex",
        sound: "Glass",
      },
      {
        message: `Needs input: ${words}`,
        title: "Open Dough · Claude collision",
        sound: "Glass",
      },
    ]);

    observed(native, collision, {
      type: "active",
      activeFlags: ["waitingOnApproval"],
    });
    server.claudeSessionBecomes(collision, "blocked", "A changed question");
    await further();
    expect(inputs()).toHaveLength(3);
    server.claudeSessionBecomes(collision, "blocked", words);
    for (const gap of [
      unreadable,
      unreadable,
      unreadable,
      { status: { type: "active" }, turns: [] },
      {
        status: { type: "idle" },
        turns: [],
        historyError: { code: -32601, message: "History unavailable" },
      },
      { status: { type: "futureNativeStatus" }, turns: [] },
      {
        ...unreadable,
        metadataError: {
          code: -32600,
          message: `thread not loaded: ${collision}`,
        },
      },
      { status: { type: "idle" }, turns: [] },
    ]) {
      native.observations.set(collision, gap);
      await further();
      observed(native, collision, waiting);
      await further();
      expect(inputs()).toHaveLength(3);
    }
    expect(
      notices(server)
        .filter((notice) => !notice.message?.startsWith("Needs input"))
        .map((notice) => notice.message),
    ).toEqual(["State not recognized", "Session unavailable"]);

    // Remove actual machine records, rather than only a native listing.
    save(server, [sentinel]);
    await further();
    expect(
      (await observationStates(server)).map((entry) => entry.session.sessionId),
    ).toEqual(["sentinel"]);
    save(server, all);
    await further();
    expect(inputs()).toHaveLength(3);
    observed(native, collision, { type: "active", activeFlags: [] });
    await further();
    observed(native, collision, waiting);
    await expect.poll(() => inputs().length).toBe(4);
    await further();
    expect(inputs().at(-1)).toEqual(inputs()[0]);
    expect(inputs()).toHaveLength(4);
    passive(native.calls);
  } finally {
    await server.close();
  }
});

test("Claude input survives unreadable listing and native omission recovery", async ({
  machine,
  dashboard,
}) => {
  await dashboard.close();
  const server = await startDashboardServer({
    mode: "boundary",
    machine,
    projectFolders: ["open-dough"],
    alertCheckMs: 50,
  });
  try {
    const session = await start(server);
    await afterFurtherListings(server);
    server.claudeSessionBecomes(session, "blocked", "Which database?");
    await expect.poll(() => server.notifierCalls().length).toBe(1);
    const listed = server.claudeListing();
    for (const gap of ["unreadable", "omitted"] as const) {
      if (gap === "unreadable") server.claudeListingFails(true);
      else server.claudeSessionBecomes(session, "forgotten");
      await afterFurtherListings(server);
      if (gap === "unreadable") server.claudeListingFails(false);
      else server.claudeListingBecomes(listed);
      await afterFurtherListings(server);
      expect(
        notices(server).filter((notice) =>
          notice.message?.startsWith("Needs input"),
        ),
      ).toHaveLength(1);
    }
    expect(notices(server).map((notice) => notice.message)).toEqual([
      "Needs input: Which database?",
      "Session unavailable",
    ]);
  } finally {
    await server.close();
  }
});
