// Passive final report requests admit only a catalog project's recorded native identity.
import path from "node:path";
import { test, expect } from "../../tests/support/codexLaunch.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../tests/launchJourney.ts";
import { keepMoreLaunchRecords } from "../../tests/support/launchStore.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import {
  keepTrackedClosureEvidence,
  plantTrackedClosureRepository,
  report,
  retained,
} from "../../tests/support/retainedReport.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test.use({ projectFolders: ["open-dough"] });

test("final report admission refuses unknown projects, unrecorded or wrong-host sessions, hosts without a report reader, arbitrary endpoints and methods before native read", async ({
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing protocol fixture");
  const { workspace } = await retained(dashboard, native);
  const story = { identity: notRefinedIdentity, title: notRefinedStory };
  const attention = "Reminder: check the migration before landing.";
  const claudeRecord = makeMe.aLaunchRecord
    .refining(story)
    .inClaudeSession({ sessionId: "claude-reported", shortId: "claude-r" })
    .completedWith({
      message: attention,
      receipt: "aaaaaaaa-0000-4000-8000-000000000001",
    })
    .please();
  const cursorCompletion = makeMe.aCompletionReport
    .saying(attention)
    .withReceipt("aaaaaaaa-0000-4000-8000-000000000002")
    .please();
  const cursorSessionId = "22222222-2222-4222-8222-222222222222";
  const cursorEmptySessionId = "33333333-3333-4333-8333-333333333333";
  const cursorAbsentSessionId = "44444444-4444-4444-8444-444444444444";
  const cursorClosureSessionId = "55555555-5555-4555-8555-555555555555";
  const cursorRecord = (sessionId: string) =>
    makeMe.aLaunchRecord
      .refining(story)
      .inCursorSession({ sessionId, continuation: { workspace } });
  const closureRepository = path.join(dashboard.home, "closure-repository");
  const { revision } = plantTrackedClosureRepository(closureRepository);
  const cursorWithClosure = keepTrackedClosureEvidence(
    cursorRecord(cursorClosureSessionId).please(),
    closureRepository,
    revision,
    workspace,
  );
  keepMoreLaunchRecords(dashboard, [
    claudeRecord,
    cursorRecord(cursorSessionId).completedWith(cursorCompletion).please(),
    cursorRecord(cursorEmptySessionId).completedWith({ message: "" }).please(),
    cursorRecord(cursorAbsentSessionId).please(),
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
