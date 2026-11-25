// A sessions read is admitted from its URL and headers
// (../../server/sessionsAdmission.ts), and its answer is sent gzip-encoded
// to a caller accepting gzip and as the same JSON unencoded to any other, one
// sending no `Accept-Encoding` or refusing gzip with `q=0` among them; either
// varies by `Accept-Encoding` and is never stored. An unchanged answer and a
// refusal stay unencoded JSON (../../server/agentLaunchResponse.ts). The
// adapter writes these bytes as they are
// (e2e/sessions/agent-launch-retained-history.spec.ts).
import { gunzipSync } from "node:zlib";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  agentLaunchEndpoint,
  type LaunchWithState,
} from "../../src/agentLaunch.ts";
import {
  sessionsFreshHeader,
  sessionsRevisionHeader,
} from "../../src/machineSessionsRevision.ts";
import { launchResponse } from "../../server/agentLaunchResponse.ts";
import { RefusedRequest, verifySameOrigin } from "../../server/localOrigin.ts";
import {
  MachineSessionObservation,
  type SessionsAsk,
} from "../../server/machineSessionObservation.ts";
import { sessionsRequest } from "../../server/sessionsAdmission.ts";

type Audience = SessionsAsk["audience"];

const now = "2026-11-25T09:00:00.000Z";
const staying = new AbortController().signal;
const audiences = ["overview", "history"] as const;

function observed(sessionId: string): LaunchWithState {
  const record = makeMe.aLaunchRecord
    .executing({ identity: `SEED-052#${sessionId}`, title: sessionId })
    .inClaudeSession({ sessionId })
    .launchedAt(now)
    .please();
  return makeMe.anObservedLaunch
    .of(record)
    .withSessionState(makeMe.aSessionState.unknown().please())
    .please();
}

// One retained done session and one open, so both audiences have entries.
const observation = new MachineSessionObservation(
  () =>
    Promise.resolve(
      makeMe.aMachineAnswer
        .observing({ ...observed("done"), doneAt: now }, observed("open"))
        .please(),
    ),
  () => Promise.resolve([0]),
);

const answered = (audience: Audience, held?: string) =>
  observation.answerFor({ audience, held, fresh: false }, staying);

async function sent(
  audience: Audience,
  acceptEncoding: string | undefined,
  held?: string,
) {
  return launchResponse(acceptEncoding, {
    status: 200,
    ...(await answered(audience, held)),
  });
}

const revisionOf = async (audience: Audience) =>
  (JSON.parse((await answered(audience)).serialized) as { revision: string })
    .revision;

const url = (query = "") =>
  new URL(`http://127.0.0.1${agentLaunchEndpoint}${query}`);

// Callers accepting gzip, and callers that do not.
const accepting = [
  "gzip, deflate, br, zstd",
  "gzip",
  "GZIP;q=0.5",
  "x-gzip",
  "br;q=1, *;q=0.1",
];
const declining = [
  undefined,
  "gzip;q=0",
  "gzip; q=0.000, *",
  "identity",
  "br, deflate",
  "*;q=0",
  "gzip;q=2",
];

test("a full overview answer is the plain JSON ending with its history revision", async () => {
  const historyRevision = await revisionOf("history");
  const { body } = await sent("overview", undefined);
  expect(
    body
      .toString("utf8")
      .endsWith(`,"historyRevision":${JSON.stringify(historyRevision)}}`),
  ).toBe(true);
});

test("a full history answer is the plain JSON of its revision, records and attempts, in that order", async () => {
  const revision = await revisionOf("history");
  const plain = (await sent("history", undefined)).body.toString("utf8");
  expect(
    plain.startsWith(`{"revision":${JSON.stringify(revision)},"records":[`),
  ).toBe(true);
  expect(Object.keys(JSON.parse(plain) as object)).toEqual([
    "revision",
    "records",
    "attempts",
  ]);
});

test.each(audiences)(
  "a full %s answer accepted as gzip decodes to the plain JSON, framed to vary and not be stored",
  async (audience) => {
    const plain = (await sent(audience, undefined)).body;
    for (const field of accepting) {
      const encoded = await sent(audience, field);
      expect(encoded.headers, field).toEqual({
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
        "Content-Length": String(encoded.body.length),
        Vary: "Accept-Encoding",
        "Content-Encoding": "gzip",
      });
      expect(encoded.body.length, field).toBeLessThan(plain.length);
      expect(gunzipSync(encoded.body).equals(plain), field).toBe(true);
    }
  },
);

test.each(audiences)(
  "a full %s answer declined as gzip is the plain JSON, framed to vary and not be stored",
  async (audience) => {
    const { serialized } = await answered(audience);
    for (const field of declining) {
      const declined = await sent(audience, field);
      expect(declined.headers, field).toEqual({
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
        "Content-Length": String(Buffer.byteLength(serialized)),
        Vary: "Accept-Encoding",
      });
      expect(declined.body.toString("utf8"), field).toBe(serialized);
    }
  },
);

test.each(audiences)(
  "an unchanged %s answer stays unencoded JSON for a caller accepting gzip",
  async (audience) => {
    const revision = await revisionOf(audience);
    const unchanged = await sent(audience, "gzip, deflate, br", revision);
    expect(unchanged.headers).toEqual({
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
      "Content-Length": String(unchanged.body.length),
    });
    expect(unchanged.body.toString("utf8")).toBe(
      `{"revision":${JSON.stringify(revision)},"unchanged":true}`,
    );
  },
);

test("a read from another site is refused as unencoded JSON", async () => {
  let refusal: unknown;
  try {
    verifySameOrigin("http://evil.example", "127.0.0.1:4173");
  } catch (error) {
    refusal = error;
  }
  if (!(refusal instanceof RefusedRequest)) throw new Error("Not refused");
  const refused = await launchResponse("gzip", {
    status: refusal.status,
    body: { error: refusal.message },
  });
  expect(refused.status).toBe(403);
  expect(refused.headers).toEqual({
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  });
  expect(JSON.parse(refused.body.toString("utf8"))).toEqual({
    error: "This endpoint refuses cross-origin requests.",
  });
});

test.each([
  "audience=overview",
  "audience=History",
  "audience=",
  "audience=history&audience=history",
])("refuses the audience in %s as a malformed request", (query) => {
  expect(() => sessionsRequest(url(`?${query}`), {})).toThrow(
    new RefusedRequest(400, "The sessions request is malformed."),
  );
});

test("a read naming the fresh header and a held revision is admitted as a fresh ask of that revision", () => {
  expect(
    sessionsRequest(url("?audience=history"), {
      [sessionsFreshHeader]: "1",
      [sessionsRevisionHeader]: "held-revision",
    }),
  ).toEqual({
    kind: "sessions",
    audience: "history",
    held: "held-revision",
    fresh: true,
  });
});

test("a read without the fresh header is admitted as an ordinary ask", () => {
  expect(sessionsRequest(url(), {})).toEqual({
    kind: "sessions",
    audience: "overview",
    held: undefined,
    fresh: false,
  });
});
