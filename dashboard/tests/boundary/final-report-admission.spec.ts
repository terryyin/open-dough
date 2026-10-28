// Passive final report requests admit only a catalog project's recorded native identity.
import path from "node:path";
import { test, expect, stored } from "../support/codexLaunch.ts";
import { rawRequest } from "../support/rawHttp.ts";
import {
  keepTrackedClosureEvidence,
  plantTrackedClosureRepository,
  report,
  retained,
  save,
} from "../support/retainedReport.ts";
import { completionReport } from "../support/completionReport.ts";

test.use({ projectFolders: ["open-dough"] });

test("final report admission refuses unknown projects, unrecorded or wrong-host sessions, hosts without a report reader, arbitrary endpoints and methods before native read", async ({
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing protocol fixture");
  const { record, workspace } = await retained(dashboard, native);
  const attention = "Reminder: check the migration before landing.";
  save(dashboard.home, [
    ...stored(dashboard.home),
    {
      ...record,
      session: {
        host: "claude",
        sessionId: "claude-reported",
        shortId: "claude-r",
        name: record.session.name,
      },
      completion: completionReport({ message: attention }),
    },
  ]);
  const cursorCompletion = completionReport({ message: attention });
  const cursorSessionId = "22222222-2222-4222-8222-222222222222";
  const cursorEmptySessionId = "33333333-3333-4333-8333-333333333333";
  const cursorAbsentSessionId = "44444444-4444-4444-8444-444444444444";
  const cursorClosureSessionId = "55555555-5555-4555-8555-555555555555";
  const cursorRecord = (
    sessionId: string,
    completion: typeof cursorCompletion | undefined,
  ) => ({
    ...record,
    session: {
      host: "cursor" as const,
      sessionId,
      name: record.session.name,
      continuation: {
        workspace,
        args: ["cursor-agent", "--workspace", workspace, "--resume", sessionId],
      },
    },
    completion,
  });
  const closureRepository = path.join(dashboard.home, "closure-repository");
  const { revision } = plantTrackedClosureRepository(closureRepository);
  const cursorWithClosure = keepTrackedClosureEvidence(
    cursorRecord(cursorClosureSessionId, undefined),
    closureRepository,
    revision,
    workspace,
  );
  save(dashboard.home, [
    ...stored(dashboard.home),
    cursorRecord(cursorSessionId, cursorCompletion),
    cursorRecord(cursorEmptySessionId, completionReport({ message: "" })),
    cursorRecord(cursorAbsentSessionId, undefined),
    cursorWithClosure,
  ]);
  const since = native.calls.length;
  const query = new URLSearchParams({
    source: "open-dough",
    host: "codex",
    session: native.threadId,
  });
  const request = (
    params: URLSearchParams,
    method = "GET",
    origin = dashboard.origin,
  ) =>
    rawRequest({
      url: `${dashboard.baseURL}/__agent-launch/result?${params}`,
      method,
      headers: { Origin: origin },
    });
  expect(
    (
      await request(
        new URLSearchParams({
          source: "other",
          host: "codex",
          session: native.threadId,
        }),
      )
    ).status,
  ).toBe(404);
  expect(
    (
      await request(
        new URLSearchParams({
          source: "open-dough",
          host: "claude",
          session: native.threadId,
        }),
      )
    ).status,
  ).toBe(404);
  expect(
    (
      await request(
        new URLSearchParams({
          source: "open-dough",
          host: "codex",
          session: "unrecorded",
        }),
      )
    ).status,
  ).toBe(404);
  query.set("endpoint", "unix:///arbitrary");
  expect((await request(query)).status).toBe(400);
  query.delete("endpoint");
  expect((await request(query, "POST")).status).toBe(405);
  expect((await request(query, "GET", "https://other.example")).status).toBe(
    403,
  );
  expect(
    native.calls
      .slice(since)
      .filter(
        (call) =>
          call.method === "thread/read" && call.params["includeTurns"] === true,
      ),
  ).toHaveLength(0);
  const nativeReads = () =>
    native.calls.filter((call) => call.method === "thread/read").length;
  const readsBeforeClaude = nativeReads();
  const claude = await request(
    new URLSearchParams({
      source: "open-dough",
      host: "claude",
      session: "claude-reported",
    }),
  );
  expect(nativeReads()).toBe(readsBeforeClaude);
  expect(claude.status).toBe(400);
  expect(claude.body).toContain("This host cannot read a final report.");
  expect(claude.body).not.toContain(attention);
  // A kept Cursor session reads its retained explicit report, receipt-bound,
  // with no native read; without a report message it answers honestly.
  const cursor = await request(
    new URLSearchParams({
      source: "open-dough",
      host: "cursor",
      session: cursorSessionId,
    }),
  );
  expect(cursor.status).toBe(200);
  expect(JSON.parse(cursor.body)).toEqual({
    kind: "available",
    receipt: cursorCompletion.receipt,
    text: attention,
  });
  const cursorEmpty = await request(
    new URLSearchParams({
      source: "open-dough",
      host: "cursor",
      session: cursorEmptySessionId,
    }),
  );
  expect(cursorEmpty.status).toBe(200);
  expect(JSON.parse(cursorEmpty.body)).toEqual({
    kind: "unavailable",
    explanation:
      "Quiet completion was recorded with no attention message. Cursor cannot read a native final report here. The saved conversation is unchanged.",
  });
  const cursorAbsent = await request(
    new URLSearchParams({
      source: "open-dough",
      host: "cursor",
      session: cursorAbsentSessionId,
    }),
  );
  expect(cursorAbsent.status).toBe(200);
  expect(JSON.parse(cursorAbsent.body)).toEqual({
    kind: "unavailable",
    explanation:
      "No final dashboard message was saved. Cursor cannot read a native final report here. The saved conversation is unchanged.",
  });
  const cursorClosure = await request(
    new URLSearchParams({
      source: "open-dough",
      host: "cursor",
      session: cursorClosureSessionId,
    }),
  );
  expect(cursorClosure.status).toBe(200);
  expect(JSON.parse(cursorClosure.body)).toEqual({
    kind: "unavailable",
    explanation:
      "No final dashboard message was saved. Cursor cannot read a native final report here. The saved conversation is unchanged.",
    productClosureEvidence: true,
  });
  expect(nativeReads()).toBe(readsBeforeClaude);
  const answer = await request(query);
  expect(answer.status).toBe(200);
  expect(JSON.parse(answer.body)).toEqual({
    kind: "available",
    turnId: "landing-turn",
    text: report,
  });
});
