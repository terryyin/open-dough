// The local launch boundary (../../server/launchBoundary.ts) over raw HTTP,
// at the boundary server, for a launch that asks for a model: a story's or an ad
// hoc session's `--model <alias>` goes before its instruction, a request
// without a model starts exactly as before, the record keeps the alias, and a
// model outside the table is refused before any `claude` runs. A chosen
// effort goes as `--effort <level>` after the model, and one outside Claude
// Code's levels is refused the same way. A refused launch names the model
// asked for. The synthetic `claude`
// (../../tests/fixtures/fake-claude) records every call.

import { expect, test } from "../../tests/support/pageTest.ts";
import {
  launch,
  identity,
  launchRequest,
  machineSessions,
  openDoughFolder,
  title,
} from "../../tests/agentLaunchBoundary.ts";
import { closeOpenSessions } from "../../tests/openStorySessionSetup.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

const adHocRequest = makeMe.aLaunchRequest.adHoc().please();
const timeLabel = /^\d{1,2} [A-Z][a-z]{2}, \d{2}:\d{2}$/;

test.describe(`agent launch boundary, chosen model`, () => {
  test.describe.configure({ mode: "serial" });
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      mode: "boundary",
      projectFolders: ["open-dough"],
      codex: true,
      doneRenameWaitMs: 100,
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  // Launches and returns the answered record and the `--bg` call.
  async function launched(body: unknown) {
    await closeOpenSessions(server);
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
    const request = makeMe.aLaunchRequest
      .executing({ identity, title })
      .requestingModel("opus")
      .withInstruction("go")
      .please();
    const { record, argv } = await launched(request);

    expect(argv).toEqual([
      "--bg",
      "--name",
      `Open Dough · Execution · ${title}`,
      "--model",
      "opus",
      `/dough-execute-plan ${identity}\n\ngo`,
    ]);
    expect(record.request).toEqual(request);
    expect(await machineSessions(server)).toContainEqual(
      expect.objectContaining({ request }),
    );
  });

  test("starts an ad hoc session with no text on the chosen model and no prompt", async () => {
    const request = makeMe.aLaunchRequest
      .adHoc()
      .requestingModel("sonnet")
      .please();
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
    const { argv } = await launched(
      makeMe.aLaunchRequest
        .adHoc({ instruction: "look at the build" })
        .requestingModel("fable")
        .please(),
    );

    expect(argv).toEqual([
      "--bg",
      "--name",
      "Open Dough · Ad hoc · look at the build",
      "--model",
      "fable",
      "look at the build",
    ]);
  });

  test("starts a story session at the chosen effort after its model and keeps it", async () => {
    const request = makeMe.aLaunchRequest
      .executing({ identity, title })
      .requestingModel("opus")
      .withEffort("high")
      .withInstruction("go")
      .please();
    const { record, argv } = await launched(request);

    expect(argv).toEqual([
      "--bg",
      "--name",
      `Open Dough · Execution · ${title}`,
      "--model",
      "opus",
      "--effort",
      "high",
      `/dough-execute-plan ${identity}\n\ngo`,
    ]);
    expect(record.request).toEqual(request);
  });

  test("passes no model or effort when the request names none, and its record has none", async () => {
    const story = await launched(launchRequest);
    expect(story.argv).not.toContain("--model");
    expect(story.argv).not.toContain("--effort");
    expect(story.record.request).not.toHaveProperty("model");
    expect(story.record.request).not.toHaveProperty("effort");

    const adHoc = await launched(adHocRequest);
    expect(adHoc.argv).toHaveLength(3);
    expect(adHoc.argv).not.toContain("--model");
    expect(adHoc.argv).not.toContain("--effort");
    expect(adHoc.record.request).not.toHaveProperty("model");
    expect(adHoc.record.request).not.toHaveProperty("effort");
  });

  test("refuses a Claude Code effort outside its levels before starting claude, naming them", async () => {
    server.claudeScenario("launched");
    const callsBefore = server.claudeCalls().length;
    const response = await launch(server, {
      ...launchRequest,
      effort: "extreme",
    });

    expect(response.status).toBe(400);
    expect(response.body).toContain(
      "Claude Code reasoning effort must be one of low, medium, high, xhigh, max.",
    );
    expect(server.claudeCalls()).toHaveLength(callsBefore);
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
