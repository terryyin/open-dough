// The local launch boundary (../server/agentLaunchPlugin.ts) over raw HTTP,
// in dev and preview, for an ad hoc session: a project's folder and no story.
// The server derives the label, names the session `<project> · Ad hoc ·
// <label>`, starts it with the developer's text as typed or with no prompt at
// all, and keeps the label as the record's title. Refused requests start no
// `claude`. Story launches are ./agent-launch-boundary.spec.ts. The synthetic
// `claude` (./fixtures/fake-claude) records every call.

import { expect, test } from "@playwright/test";
import {
  launch,
  launchRequest,
  machineSessions,
  openDoughFolder,
} from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

const adHocRequest = {
  source: "open-dough",
  workflow: "ad-hoc",
  host: "claude",
};
const timeLabel = /^\d{1,2} [A-Z][a-z]{2}, \d{2}:\d{2}$/;

for (const mode of ["dev", "preview"] as const) {
  test.describe(`agent launch boundary, ad hoc (${mode} launch mode)`, () => {
    test.describe.configure({ mode: "serial" });
    let server: DashboardServer;

    test.beforeAll(async () => {
      server = await startDashboardServer({
        mode,
        prebuilt: mode === "preview" ? builtDashboardDir : undefined,
        projectFolders: ["open-dough"],
      });
    });

    test.afterAll(async () => {
      await server.close();
    });

    // Launches and returns the answered record and the `--bg` call's argv.
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
        record: {
          request: Record<string, unknown>;
          session: { name: string };
        };
      };
      expect(answer.kind).toBe("launched");
      const call = server.claudeCalls()[callsBefore];
      expect(call?.cwd).toBe(openDoughFolder(server));
      return { record: answer.record, argv: call?.argv };
    }

    test("starts a session named for the text, keeps the label, and lists it", async () => {
      const text = "why is the CI slow on main?";
      const { record, argv } = await launched(text);
      const label = text;

      expect(argv).toEqual([
        "--bg",
        "--name",
        `Open Dough · Ad hoc · ${label}`,
        text,
      ]);
      expect(record.request).toEqual({
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
        const { record, argv } = await launched(instruction);

        expect(argv).toHaveLength(3);
        expect(argv?.slice(0, 2)).toEqual(["--bg", "--name"]);
        expect(argv?.[2]).toBe(
          `Open Dough · Ad hoc · ${String(record.request["title"])}`,
        );
        expect(record.request["title"]).toMatch(timeLabel);
      });
    }

    test("cuts a long multi-line text to 40 characters and sends it as typed", async () => {
      const text =
        "Investigate the\n\tslow\t\tbuild step and why\r\nit regressed lately";
      const { record, argv } = await launched(text);

      expect(record.request["title"]).toBe(
        "Investigate the slow build step and why …",
      );
      expect(argv).toEqual([
        "--bg",
        "--name",
        `Open Dough · Ad hoc · ${String(record.request["title"])}`,
        text,
      ]);
    });

    test("names the session for the launch time when the text holds a control character", async () => {
      const text = "beep\u0007 please";
      const { record, argv } = await launched(text);

      expect(record.request["title"]).toMatch(timeLabel);
      expect(argv?.[3]).toBe(text);
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
        request: "for Codex",
        status: 400,
        body: { ...adHocRequest, host: "codex" },
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
}
