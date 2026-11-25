// The local launch boundary (../../server/launchBoundary.ts) over raw HTTP,
// at the boundary server, for a launch that asks for a model: a story or ad
// hoc session starts with `--model <alias>`, a request without a model passes
// none, the record keeps the alias, and a model outside the table is refused
// before any `claude` runs. A chosen effort, or Open Dough's default `medium`
// when none is chosen, goes as `--effort <level>` and is kept in the record;
// one outside Claude Code's levels is refused the same way. A refused launch
// names the model asked for. The synthetic `claude`
// (../../test-support/fixtures/fake-claude) records every call.

import { expect } from "../../test-support/support/pageTest.ts";
import {
  launch,
  machineSessions,
  openDoughFolder,
} from "../../test-support/agentLaunchBoundary.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import { expectAdHocReportingInput } from "../../test-support/support/reportingInputAssertions.ts";
import { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";
import {
  expectStoryInput,
  launchClaude,
  otherExecution,
  queuedExecution,
  test,
} from "../support/installedClaudeLaunch.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const adHocRequest = makeMe.aLaunchRequest.adHoc().please();
const timeLabel = /^Ad hoc work — \d{1,2} [A-Z][a-z]{2}, \d{2}:\d{2}$/;

test.describe(`agent launch boundary, chosen model`, () => {
  let server: DashboardServer;

  test.beforeEach(async ({ installedClaude }) => {
    server = await installedClaude({ codex: true });
  });

  async function execute(body: unknown, instruction = "") {
    const result = await launchClaude(server, body);
    expectStoryInput(server, result, {
      command: `/dough-execute-plan ${queuedExecution.identity}`,
      identity: queuedExecution.identity,
      instruction,
    });
    return result;
  }

  test("starts a story session on the chosen model and keeps the alias", async () => {
    const request = makeMe.aLaunchRequest
      .executing(storyA)
      .requestingModel("opus")
      .withInstruction("go")
      .please();
    const { record, started } = await execute(request, "go");

    expect(started.model).toBe("opus");
    expect(record.request).toMatchObject(request);
    expect(await machineSessions(server)).toContainEqual(
      expect.objectContaining({ request: record.request }),
    );
  });

  test("starts an ad hoc session with no text on the chosen model and no prompt", async () => {
    const request = makeMe.aLaunchRequest
      .adHoc()
      .requestingModel("sonnet")
      .please();
    const { record, started } = await launchClaude(server, request);

    expect(started.cwd).toBe(openDoughFolder(server));
    expect(started.model).toBe("sonnet");
    expect(started).not.toHaveProperty("instruction");
    expect(started.name).toBe(`Open Dough · Ad hoc · ${record.request.title}`);
    expect(record.request.title).toMatch(timeLabel);
    expect(record.request).toMatchObject(request);
    expect(await machineSessions(server)).toContainEqual(
      expect.objectContaining({ request: record.request }),
    );
  });

  test("starts an ad hoc session on the chosen model with its text", async () => {
    const instruction = "look at the build";
    const { record, started } = await launchClaude(
      server,
      makeMe.aLaunchRequest
        .adHoc({ instruction })
        .requestingModel("fable")
        .please(),
    );

    expect(started).toMatchObject({
      model: "fable",
      cwd: openDoughFolder(server),
    });
    expectAdHocReportingInput(
      started.instruction ?? "",
      instruction,
      record.request,
      server,
    );
  });

  test("starts a story session at the chosen effort and keeps it", async () => {
    const request = makeMe.aLaunchRequest
      .executing(storyA)
      .requestingModel("opus")
      .withEffort("high")
      .withInstruction("go")
      .please();
    const { record, started } = await execute(request, "go");

    expect(started).toMatchObject({
      name: `Open Dough · Execution · ${queuedExecution.title}`,
      model: "opus",
      effort: "high",
    });
    expect(record.request).toMatchObject(request);
    expect(await machineSessions(server)).toContainEqual(
      expect.objectContaining({ request: record.request }),
    );
  });

  test("passes Open Dough's default effort when none is chosen, and its record keeps it", async () => {
    const story = await execute(queuedExecution);
    expect(story.started).not.toHaveProperty("model");
    expect(story.started.effort).toBe("medium");
    expect(story.record.request).not.toHaveProperty("model");
    expect(story.record.request.effort).toBe("medium");

    const adHoc = await launchClaude(server, adHocRequest);
    expect(adHoc.started.cwd).toBe(openDoughFolder(server));
    expect(adHoc.started).not.toHaveProperty("model");
    expect(adHoc.started.effort).toBe("medium");
    expect(adHoc.record.request).not.toHaveProperty("model");
    expect(adHoc.record.request.effort).toBe("medium");
  });

  test("refuses a Claude Code effort outside its levels before starting claude, naming them", async () => {
    server.claudeScenario("launched");
    const callsBefore = server.claudeCalls().length;
    const response = await launch(server, {
      ...queuedExecution,
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
      ["story", queuedExecution],
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
    ["story", queuedExecution],
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
    const asked = await launch(server, { ...queuedExecution, model: "opus" });
    const plain = await launch(server, otherExecution);

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
