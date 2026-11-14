// A Codex start whose created conversation identity cannot be recorded
// submits no first input and explains the exact known continuation, whose
// command resumes that conversation; a later Start stays uncertain without
// creating another. The synthetic Codex app server records the protocol.
// Durable creation evidence across restarts and reloads:
// ../../../e2e/launches/agent-launch-codex-creation.spec.ts.
import { chmodSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import type { FakeCodex } from "../../tests/support/fakeCodex.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../tests/launchJourney.ts";
import { launch, machineSessions } from "../../tests/agentLaunchBoundary.ts";
import { test, expect } from "../../tests/support/codexLaunch.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
const request = makeMe.aLaunchRequest
  .refining({
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  })
  .withInstruction("Preserve this exact intent.")
  .please();
test.use({ projectFolders: ["open-dough"] });

type Answer = { kind: string; explanation: string };
const answerOf = async (server: DashboardServer) =>
  JSON.parse((await launch(server, request)).body) as Answer;
const callsTo = (native: FakeCodex, method: string) =>
  native.calls.filter((call) => call.method === method);

test("failed identity recording prevents first input and explains the exact known continuation", async ({
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const directory = path.join(dashboard.home, ".open-dough/dashboard");
  native.threadId = "known id's identity";
  native.afterCreation = () => {
    chmodSync(directory, 0o555);
  };
  try {
    const result = await answerOf(dashboard);
    expect(result.kind).toBe("uncertain");
    expect(result.explanation).toContain(native.threadId);
    expect(result.explanation).toContain("No first input was submitted");
    expect(result.explanation).toContain("could not be saved");
    expect(result.explanation).toContain("'codex' 'resume' '--remote'");
    const command = result.explanation.split("`")[1];
    expect(command).toBeDefined();
    execFileSync("/bin/sh", ["-c", command ?? ""], {
      env: { ...process.env, ...native.env },
      stdio: "pipe",
    });
    expect(
      JSON.parse(readFileSync(native.env["FAKE_CODEX_CLI_LOG"] ?? "", "utf8")),
    ).toEqual([
      "resume",
      "--remote",
      `unix://${native.env["FAKE_CODEX_SOCKET"]}`,
      "--cd",
      path.join(dashboard.home, "git/open-dough"),
      native.threadId,
    ]);
    expect(callsTo(native, "turn/start")).toHaveLength(0);
    expect(await machineSessions(dashboard)).toEqual([]);
    await expect.poll(() => native.sockets.size).toBe(0);
  } finally {
    chmodSync(directory, 0o755);
  }
  expect(await answerOf(dashboard)).toMatchObject({ kind: "uncertain" });
  expect(callsTo(native, "thread/start")).toHaveLength(1);
});
