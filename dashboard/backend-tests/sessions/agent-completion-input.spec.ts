import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { requestFacts } from "../../../Distribution/tests/support/launchRequestTestData.mjs";
import { launchResultSchema } from "../../src/launchOutcome.ts";
import { test, expect } from "../../tests/support/pageTest.ts";
import { launch, recordsOf } from "../../tests/agentLaunchBoundary.ts";
import { startOrigin } from "../../tests/support/startOrigin.ts";
import { startDashboardServer } from "../../tests/support/dashboardServer.ts";
import { codexInput } from "../../server/hosts/codex/input.ts";
import { cursorPrompt } from "../../server/hosts/cursor/prompt.ts";
import { reportingInstruction } from "../../server/reportingInstruction.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { RecordedLaunchRequest } from "../../src/launchRequest.ts";

test("shared reporting instruction preserves host input grammar and truly blank intent", () => {
  const reporting = {
    reference: "00000000-0000-4000-8000-000000000001",
    origin: "http://127.0.0.1:1234",
    command: "'node' '/installed/report.mjs'",
  };
  const blank: RecordedLaunchRequest = requestFacts(
    { workflow: "ad-hoc", title: "Session", source: "open-dough" },
    { host: "codex", reporting },
  ).request;
  expect(reportingInstruction(blank)).toBeUndefined();
  expect(codexInput(blank, "/workspace")).toEqual([{ type: "text", text: "" }]);
  expect(cursorPrompt({ ...blank, host: "cursor" }, undefined)).toBeUndefined();

  const request: RecordedLaunchRequest = requestFacts(
    {
      workflow: "execution",
      identity: "SEED-A#a",
      title: "Story",
      source: "open-dough",
    },
    { host: "cursor", reporting },
  ).request;
  const instruction = reportingInstruction(request);
  expect(cursorPrompt(request, undefined)).toBe(
    `/dough-execute-plan SEED-A#a\n\n${instruction}`,
  );
  expect(codexInput({ ...request, host: "codex" }, "/workspace")[0]).toEqual({
    type: "text",
    text: `$dough-execute-plan SEED-A#a\n\n${reportingInstruction({ ...request, host: "codex" })}`,
  });
});

test("Claude native blank launch gains no reporting instruction despite an installed channel", async () => {
  const origin = await startOrigin(queuedReadyRepository().please());
  const server = await startDashboardServer({
    mode: "boundary",
    machine: origin.machine,
    projectFolders: ["open-dough"],
  });
  try {
    expect(
      launchResultSchema.parse(
        JSON.parse(
          (
            await launch(server, {
              source: "open-dough",
              host: "claude",
              workflow: "ad-hoc",
              instruction: "   ",
            })
          ).body,
        ),
      ).kind,
    ).toBe("launched");
    const call = server.claudeLaunchCalls()[0];
    expect(call?.argv).toHaveLength(3);
    expect(call?.argv.slice(0, 2)).toEqual(["--bg", "--name"]);
    const [record] = (await recordsOf(server, "open-dough")) as LaunchRecord[];
    expect(record?.request.reporting).toBeUndefined();
  } finally {
    await server.close();
    origin.cleanup();
  }
});
