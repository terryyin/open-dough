// A retained refinement start fixture. It drives the real HTTP launch and
// continuation surfaces and observes the installed command's workspace,
// published profile, launch instruction, and machine-local start record.
import { chmodSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "./pageTest.ts";
import {
  attempts,
  continued,
  launch,
  launchRequest,
} from "../agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import { queuedIdentity, queuedTitle, startOrigin } from "./startOrigin.ts";

export const preparationSlug = "prepare-the-queued-start";
const slug = preparationSlug;
const request = {
  ...launchRequest,
  workflow: "refinement",
  identity: queuedIdentity,
  title: queuedTitle,
};
type Answer = { kind: string; reason?: string; explanation: string };

export type KeptPreparation = Awaited<ReturnType<typeof keptPreparation>>;

export async function keptPreparation() {
  const origin = await startOrigin();
  let server: DashboardServer | undefined;

  function activeServer(): DashboardServer {
    if (server === undefined)
      throw new Error("Preparation server has not started.");
    return server;
  }

  async function serve(startWaitMs: number): Promise<void> {
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
      extraEnv: { DOUGH_START_TIMEOUT_MS: String(startWaitMs) },
    });
  }

  const hook = () => path.join(origin.origin, "hooks", "pre-receive");
  function installHook(body: string): void {
    writeFileSync(hook(), `#!/bin/sh\n${body}`);
    chmodSync(hook(), 0o755);
  }
  const keptStart = () =>
    (
      JSON.parse(
        readFileSync(
          path.join(
            origin.machine,
            "home/.open-dough/dashboard/refinement-starts.json",
          ),
          "utf8",
        ),
      ) as { "open-dough"?: Record<string, Record<string, unknown>> }
    )["open-dough"]?.[queuedIdentity];
  const preparing = async () =>
    (await origin.takenProfiles()).filter(
      (profile) => profile["activity"] === "preparation",
    );

  async function ask(): Promise<Answer> {
    return JSON.parse((await launch(activeServer(), request)).body) as Answer;
  }

  // Continues the story's latest attempt, which still needs reconciliation.
  async function resume(): Promise<Answer> {
    const latest = (await attempts(activeServer())).at(-1)?.id ?? "";
    return JSON.parse((await continued(activeServer(), latest)).body) as Answer;
  }

  // The start resumed by `again`: one session in the kept workspace, one
  // preparation profile, one workspace, and nothing kept.
  async function expectResumed(again = resume): Promise<void> {
    const second = await again();
    expect(second.kind, second.explanation).toBe("launched");
    const workspace = path.join(origin.project, ".worktrees", slug);
    const [call] = activeServer().claudeLaunchCalls().slice(-1);
    expect(call?.cwd).toContain(slug);
    const instruction = call?.argv.at(-1) ?? "";
    expect(instruction).toContain("Established preparation:");
    expect(instruction).toContain(`- workspace: ${workspace}`);
    expect(instruction).toContain(`- branch: claude/${slug}`);
    expect(await preparing()).toHaveLength(1);
    expect(readdirSync(path.join(origin.project, ".worktrees"))).toEqual([
      slug,
    ]);
    expect(keptStart()).toBeUndefined();
  }

  return {
    origin,
    get server() {
      return activeServer();
    },
    serve,
    hook,
    installHook,
    keptStart,
    preparing,
    ask,
    resume,
    expectResumed,
    async close() {
      try {
        await server?.close();
      } finally {
        origin.cleanup();
      }
    },
  };
}
