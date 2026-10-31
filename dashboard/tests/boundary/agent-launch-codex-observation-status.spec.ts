// Native status and absence evidence through the real recorded-target HTTP
// boundary: read variants keep native provenance; endpoint and read failures
// preserve healthy hosts and saved identity; deleting an unreadable record
// while a passive read is pending never recreates it; and a silent native
// endpoint reaches its bound without erasing a healthy one.
import path from "node:path";
import { test, expect, stored } from "../support/codexLaunch.ts";
import { installFakeCodex } from "../support/fakeCodex.ts";
import {
  deleteRecord,
  launch,
  refinementRequest,
} from "../agentLaunchBoundary.ts";
import {
  observationRecord as record,
  saveObservations as save,
  observationStates as states,
  observed,
  passive,
} from "../support/codexObservation.ts";
// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });

test("read variants preserve native provenance and require exact missing-target evidence", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  observed(native, "system-error", { type: "systemError" });
  observed(native, "in-progress", { type: "idle" }, "inProgress");
  observed(native, "future-turn", { type: "idle" }, "futureTurnStatus");
  observed(native, "future-flag", {
    type: "active",
    activeFlags: ["futureFlag"],
  });
  observed(native, "absent-flags", { type: "active" });
  native.observations.set("wrong-code", {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32000, message: "thread not loaded: wrong-code" },
  });
  native.observations.set("wrong-target", {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32600, message: "thread not loaded: another-id" },
  });
  const ids = [...native.observations.keys()];
  save(
    dashboard,
    ids.map((id) => record(dashboard, native, id)),
  );
  expect((await states(dashboard)).map((r) => r.sessionState)).toEqual([
    { kind: "available", availability: "loaded", activity: "failed" },
    { kind: "available", availability: "loaded", activity: "working" },
    {
      kind: "available",
      availability: "loaded",
      activity: "unknown",
      description: "Codex reported native turn status: futureTurnStatus",
      unknownReason: "unrecognized",
    },
    {
      kind: "available",
      availability: "loaded",
      activity: "unknown",
      description: "Codex reported an unrecognized active status",
      unknownReason: "unrecognized",
    },
    {
      kind: "available",
      availability: "loaded",
      activity: "unknown",
      description: "Codex did not report active status flags",
      unknownReason: "incomplete",
    },
    { kind: "unknown" },
    { kind: "unknown" },
  ]);
  passive(native.calls);
});

test("endpoint/read failures preserve healthy hosts, saved identity and independent native targets", async ({
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  dashboard.claudeScenario("launched");
  expect((await launch(dashboard, refinementRequest)).status).toBe(200);
  const claude = stored(dashboard.home)[0];
  if (claude === undefined) throw new Error("Missing Claude record");
  observed(native, "healthy", { type: "notLoaded" }, "completed");
  observed(native, "refused", { type: "idle" });
  native.observations.set("refused", {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32600, message: "Native read refused" },
  });
  const badEndpoint = record(dashboard, native, "bad-endpoint");
  if (badEndpoint.session.continuation === undefined)
    throw new Error("Missing continuation");
  badEndpoint.session.continuation.endpoint = `unix://${dashboard.home}/absent.sock`;
  const legacy = record(dashboard, native, "legacy-no-endpoint");
  delete legacy.session.continuation;
  save(dashboard, [
    claude,
    record(dashboard, native, "healthy"),
    record(dashboard, native, "refused"),
    badEndpoint,
    legacy,
  ]);
  const response = await states(dashboard);
  expect(response.map((r) => [r.session.sessionId, r.sessionState])).toEqual([
    [
      claude.session.sessionId,
      { kind: "available", availability: "loaded", activity: "working" },
    ],
    [
      "healthy",
      { kind: "available", availability: "retained", activity: "review" },
    ],
    ["refused", { kind: "unknown" }],
    ["bad-endpoint", { kind: "unknown" }],
    ["legacy-no-endpoint", { kind: "unknown" }],
  ]);
  expect(stored(dashboard.home)).toHaveLength(5);
  passive(native.calls);
});

test("deleting an unreadable saved record while another passive read is pending never recreates it", async ({
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  native.observations.set("held", {
    status: { type: "idle" },
    turns: [],
    holdRead: true,
  });
  save(dashboard, [record(dashboard, native, "held")]);
  // Both held HTTP reads share one observation; deletion sees refusal.
  const pending = Promise.all([states(dashboard), states(dashboard)]);
  const readCount = () =>
    native.calls.filter((c) => c.method === "thread/read").length;
  await expect.poll(readCount).toBeGreaterThanOrEqual(1);
  native.observations.set("held", {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32600, message: "Native read refused" },
  });
  expect(
    (
      await deleteRecord(dashboard, {
        source: "open-dough",
        host: "codex",
        session: "held",
      })
    ).status,
  ).toBe(200);
  native.releaseReads();
  expect((await pending).flat()).toContainEqual(
    expect.objectContaining({
      session: expect.objectContaining({ sessionId: "held" }),
      sessionState: {
        kind: "available",
        availability: "loaded",
        activity: "awaiting-instruction",
      },
    }),
  );
  expect(stored(dashboard.home)).toEqual([]);
  expect(await states(dashboard)).toEqual([]);
  passive(native.calls);
});

test("a silent native endpoint reaches its bound without erasing a healthy Codex endpoint", async ({
  dashboard,
  machine,
  codexProtocol: native,
}) => {
  if (native === undefined || machine === undefined)
    throw new Error("Missing native fixture");
  const silent = await installFakeCodex(
    path.join(machine, "silent"),
    process.env["PATH"] ?? "",
    true,
  );
  try {
    observed(native, "healthy", { type: "notLoaded" }, "completed");
    silent.observations.set("silent", {
      status: { type: "idle" },
      turns: [],
      holdRead: true,
    });
    save(dashboard, [
      record(dashboard, native, "healthy"),
      record(dashboard, silent, "silent"),
    ]);
    expect(
      (await states(dashboard)).map((r) => [
        r.session.sessionId,
        r.sessionState,
      ]),
    ).toEqual([
      [
        "healthy",
        { kind: "available", availability: "retained", activity: "review" },
      ],
      ["silent", { kind: "unknown" }],
    ]);
    await expect.poll(() => silent.sockets.size).toBe(0);
    passive(native.calls);
    passive(silent.calls);
  } finally {
    await silent.close();
  }
});
