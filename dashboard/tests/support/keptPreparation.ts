// A retained refinement start fixture. It drives the real HTTP launch and
// continuation surfaces and observes the installed command's workspace,
// published profile, launch instruction, and machine-local start record.
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { execFileSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { expect } from "./pageTest.ts";
import { attempts, continued, launch } from "../agentLaunchBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import { queuedIdentity, queuedTitle, startOrigin } from "./startOrigin.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

export const preparationSlug = "prepare-the-queued-start";
const slug = preparationSlug;
const request = makeMe.aLaunchRequest
  .refining({ identity: queuedIdentity, title: queuedTitle })
  .please();
type Answer = { kind: string; reason?: string; explanation: string };

export type KeptPreparation = Awaited<ReturnType<typeof keptPreparation>>;

export async function keptPreparation() {
  const origin = await startOrigin(queuedReadyRepository().please());
  let server: DashboardServer | undefined;

  function activeServer(): DashboardServer {
    if (server === undefined)
      throw new Error("Preparation server has not started.");
    return server;
  }

  async function serve(startWaitMs: number): Promise<void> {
    server = await startDashboardServer({
      mode: "boundary",
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

  // First announcement fails in pre-commit before publishing; the kept start
  // has no preparation profile, and the hook is removed so continue can run.
  async function keepUnannouncedByFailingPrecommit(): Promise<void> {
    const hooks = path.join(origin.machine, "commit-hooks");
    mkdirSync(hooks);
    const precommit = path.join(hooks, "pre-commit");
    writeFileSync(precommit, "#!/bin/sh\nexit 1\n");
    chmodSync(precommit, 0o755);
    execFileSync("git", ["config", "core.hooksPath", hooks], {
      cwd: origin.project,
    });
    const first = await ask();
    expect(first.kind).toBe("failed");
    expect(first.explanation).toContain("gave no result");
    expect(keptStart()?.["preparation"]).toBeUndefined();
    expect(keptStart()?.["preparationUnannounced"]).toBeUndefined();
    expect(await preparing()).toEqual([]);
    rmSync(precommit);
  }

  // Temporarily replace the installed preparation-assignment entry; restore
  // with the returned function.
  function wrapPreparationAssignment(
    rewrite: (originalPath: string) => string,
  ): () => void {
    const script = path.join(
      origin.project,
      ".claude/skills/dough-story-refinement/scripts/preparation-assignment.mjs",
    );
    const original = path.join(
      path.dirname(script),
      "preparation-assignment-command.mjs",
    );
    copyFileSync(script, original);
    writeFileSync(script, rewrite(original));
    return () => {
      copyFileSync(original, script);
    };
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
    keepUnannouncedByFailingPrecommit,
    wrapPreparationAssignment,
    async close() {
      try {
        await server?.close();
      } finally {
        origin.cleanup();
      }
    },
  };
}
