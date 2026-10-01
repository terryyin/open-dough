// The same native reconciliation rule preserves a real published preparation.
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "./support/preparationPage.ts";
import { stored } from "./support/codexLaunch.ts";
import { launch, launchRequest, keptStarts } from "./agentLaunchBoundary.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
test.use({ preparationHost: "codex" });
test("accepted input with lost acknowledgment resumes its prepared conversation without another announcement or input", async ({
  page,
  dashboard,
  origin,
  github,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  const request = {
    ...launchRequest,
    host: "codex",
    workflow: "refinement",
    identity: queuedIdentity,
    title: "Story A",
    options: ["--explore"],
    instruction: "Keep this preparation context.",
  };
  native.hold = true;
  const starting = launch(dashboard, request);
  await expect.poll(() => native.history.length, { timeout: 30_000 }).toBe(1);
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
    explanation: expect.stringContaining(
      "already being reconciled or submitted",
    ),
  });
  native.failConnection();
  expect(JSON.parse((await starting).body)).toMatchObject({
    kind: "uncertain",
  });
  const initial = stored(dashboard.home)[0];
  expect(initial?.firstInput).toMatchObject({ state: "uncertain" });
  const workspace = path.join(origin.project, ".worktrees/story-a");
  expect(initial?.preparation?.workspace).toBe(workspace);
  const publication = (await origin.originGit("rev-parse", "main")).trim();
  const profiles = await origin.takenProfiles();
  expect(profiles).toHaveLength(1);
  expect(profiles[0]?.["host"]).toBe("codex");
  expect(await keptStarts(dashboard)).toHaveLength(1);
  // Native recovery has precedence over preparation continuation. Even lost
  // local preparation evidence must not cause a replacement native launch.
  execFileSync("git", [
    "-C",
    workspace,
    "update-ref",
    "-d",
    "refs/worktree/dough/preparation-assignment",
  ]);
  await dashboard.close();
  native.completeOnResume = true;
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    github,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    codexProtocol: protocol,
  });
  try {
    const answer = JSON.parse(
      (
        await launch(restarted, {
          ...request,
          instruction: "Ignore this changed retry text.",
        })
      ).body,
    ) as { kind: string };
    expect(answer.kind).toBe("launched");
    const recovered = stored(restarted.home)[0];
    expect(recovered).toMatchObject({
      request: initial?.request,
      preparation: initial?.preparation,
      launchedAt: initial?.launchedAt,
      session: initial?.session,
      firstInput: {
        state: "confirmed",
        turnId: "native-turn-id",
        instruction: initial?.firstInput?.instruction,
      },
    });
    expect(
      recovered?.firstInput?.instruction?.match(/Established preparation:/g),
    ).toHaveLength(1);
    expect(await keptStarts(restarted)).toEqual([]);
    expect(
      native.calls
        .filter((call) => call.method === "thread/start")
        .map((call) => call.params),
    ).toEqual([{ cwd: workspace }]);
    expect(
      native.calls
        .filter(
          (call) =>
            call.method === "thread/read" &&
            call.params["includeTurns"] === true,
        )
        .map((call) => call.params),
    ).toEqual([{ threadId: initial?.session.sessionId, includeTurns: true }]);
    expect(
      native.calls
        .filter((call) => call.method === "thread/resume")
        .map((call) => call.params),
    ).toEqual([{ threadId: initial?.session.sessionId }]);
    expect(
      native.calls.filter((call) => call.method === "turn/start"),
    ).toHaveLength(1);
    expect(await origin.takenProfiles()).toEqual(profiles);
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
      publication,
    );
    expect(readdirSync(path.join(origin.project, ".worktrees"))).toEqual([
      "story-a",
    ]);
    expect(restarted.claudeLaunchCalls()).toEqual([]);
    await expect.poll(() => native.sockets.size).toBe(0);
  } finally {
    await restarted.close();
  }
});
