// Native vendor substitutes reach the real recorded-target HTTP/store boundary.
import path from "node:path";
import { installFakeCodex } from "./support/fakeCodex.ts";
import {
  deleteRecord,
  launch,
  refinementRequest,
} from "./agentLaunchBoundary.ts";
import { test, expect, stored } from "./support/codexLaunch.ts";
import {
  observationRecord as record,
  saveObservations as save,
  observationStates as states,
  observed,
  passive,
} from "./support/codexObservation.ts";
test.use({ projectFolders: ["open-dough"] });

test("endpoint/read failures preserve healthy hosts, saved identity and independent native targets", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
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
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  native.observations.set("held", {
    status: { type: "idle" },
    turns: [],
    holdRead: true,
  });
  save(dashboard, [record(dashboard, native, "held")]);
  const pending = states(dashboard);
  await expect
    .poll(() => native.calls.filter((c) => c.method === "thread/read").length)
    .toBe(1);
  // A second boundary read is explicitly unreadable, admitting established deletion.
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
  await pending;
  expect(stored(dashboard.home)).toEqual([]);
  expect(await states(dashboard)).toEqual([]);
  passive(native.calls);
});

test("a silent native endpoint reaches its bound without erasing a healthy Codex endpoint", async ({
  dashboard,
  machine,
  codexProtocol,
}) => {
  const native = codexProtocol;
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
