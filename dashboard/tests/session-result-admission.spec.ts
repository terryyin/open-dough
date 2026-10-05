// Passive result requests admit only a catalog project's recorded native identity.
import { test, expect, stored } from "./support/codexLaunch.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { report, retained, save } from "./support/retainedReport.ts";
import { completionReport } from "./support/completionReport.ts";

test.use({ projectFolders: ["open-dough"] });

test("result admission refuses unknown projects, unrecorded or wrong-host sessions, hosts without a report reader, arbitrary endpoints and methods before native read", async ({
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing protocol fixture");
  const { record } = await retained(dashboard, native);
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
  const answer = await request(query);
  expect(answer.status).toBe(200);
  expect(JSON.parse(answer.body)).toEqual({
    kind: "available",
    turnId: "landing-turn",
    text: report,
  });
});
