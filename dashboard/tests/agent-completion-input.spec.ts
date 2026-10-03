import { launchResultSchema } from "../src/launchOutcome.ts";
import { test, expect } from "./support/pageTest.ts";
import { launch, recordsOf } from "./agentLaunchBoundary.ts";
import { startOrigin } from "./support/startOrigin.ts";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import { codexInput } from "../server/hosts/codex/input.ts";
import { cursorPrompt } from "../server/hosts/cursor/prompt.ts";
import { reportingInstruction } from "../server/reportingInstruction.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { RecordedLaunchRequest } from "../src/launchRequest.ts";

test("shared reporting instruction preserves host input grammar and truly blank intent", () => {
  const reporting = {
    reference: "00000000-0000-4000-8000-000000000001",
    origin: "http://127.0.0.1:1234",
    command: "'node' '/installed/report.mjs'",
  };
  const blank: RecordedLaunchRequest = {
    workflow: "ad-hoc",
    source: "open-dough",
    host: "codex",
    title: "Session",
    reporting,
  };
  expect(reportingInstruction(blank)).toBeUndefined();
  expect(codexInput(blank, "/workspace")).toEqual([{ type: "text", text: "" }]);
  expect(cursorPrompt({ ...blank, host: "cursor" }, undefined)).toBeUndefined();

  const request: RecordedLaunchRequest = {
    source: "open-dough",
    host: "cursor",
    workflow: "execution",
    title: "Story",
    identity: "SEED-A#a",
    reporting,
  };
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
  const origin = await startOrigin();
  const server = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
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
