// The local launch boundary (../server/agentLaunchPlugin.ts) over raw HTTP,
// in dev and preview, for a launch that asks for a model: a story's or an ad
// hoc session's `--model <alias>` goes before its instruction, a request
// without a model starts exactly as before, the record keeps the alias, and a
// model outside the table is refused before any `claude` runs. A refused
// launch names the model asked for. The synthetic `claude`
// (./fixtures/fake-claude) records every call.

import { expect, test } from "@playwright/test";
import {
  launch,
  launchRequest,
  machineSessions,
  openDoughFolder,
  title,
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
  test.describe(`agent launch boundary, chosen model (${mode} launch mode)`, () => {
    test.describe.configure({ mode: "serial" });
    let server: DashboardServer;

    test.beforeAll(async () => {
      server = await startDashboardServer({
        mode,
        prebuilt: mode === "preview" ? builtDashboardDir : undefined,
        projectFolders: ["open-dough"],
        codex: true,
      });
    });

    test.afterAll(async () => {
      await server.close();
    });

    // Launches and returns the answered record and the `--bg` call.
    async function launched(body: unknown) {
      server.claudeScenario("launched");
      const callsBefore = server.claudeLaunchCalls().length;
      const response = await launch(server, body);
      expect(response.status).toBe(200);
      const answer = JSON.parse(response.body) as {
        kind: string;
        record: { request: Record<string, unknown> };
      };
      expect(answer.kind).toBe("launched");
      const calls = server.claudeLaunchCalls();
      expect(calls).toHaveLength(callsBefore + 1);
      const call = calls[callsBefore];
      expect(call?.cwd).toBe(openDoughFolder(server));
      return { record: answer.record, argv: call?.argv };
    }

    test("starts a story session on the chosen model before its instruction and keeps the alias", async () => {
      const request = { ...launchRequest, model: "opus", instruction: "go" };
      const { record, argv } = await launched(request);

      expect(argv).toEqual([
        "--bg",
        "--name",
        `Open Dough · Execution · ${title}`,
        "--model",
        "opus",
        `/dough-execute-plan ${launchRequest.identity}\n\ngo`,
      ]);
      expect(record.request).toEqual(request);
      expect(await machineSessions(server)).toContainEqual(
        expect.objectContaining({ request }),
      );
    });

    test("starts an ad hoc session with no text on the chosen model and no prompt", async () => {
      const request = { ...adHocRequest, model: "sonnet" };
      const { record, argv } = await launched(request);

      expect(argv).toHaveLength(5);
      expect(argv?.slice(0, 2)).toEqual(["--bg", "--name"]);
      expect(argv?.[2]).toBe(
        `Open Dough · Ad hoc · ${String(record.request["title"])}`,
      );
      expect(argv?.slice(3)).toEqual(["--model", "sonnet"]);
      expect(record.request["title"]).toMatch(timeLabel);
      expect(record.request).toEqual({
        ...request,
        title: record.request["title"],
      });
      expect(await machineSessions(server)).toContainEqual(
        expect.objectContaining({ request: record.request }),
      );
    });

    test("starts an ad hoc session on the chosen model before its text", async () => {
      const { argv } = await launched({
        ...adHocRequest,
        model: "fable",
        instruction: "look at the build",
      });

      expect(argv).toEqual([
        "--bg",
        "--name",
        "Open Dough · Ad hoc · look at the build",
        "--model",
        "fable",
        "look at the build",
      ]);
    });

    test("passes no model when the request names none, and its record has none", async () => {
      const story = await launched(launchRequest);
      expect(story.argv).not.toContain("--model");
      expect(story.record.request).not.toHaveProperty("model");

      const adHoc = await launched(adHocRequest);
      expect(adHoc.argv).toHaveLength(3);
      expect(adHoc.argv).not.toContain("--model");
      expect(adHoc.record.request).not.toHaveProperty("model");
    });

    for (const [request, model] of [
      ["an alias outside the table", "haiku"],
      ["a full model name", "gpt"],
      ["an empty string", ""],
      ["a number", 4],
      ["null", null],
    ] as const) {
      for (const [kind, body] of [
        ["story", launchRequest],
        ["ad hoc", adHocRequest],
      ] as const) {
        test(`refuses ${request} as the model of ${kind} requests before starting claude`, async () => {
          server.claudeScenario("launched");
          const callsBefore = server.claudeCalls().length;
          const response = await launch(server, { ...body, model });

          expect(response.status).toBe(400);
          expect(server.claudeCalls()).toHaveLength(callsBefore);
        });
      }
    }

    for (const [kind, body] of [
      ["story", launchRequest],
      ["ad hoc", adHocRequest],
    ] as const) {
      test(`refuses a model with Codex on ${kind} requests before starting claude`, async () => {
        server.claudeScenario("launched");
        const callsBefore = server.claudeCalls().length;
        const response = await launch(server, {
          ...body,
          host: "codex",
          model: "opus",
        });

        expect(response.status).toBe(400);
        expect(server.claudeCalls()).toHaveLength(callsBefore);
      });
    }

    test("names the model asked for when claude refuses the launch, and none otherwise", async () => {
      server.claudeScenario("refused");
      const recordsBefore = (await machineSessions(server)).length;
      const asked = await launch(server, { ...launchRequest, model: "opus" });
      const plain = await launch(server, launchRequest);

      const askedAnswer = JSON.parse(asked.body) as { explanation: string };
      const plainAnswer = JSON.parse(plain.body) as { explanation: string };
      expect(askedAnswer).toMatchObject({ kind: "failed", reason: "refused" });
      expect(askedAnswer.explanation).toContain("with model Opus");
      expect(askedAnswer.explanation).toContain(
        "Run `claude` in that folder once",
      );
      expect(plainAnswer).toMatchObject({ kind: "failed", reason: "refused" });
      expect(plainAnswer.explanation).not.toContain("model");
      expect(await machineSessions(server)).toHaveLength(recordsBefore);
    });
  });
}
