// Real native protocol reads across overlapping Codex observations.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { codexSessions } from "../../server/hosts/codex/sessions.ts";
import {
  codexEndpoint,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import { expectPassiveCodexReads } from "../../test-support/support/codexPassiveProtocol.ts";
import { startNativeCodexEndpoint } from "../support/codexObservationFixture.ts";

async function nativeEndpoint() {
  const root = mkdtempSync(path.join(tmpdir(), "dough-codex-reads-"));
  onTestFinished(() => {
    rmSync(root, { recursive: true, force: true });
  });
  return startNativeCodexEndpoint(root);
}

function record(native: FakeCodex, sessionId: string) {
  return makeMe.aLaunchRecord
    .refining({ identity: "SEED-001#read", title: "Read saved session" })
    .inCodexSession({
      sessionId,
      continuation: {
        workspace: path.dirname(native.env["FAKE_CODEX_SOCKET"] ?? ""),
        endpoint: codexEndpoint(native),
      },
    })
    .please();
}

const metadataReads = (native: FakeCodex) =>
  native.calls.filter(({ method }) => method === "thread/read");
const initialized = (native: FakeCodex) =>
  native.calls.filter(({ method }) => method === "initialized").length;
const review = {
  kind: "available",
  availability: "loaded",
  activity: "review",
};
const unknown = { kind: "unknown" };

test("overlapping observations share a native read bound and finish every queued session", async () => {
  const native = await nativeEndpoint();
  const records = Array.from(Array(24).keys(), (index) => {
    const id = `queued-${index}`;
    native.observations.set(id, {
      status: { type: "idle" },
      turns: [{ id: `${id}-turn`, status: "completed" }],
      holdRead: true,
    });
    return record(native, id);
  });
  const controller = new AbortController();
  const pending = Promise.all([
    codexSessions(records.slice(0, 12), controller.signal),
    codexSessions(records.slice(12), controller.signal),
  ]);
  try {
    await expect.poll(() => initialized(native)).toBe(2);
    await expect.poll(() => metadataReads(native)).toHaveLength(4);
    for (const observation of native.observations.values()) {
      observation.holdRead = false;
    }
    native.releaseReads();

    const observed = (await pending).flat();
    expect(observed.map(({ session }) => session.sessionId)).toEqual(
      records.map(({ session }) => session.sessionId),
    );
    expect(observed.map(({ sessionState }) => sessionState)).toEqual(
      records.map(() => review),
    );
    expect(metadataReads(native)).toHaveLength(24);
    expectPassiveCodexReads(native.calls, expect);
  } finally {
    controller.abort();
    await pending;
  }
});

test("aborted reads release shared capacity and cancel queued reads without losing results", async () => {
  const native = await nativeEndpoint();
  const records = Array.from(Array(12).keys(), (index) => {
    const id = `cancel-${index}`;
    native.observations.set(id, {
      status: { type: "idle" },
      turns: [],
      holdRead: true,
    });
    return record(native, id);
  });
  const recovered = Array.from(Array(12).keys(), (index) => {
    const id = `recovered-${index}`;
    native.observations.set(id, {
      status: { type: "idle" },
      turns: [{ id: `${id}-turn`, status: "completed" }],
      ...(index < 4 && {
        metadataError: {
          code: -32001,
          message: "Server overloaded; retry later.",
        },
      }),
    });
    return record(native, id);
  });
  const cancelled = new AbortController();
  const staying = new AbortController();
  const pending = codexSessions(records, cancelled.signal);
  try {
    await expect.poll(() => metadataReads(native)).toHaveLength(4);
    const recovery = codexSessions(recovered, staying.signal);
    try {
      await expect.poll(() => initialized(native)).toBe(2);
      cancelled.abort();

      expect((await pending).map(({ sessionState }) => sessionState)).toEqual(
        records.map(() => unknown),
      );
      expect(
        metadataReads(native).filter(
          ({ params }) =>
            typeof params["threadId"] === "string" &&
            params["threadId"].startsWith("cancel-"),
        ),
      ).toHaveLength(4);
      expect((await recovery).map(({ sessionState }) => sessionState)).toEqual(
        Array.from(recovered.keys(), (index) => (index < 4 ? unknown : review)),
      );
      expectPassiveCodexReads(native.calls, expect);
    } finally {
      staying.abort();
      await recovery;
    }
  } finally {
    cancelled.abort();
    await pending;
  }
});
