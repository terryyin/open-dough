// The local launch boundary (../server/agentLaunchPlugin.ts) over raw HTTP,
// in dev and preview: a same-origin launch request starts one Claude Code
// background session in the project's folder, on the requested workflow's
// skill and named for its workflow, and answers with the record it keeps;
// each failure answers failed or uncertain and keeps no record. Refused
// requests are ./agent-launch-refusal.spec.ts, how long and where records are
// kept is ./agent-launch-records.spec.ts, and a read of the machine's sessions
// is ./agent-launch-session-listing.spec.ts. The synthetic `claude`
// (./fixtures/fake-claude) on each server's PATH records every call; the
// real one is never reached.

import { expect, test } from "./support/pageTest.ts";
import {
  identity,
  launch,
  launchRequest,
  openDoughFolder,
  recordsOf,
  refinementRequest,
  title,
} from "./agentLaunchBoundary.ts";
import { closeOpenSessions } from "./openStorySessionSetup.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  waitUntil,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { processRunning } from "./support/processGroup.ts";

const launchWaitMs = 4_000;

for (const mode of ["dev", "preview"] as const) {
  const prebuilt = mode === "preview" ? builtDashboardDir : undefined;

  test.describe(`agent launch boundary (${mode} launch mode)`, () => {
    test.describe.configure({ mode: "serial" });
    let server: DashboardServer;

    test.beforeAll(async () => {
      server = await startDashboardServer({
        mode,
        prebuilt,
        projectFolders: ["open-dough", "pygardon"],
        launchTimeoutMs: launchWaitMs,
      });
    });

    test.afterAll(async () => {
      await server.close();
    });

    test.beforeEach(async () => {
      await closeOpenSessions(server);
    });

    test("launches Claude Code in the project folder and keeps the confirmed record", async () => {
      server.claudeScenario("launched");
      const response = await launch(server, launchRequest);

      expect(response.status).toBe(200);
      const answer = JSON.parse(response.body) as {
        kind: string;
        record: { session: { shortId: string; sessionId: string } };
      };
      expect(answer).toMatchObject({
        kind: "launched",
        record: {
          request: launchRequest,
          session: {
            host: "claude",
            name: `Open Dough · Execution · ${title}`,
          },
        },
      });
      const { shortId, sessionId } = answer.record.session;
      expect(shortId).toMatch(/^[0-9a-f]{8}$/);
      expect(sessionId.startsWith(shortId)).toBe(true);
      const folder = openDoughFolder(server);
      // Reading the machine's sessions lists them from the home folder.
      expect(
        server.claudeCalls().filter((call) => call.cwd === folder),
      ).toEqual([
        {
          argv: [
            "--bg",
            "--name",
            `Open Dough · Execution · ${title}`,
            `/dough-execute-plan ${identity}`,
          ],
          cwd: folder,
        },
        { argv: ["agents", "--json", "--all"], cwd: folder },
      ]);
      expect(await recordsOf(server, "open-dough")).toEqual([answer.record]);
      expect(await recordsOf(server, "doughnut")).toEqual([]);
    });

    test("launches refinement on its own skill and name, with the developer's instruction after a blank line", async () => {
      server.claudeScenario("launched");
      const callsBefore = server.claudeCalls().length;
      const instruction = "Focus on the empty-state wording";
      const response = await launch(server, {
        ...refinementRequest,
        instruction,
      });

      expect(JSON.parse(response.body)).toMatchObject({
        kind: "launched",
        record: {
          request: { workflow: "refinement", instruction },
          session: { name: `Open Dough · Refinement · ${title}` },
        },
      });
      expect(server.claudeCalls()[callsBefore]).toEqual({
        argv: [
          "--bg",
          "--name",
          `Open Dough · Refinement · ${title}`,
          `/dough-story-refinement ${identity}\n\n${instruction}`,
        ],
        cwd: openDoughFolder(server),
      });
    });

    test("names the missing project folder and starts no claude", async () => {
      const callsBefore = server.claudeCalls().length;
      const response = await launch(server, {
        ...launchRequest,
        source: "doughnut",
      });

      expect(response.status).toBe(200);
      const answer = JSON.parse(response.body) as { explanation: string };
      expect(answer).toMatchObject({
        kind: "failed",
        reason: "folder-not-found",
      });
      expect(answer.explanation).toContain("~/git/doughnut");
      expect(server.claudeCalls()).toHaveLength(callsBefore);
      expect(await recordsOf(server, "doughnut")).toEqual([]);
    });

    for (const failure of [
      { scenario: "untrusted", reason: "folder-not-trusted" },
      { scenario: "refused", reason: "refused" },
    ] as const) {
      test(`answers ${failure.reason} without forwarding claude's own words, and keeps no record`, async () => {
        server.claudeScenario(failure.scenario);
        const recordsBefore = (await recordsOf(server, "open-dough")).length;
        const response = await launch(server, launchRequest);

        expect(response.status).toBe(200);
        const answer = JSON.parse(response.body) as { explanation: string };
        expect(answer).toMatchObject({
          kind: "failed",
          reason: failure.reason,
        });
        expect(answer.explanation).toContain(
          "Run `claude` in that folder once",
        );
        expect(answer.explanation).toContain("~/git/open-dough");
        expect(response.body).not.toContain(server.home);
        expect(response.body).not.toContain("secret-marker-from-claude-stderr");
        expect(await recordsOf(server, "open-dough")).toHaveLength(
          recordsBefore,
        );
      });
    }

    test("answers uncertain when claude reports a session its listing does not show", async () => {
      server.claudeScenario("unlisted");
      const recordsBefore = (await recordsOf(server, "open-dough")).length;
      const callsBefore = server.claudeCalls().length;
      const response = await launch(server, launchRequest);

      const answer = JSON.parse(response.body) as { explanation: string };
      expect(answer).toMatchObject({
        kind: "uncertain",
        reason: "unconfirmed",
      });
      expect(answer.explanation).toContain("claude agents");
      expect(
        server
          .claudeCalls()
          .slice(callsBefore)
          .map((call) => call.argv[0]),
      ).toEqual(["--bg", "agents"]);
      expect(await recordsOf(server, "open-dough")).toHaveLength(recordsBefore);
    });

    test("answers uncertain once the launch wait expires, and ends the waiting claude", async () => {
      server.claudeScenario("hang");
      const recordsBefore = (await recordsOf(server, "open-dough")).length;
      const started = Date.now();
      // The previous launch's uncertain outcome leaves its story unresolved,
      // so this one starts another story.
      const response = await launch(server, {
        ...launchRequest,
        identity: `${identity}-wait`,
      });

      expect(Date.now() - started).toBeGreaterThanOrEqual(launchWaitMs - 100);
      const answer = JSON.parse(response.body) as { explanation: string };
      expect(answer).toMatchObject({ kind: "uncertain", reason: "timed-out" });
      expect(answer.explanation).toContain("claude agents");
      expect(
        await waitUntil(() => !processRunning(server.heldClaudePid()), {
          timeoutMs: 5_000,
        }),
      ).toBe(true);
      expect(server.heldClaudeEndedBy()).toBe("SIGTERM");
      expect(await recordsOf(server, "open-dough")).toHaveLength(recordsBefore);
    });
  });

  test.describe(`agent launch boundary without Claude Code (${mode} launch mode)`, () => {
    let server: DashboardServer;

    test.beforeAll(async () => {
      server = await startDashboardServer({
        mode,
        prebuilt,
        projectFolders: ["open-dough"],
        claude: "absent",
      });
    });

    test.afterAll(async () => {
      await server.close();
    });

    test("answers not-installed and keeps no record", async () => {
      const response = await launch(server, launchRequest);

      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toMatchObject({
        kind: "failed",
        reason: "not-installed",
      });
      expect(server.claudeCalls()).toEqual([]);
      expect(await recordsOf(server, "open-dough")).toEqual([]);
    });
  });
}
