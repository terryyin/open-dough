// Real native protocol reads across overlapping observation calls.
import { codexSessions } from "../../server/hosts/codex/sessions.ts";
import { test, expect } from "../support/codexLaunch.ts";
import {
  observationRecord as record,
  observed,
  passive,
} from "../support/codexObservation.ts";

test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });

test("overlapping observations share a native read bound and finish every queued session", async ({
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  await dashboard.close();
  const records = Array.from(Array.from({ length: 24 }).keys(), (index) => {
    const id = `queued-${index}`;
    native.observations.set(id, {
      status: { type: "idle" },
      turns: [{ id: `${id}-turn`, status: "completed" }],
      holdRead: true,
    });
    return record(dashboard, native, id);
  });
  const controller = new AbortController();
  const reads = () =>
    native.calls.filter((call) => call.method === "thread/read").length;
  const pending = Promise.all([
    codexSessions(records.slice(0, 12), controller.signal),
    codexSessions(records.slice(12), controller.signal),
  ]);
  try {
    await expect
      .poll(
        () =>
          native.calls.filter((call) => call.method === "initialized").length,
      )
      .toBe(2);
    await expect.poll(reads).toBeGreaterThanOrEqual(4);
    expect(reads()).toBe(4);
    for (const observation of native.observations.values())
      observation.holdRead = false;
    native.releaseReads();
    const results = (await pending).flat();
    expect(results.map((result) => result.session.sessionId)).toEqual(
      records.map((item) => item.session.sessionId),
    );
    expect(
      results.every(
        (result) =>
          result.sessionState.kind === "available" &&
          result.sessionState.activity === "review",
      ),
    ).toBe(true);
    expect(reads()).toBe(24);
    passive(native.calls);
  } finally {
    controller.abort();
    await pending;
  }
});

test("aborted reads release shared capacity and cancel queued reads without losing results", async ({
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  await dashboard.close();
  const records = Array.from(Array.from({ length: 12 }).keys(), (index) => {
    const id = `cancel-${index}`;
    native.observations.set(id, {
      status: { type: "idle" },
      turns: [],
      holdRead: true,
    });
    return record(dashboard, native, id);
  });
  const controller = new AbortController();
  const pending = codexSessions(records, controller.signal);
  await expect
    .poll(
      () => native.calls.filter((call) => call.method === "thread/read").length,
    )
    .toBeGreaterThanOrEqual(4);
  const recovered = Array.from(Array.from({ length: 12 }).keys(), (index) => {
    const id = `recovered-${index}`;
    observed(native, id, { type: "idle" }, "completed");
    if (index < 4)
      native.observations.set(id, {
        status: { type: "idle" },
        turns: [],
        metadataError: {
          code: -32001,
          message: "Server overloaded; retry later.",
        },
      });
    return record(dashboard, native, id);
  });
  const recovery = codexSessions(recovered, new AbortController().signal);
  await expect
    .poll(
      () => native.calls.filter((call) => call.method === "initialized").length,
    )
    .toBe(2);
  controller.abort();
  expect((await pending).map((result) => result.sessionState)).toEqual(
    records.map(() => ({ kind: "unknown" })),
  );
  expect(
    native.calls.filter(
      (call) =>
        call.method === "thread/read" &&
        String(call.params["threadId"]).startsWith("cancel-"),
    ),
  ).toHaveLength(4);
  const results = await recovery;
  expect(results.map((result) => result.sessionState)).toEqual(
    recovered.map((item) =>
      ["recovered-0", "recovered-1", "recovered-2", "recovered-3"].includes(
        item.session.sessionId,
      )
        ? { kind: "unknown" }
        : { kind: "available", availability: "loaded", activity: "review" },
    ),
  );
  passive(native.calls);
});
