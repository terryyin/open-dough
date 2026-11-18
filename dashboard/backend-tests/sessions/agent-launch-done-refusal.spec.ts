// Which done requests the local launch boundary (../../server/launchBoundary.ts)
// refuses before it runs any `claude`, over raw HTTP: a session this dashboard
// did not record, another project's session, a session whose project folder
// is missing, another site, an unknown project, and a malformed request. Each
// refusal leaves the session unmarked and still busy. What an admitted done
// request does is ./agent-launch-done.spec.ts. The synthetic `claude` (../../test-support/fixtures/fake-claude)
// records every call, so each refusal proves none was made; the real one is
// never reached.

import { expect, test } from "../../test-support/support/pageTest.ts";
import { markDone, recordsOf } from "../../test-support/agentLaunchBoundary.ts";
import { closeOpenSessions } from "../../test-support/openStorySessionSetup.ts";
import {
  launched,
  withoutProjectFolder,
  type LaunchedSession,
} from "../../test-support/agentTerminalBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";

test.describe("refusing a done request", () => {
  test.describe.configure({ mode: "serial" });
  let server: DashboardServer;

  const listed = (shortId: string) =>
    server.claudeListing().find((each) => each["id"] === shortId);

  const expectUnmarkedAndBusy = async (session: LaunchedSession) => {
    const [record] = (await recordsOf(server, "open-dough")).filter(
      (each) =>
        (each as { session: { sessionId: string } }).session.sessionId ===
        session.sessionId,
    );
    expect(record).not.toHaveProperty("doneAt");
    expect(listed(session.shortId)).toMatchObject({ status: "busy" });
  };

  test.beforeAll(async () => {
    server = await startDashboardServer({
      mode: "boundary",
      projectFolders: ["open-dough", "pygardon"],
      doneRenameWaitMs: 100,
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test.beforeEach(async () => {
    await closeOpenSessions(server);
  });

  test("refuses a request for a session this dashboard did not record, or another project's, before running claude", async () => {
    const session = await launched(server);
    for (const body of [
      {
        source: "open-dough",
        session: "00000000-0000-4000-8000-000000000000",
      },
      { source: "pygardon", session: session.sessionId },
    ]) {
      const callsBefore = server.claudeCalls().length;

      const response = await markDone(server, body);

      expect(response.status).toBe(404);
      expect(server.claudeCalls()).toHaveLength(callsBefore);
    }
    await expectUnmarkedAndBusy(session);
  });

  test("refuses a request for a session whose project folder is missing, without stopping or running claude", async () => {
    const session = await launched(server);
    const callsBefore = server.claudeCalls().length;

    const response = await withoutProjectFolder(server, "open-dough", () =>
      markDone(server, { source: "open-dough", session: session.sessionId }),
    );

    expect(response.status).toBe(404);
    expect(JSON.parse(response.body)).toEqual({
      error:
        "The project folder ~/git/open-dough was not found on this machine.",
    });
    expect(server.claudeCalls()).toHaveLength(callsBefore);
    await expectUnmarkedAndBusy(session);
  });

  for (const refused of [
    {
      request: "from another site",
      status: 403,
      headers: () => ({ Origin: "http://evil.example" }),
    },
    {
      request: "for an unknown project",
      status: 404,
      source: "not-a-real-project",
    },
    {
      request: "that is malformed",
      status: 400,
      extra: { command: "ls" },
    },
  ]) {
    test(`refuses a done request ${refused.request} before running claude`, async () => {
      const session = await launched(server);
      const callsBefore = server.claudeCalls().length;

      const response = await markDone(
        server,
        {
          source: refused.source ?? "open-dough",
          session: session.sessionId,
          ...refused.extra,
        },
        refused.headers?.() ?? { Origin: server.origin },
      );

      expect(response.status).toBe(refused.status);
      expect(server.claudeCalls()).toHaveLength(callsBefore);
      expect(listed(session.shortId)).toMatchObject({ status: "busy" });
    });
  }
});
