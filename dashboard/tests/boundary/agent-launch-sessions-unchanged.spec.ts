// A viewer naming the revision of the sessions answer it holds is answered
// only that it is unchanged while nothing changed, and in full otherwise
// (../../server/machineSessionObservation.ts).
import { createHash } from "node:crypto";
import { sessionsRevisionHeader } from "../../src/machineSessionsRevision.ts";
import { launch, markDone, refinementRequest } from "../agentLaunchBoundary.ts";
import { test, expect, stored } from "../support/codexLaunch.ts";
import { observed, sessionsRequest } from "../support/codexObservation.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import { rawRequest } from "../support/rawHttp.ts";

test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });

type Answer = {
  readonly revision: string;
  readonly unchanged?: true;
  readonly records?: readonly { readonly doneAt?: string }[];
  readonly attempts?: readonly unknown[];
};

// The sessions answer as sent, to a viewer holding `held` if any.
async function askHolding(server: DashboardServer, held?: string) {
  const request = sessionsRequest(server);
  const response = await rawRequest({
    ...request,
    headers: {
      ...request.headers,
      ...(held === undefined ? {} : { [sessionsRevisionHeader]: held }),
    },
  });
  expect(response.status).toBe(200);
  return {
    bytes: Buffer.byteLength(response.body),
    answer: JSON.parse(response.body) as Answer,
    body: response.body,
  };
}

// The revision a full answer body names: the SHA-256 of the body it leads.
function revisionOf(body: string): string {
  const { revision, ...rest } = JSON.parse(body) as Answer;
  expect(body.startsWith(`{"revision":${JSON.stringify(revision)},`)).toBe(
    true,
  );
  return createHash("sha256").update(JSON.stringify(rest)).digest("hex");
}

test("a viewer holding the current revision is answered unchanged, and in full once a Done mark changes it", async ({
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  observed(native, native.threadId, { type: "idle" }, "completed");

  const first = await askHolding(dashboard);
  const held = first.answer.revision;
  expect(revisionOf(first.body)).toBe(held);
  expect(first.answer.records).toHaveLength(1);

  // Repeated asks, each observed afresh, stay small while nothing changed.
  for (let ask = 0; ask < 3; ask += 1) {
    const unchanged = await askHolding(dashboard, held);
    expect(unchanged.answer).toEqual({ revision: held, unchanged: true });
    expect(unchanged.bytes).toBeLessThan(1_024);
  }
  // A read naming no revision, or an older one, is answered in full.
  for (const asked of [undefined, "an-older-revision"]) {
    const full = await askHolding(dashboard, asked);
    expect(full.body).toBe(first.body);
    expect(full.answer.unchanged).toBeUndefined();
  }

  const marked = await markDone(dashboard, {
    source: "open-dough",
    session: native.threadId,
    host: "codex",
  });
  expect(marked.status).toBe(200);
  const doneAt = stored(dashboard.home)[0]?.doneAt;
  expect(doneAt).toBeDefined();
  const changed = await askHolding(dashboard, held);
  expect(changed.answer.unchanged).toBeUndefined();
  expect(changed.answer.revision).not.toBe(held);
  expect(revisionOf(changed.body)).toBe(changed.answer.revision);
  expect(changed.answer.records?.[0]?.doneAt).toBe(doneAt);
  expect(changed.answer.attempts).toBeDefined();
  // The changed revision is the one now held.
  expect((await askHolding(dashboard, changed.answer.revision)).answer).toEqual(
    { revision: changed.answer.revision, unchanged: true },
  );
});
