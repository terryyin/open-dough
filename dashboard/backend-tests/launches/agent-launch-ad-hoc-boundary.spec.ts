import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
// The local launch boundary (../../server/launchBoundary.ts) over raw HTTP,
// at the boundary server, for an ad hoc session: a project's execution checkout and no story.
// The server derives the label, names the session `<project> · Ad hoc ·
// <label>`, starts it at Open Dough's default effort with the developer's text
// as typed or with no prompt at all, and keeps the label as the record's
// title. Refused requests start no `claude`. Story launches are
// ./agent-launch-boundary.spec.ts. The synthetic `claude`
// (../../test-support/fixtures/fake-claude) records every call.

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  launch,
  launchRequest,
  machineSessions,
  openDoughFolder,
} from "../../test-support/agentLaunchBoundary.ts";
import { claudeLaunch } from "../../test-support/support/claudeLaunch.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  adHocDeveloperInput,
  expectAdHocReportingInput,
} from "../../test-support/support/reportingInputAssertions.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";

const adHocRequest = makeMe.aLaunchRequest.adHoc().please();
const timeLabel = /^Ad hoc work — \d{1,2} [A-Z][a-z]{2}, \d{2}:\d{2}$/;

test.describe(`agent launch boundary, ad hoc`, () => {
  test.describe.configure({ mode: "serial" });
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      mode: "boundary",
      projectFolders: ["open-dough"],
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  // Launches and returns the answered record and the `--bg` launch read from
  // its call.
  async function launched(instruction?: string) {
    server.claudeScenario("launched");
    const callsBefore = server.claudeCalls().length;
    const response = await launch(server, {
      ...adHocRequest,
      ...(instruction === undefined ? {} : { instruction }),
    });
    expect(response.status).toBe(200);
    const answer = JSON.parse(response.body) as {
      kind: string;
      record: LaunchRecord;
    };
    expect(answer.kind).toBe("launched");
    const call = server.claudeCalls()[callsBefore];
    expect(call?.cwd).toBe(openDoughFolder(server));
    return {
      record: answer.record,
      started: call && claudeLaunch(call),
    };
  }

  test("starts a session named for the text, keeps the label, and lists it", async () => {
    const text = "why is the CI slow on main?";
    const { record, started } = await launched(text);
    const label = text;

    expect(started).toMatchObject({
      cwd: openDoughFolder(server),
      name: `Open Dough · Ad hoc · ${label}`,
      effort: "medium",
    });
    expectAdHocReportingInput(
      started?.instruction ?? "",
      text,
      record.request,
      server,
    );
    expect(record.request).toMatchObject({
      ...adHocRequest,
      title: label,
      instruction: text,
    });
    expect(record.request).not.toHaveProperty("identity");
    expect(await machineSessions(server)).toContainEqual(
      expect.objectContaining({ request: record.request }),
    );
  });

  for (const [blank, instruction] of [
    ["no text", undefined],
    ["only spaces", "   "],
  ] as const) {
    test(`starts a session with no prompt for ${blank}, named for the launch time`, async () => {
      const { record, started } = await launched(instruction);

      expect(started).not.toHaveProperty("instruction");
      expect(started?.name).toBe(
        `Open Dough · Ad hoc · ${record.request.title}`,
      );
      expect(record.request["title"]).toMatch(timeLabel);
    });
  }

  test("cuts a long multi-line text to 40 characters and sends it as typed", async () => {
    const text =
      "Investigate the\n\tslow\t\tbuild step and why\r\nit regressed lately";
    const { record, started } = await launched(text);

    expect(record.request["title"]).toBe(
      "Investigate the slow build step and why …",
    );
    expect(started).toMatchObject({
      name: `Open Dough · Ad hoc · ${record.request.title}`,
    });
    expect(adHocDeveloperInput(started?.instruction ?? "")).toBe(text);
  });

  test("names the session for the launch time when the text holds a control character", async () => {
    const text = "beep\u0007 please";
    const { record, started } = await launched(text);

    expect(record.request["title"]).toMatch(timeLabel);
    expect(adHocDeveloperInput(started?.instruction ?? "")).toBe(text);
  });

  for (const refused of [
    {
      request: "from another site",
      status: 403,
      headers: { Origin: "http://evil.example" },
    },
    {
      request: "for an unknown project",
      status: 404,
      body: { ...adHocRequest, source: "not-a-real-project" },
    },
    {
      request: "naming an identity",
      status: 400,
      body: { ...adHocRequest, identity: launchRequest.identity },
    },
    {
      request: "with text over the limit",
      status: 400,
      body: { ...adHocRequest, instruction: "x".repeat(4_001) },
    },
  ]) {
    test(`refuses an ad hoc request ${refused.request} before starting claude`, async () => {
      server.claudeScenario("launched");
      const callsBefore = server.claudeCalls().length;
      const response = await launch(
        server,
        refused.body ?? adHocRequest,
        refused.headers ?? { Origin: server.origin },
      );

      expect(response.status).toBe(refused.status);
      expect(server.claudeCalls()).toHaveLength(callsBefore);
    });
  }
});
