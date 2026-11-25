import { execFile } from "node:child_process";
import {
  chmodSync,
  existsSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptAttempts } from "../../test-support/acceptedAttempts.ts";
import {
  attempts,
  continued,
  launch,
} from "../../test-support/agentLaunchBoundary.ts";
import { startDashboardServer } from "../../test-support/support/dashboardServer.ts";
import { admittedStory } from "../../test-support/support/isolatedSessionAdmissionProof.ts";
import { keptSessionStarts } from "../../test-support/support/keptSessionStart.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { fsPromisesHook } from "../../test-support/support/serverFsHook.ts";
import type { StartOrigin } from "../../test-support/support/startOrigin.ts";
import { worktree } from "../../test-support/support/startSessionLanding.ts";

const exec = promisify(execFile);
const title = "Retry admission";
const request = makeMe.aLaunchRequest
  .adHoc()
  .withInstruction(title)
  .withPolicy({ workspace: "isolated", landing: "review" })
  .please();

const head = async (origin: StartOrigin) =>
  (await origin.originGit("rev-parse", "refs/heads/main")).trim();

test("Continue allocates a new story after a competing claim wins", async ({
  dashboard,
  origin,
}) => {
  const branch = "claude/retry-admission";
  const workspace = worktree(origin.project, "retry-admission");
  const held = path.join(origin.machine, "contender-held");
  const release = path.join(origin.machine, "contender-released");
  const hooks = path.join(origin.project, ".git", "hooks");
  const hook = path.join(hooks, "pre-push");
  await exec("git", ["-C", origin.project, "config", "core.hooksPath", hooks]);
  writeFileSync(
    hook,
    `#!/bin/sh
if [ "$(git branch --show-current)" = '${branch}' ]; then
  touch '${held}'
  while [ ! -e '${release}' ]; do sleep 0.05; done
fi
`,
  );
  chmodSync(hook, 0o755);
  dashboard.claudeScenario("launched");
  const first = launch(dashboard, request);
  try {
    // The push is reached after the installed start drafts, fetches and
    // creates the worktree, however long the machine takes.
    await expect.poll(() => existsSync(held), { timeout: 30_000 }).toBe(true);
    const { stdout: losingHead } = await exec("git", [
      "-C",
      workspace,
      "rev-parse",
      "HEAD",
    ]);
    const [attempt] = await attempts(dashboard);
    if (attempt === undefined)
      throw new Error("No accepted Dashboard attempt.");
    const script = path.join(
      origin.project,
      ".claude/skills/dough-execute-plan/scripts/execution-start.mjs",
    );
    const repository = ["--repository", origin.project, "--target", "main"];
    const { stdout } = await exec(process.execPath, [
      script,
      "draft",
      ...repository,
      "--title",
      "A competing admission",
      "--goal",
      "A competing admission",
    ]);
    const draft = JSON.parse(stdout) as {
      identity: string;
      link: string;
      title: string;
      ownedDraft: unknown;
    };
    await exec(process.execPath, [
      script,
      "start",
      ...repository,
      "--workspace",
      path.join(origin.machine, "rival"),
      "--branch",
      "exec/rival",
      "--mode",
      "trunk",
      "--push-authorized",
      "--workspace-authorized",
      "--admit",
      "--identity",
      draft.identity,
      "--link",
      draft.link,
      "--title",
      draft.title,
      "--owned-draft",
      JSON.stringify(draft.ownedDraft),
      "--publisher-id",
      "competing-owner",
    ]);
    const winner = await head(origin);
    writeFileSync(release, "");
    expect(JSON.parse((await first).body)).toMatchObject({
      kind: "failed",
      reason: "start-refused",
      explanation: expect.stringContaining("Taken by another agent"),
    });
    expect(dashboard.claudeLaunchCalls()).toHaveLength(0);
    expect(await head(origin)).toBe(winner);
    expect(keptSessionStarts(origin)[attempt.id]).toMatchObject({
      claim: { retained: { candidateSha: losingHead.trim() } },
    });

    expect(
      JSON.parse((await continued(dashboard, attempt.id)).body),
    ).toMatchObject({ kind: "launched" });
    const published = await admittedStory(origin, title);
    expect(published.identity).not.toBe(draft.identity);
    expect((await admittedStory(origin, draft.title)).identity).toBe(
      draft.identity,
    );
    expect((await origin.originGit("rev-parse", "main^")).trim()).toBe(winner);
    expect(keptAttempts(dashboard)).toEqual([
      expect.objectContaining({
        id: attempt.id,
        publication: {
          kind: "published",
          identity: published.identity,
          revision: published.revision,
        },
      }),
    ]);
    expect(dashboard.claudeLaunchCalls()).toEqual([
      expect.objectContaining({ cwd: realpathSync(workspace) }),
    ]);
    const preserved = `refs/worktree/dough/rejected-admission/${losingHead.trim()}`;
    expect(
      (await exec("git", ["-C", workspace, "rev-parse", preserved])).stdout,
    ).toBe(losingHead);
  } finally {
    writeFileSync(release, "");
    await first.catch(() => undefined);
  }
});

test("Continue records a previously accepted publication before native startup", async ({
  origin,
  github,
}) => {
  const blocked = path.join(origin.machine, "refuse-publication-receipt");
  const extraEnv = fsPromisesHook(
    path.join(origin.machine, "refuse-publication-receipt.mjs"),
    "rename",
    `async (from, to, ...args) => {
      if (String(to).endsWith('/launch-attempts.json') && fs.existsSync(${JSON.stringify(blocked)}) &&
          fs.readFileSync(from, 'utf8').includes('"kind": "published"'))
        throw new Error('Cannot write the publication receipt');
      return original(from, to, ...args);
    }`,
  );
  writeFileSync(blocked, "");
  const dashboard = await startDashboardServer({
    mode: "boundary",
    liveServer: "separate process",
    github,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    extraEnv,
  });
  try {
    dashboard.claudeScenario("launched");
    const refused = JSON.parse((await launch(dashboard, request)).body) as {
      explanation?: string;
    };
    const [attempt] = keptAttempts(dashboard);
    if (attempt === undefined) throw new Error("No kept Dashboard attempt.");
    const published = await admittedStory(origin, title);
    expect(refused).toMatchObject({
      kind: "failed",
      reason: "unrecorded",
      explanation: expect.stringContaining(
        "Cannot write the publication receipt",
      ),
    });
    expect(refused.explanation).toContain(published.revision);
    expect(keptSessionStarts(origin)[attempt.id]).toMatchObject({
      claim: { publishedSha: published.revision },
    });
    expect(attempt.publication.kind).toBe("unknown");
    expect(dashboard.claudeLaunchCalls()).toHaveLength(0);

    rmSync(blocked);
    expect(
      JSON.parse((await continued(dashboard, attempt.id)).body),
    ).toMatchObject({ kind: "launched" });
    expect(await head(origin)).toBe(published.revision);
    expect(keptAttempts(dashboard)).toEqual([
      expect.objectContaining({
        id: attempt.id,
        publication: {
          kind: "published",
          identity: published.identity,
          revision: published.revision,
        },
      }),
    ]);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  } finally {
    rmSync(blocked, { force: true });
    await dashboard.close();
  }
});
