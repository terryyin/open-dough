// A claimed Story Branch Mode launch over the real installed start and bare
// origin (./startOrigin.ts), and its trunk integration through the installed
// `history-preserving-publication.mjs integrate`.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { launch, recordsOf } from "../agentLaunchBoundary.ts";
import { installedSkillPath } from "../../server/launchHosts.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { quote, reportingChild } from "./completionRecovery.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { commit, git } from "./launchLanding.ts";
import { requestFor } from "./launchDashboard.ts";
import { expect } from "./pageTest.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { checkedIntegrationCommand } from "./retainedStoryLanding.ts";

export async function claimedRecord(
  server: DashboardServer,
): Promise<LaunchRecord> {
  const record = (
    (await recordsOf(server, "open-dough")) as LaunchRecord[]
  ).find(({ start }) => start !== undefined && !("tracking" in start));
  if (record === undefined) throw new Error("Missing launch record.");
  return record;
}

type Host = "claude" | "codex";

// Launches the queued story's execution in Story Branch Mode and answers its
// kept record, claimed start and reporting with the landing context.
export async function claimedStoryBranchLaunch(
  server: DashboardServer,
  host: Host = "claude",
) {
  if (host === "claude") server.claudeScenario("launched");
  const response = await launch(server, {
    ...requestFor("execution", {
      tracking: "standard",
      workspace: "isolated",
      landing: "review",
    }),
    host,
  });
  expect(
    (JSON.parse(response.body) as { kind: string }).kind,
    response.body,
  ).toBe("launched");
  const record = await claimedRecord(server);
  const start = record.start;
  const reporting = record.request.reporting;
  const landingContext = reporting?.landingContext;
  if (
    start === undefined ||
    "tracking" in start ||
    reporting === undefined ||
    landingContext === undefined
  )
    throw new Error("Missing claimed start with a landing context.");
  return { record, start, reporting, landingContext };
}

// Another writer's own clone of the origin.
export function anotherWriterClone(origin: StartOrigin, name: string) {
  const writer = path.join(origin.machine, `writer-${name}`);
  mkdirSync(writer);
  git(writer, "clone", "--quiet", origin.origin, ".");
  git(writer, "config", "user.name", "Another Writer");
  git(writer, "config", "user.email", "writer@example.test");
  return writer;
}

// Another writer's trunk commit, landed through its own clone, with whatever
// else `alsoChanging` changes there.
export function trunkCommitFromAnotherWriter(
  origin: StartOrigin,
  name: string,
  alsoChanging?: (writer: string) => void,
) {
  const writer = anotherWriterClone(origin, name);
  writeFileSync(path.join(writer, name), `${name}\n`);
  alsoChanging?.(writer);
  git(writer, "add", "-A");
  git(writer, "commit", "-m", `Trunk ${name}`);
  git(writer, "push", "origin", "HEAD:refs/heads/main");
  return git(writer, "rev-parse", "HEAD");
}

// A claimed launch whose story commit is on its remote branch, trunk having
// advanced meanwhile unless told otherwise, and the installed integration
// command for it. `journey` names another host, further story commits made in
// the workspace, and what else the trunk commit changes.
export async function claimedLaunchWithStoryCommit(
  origin: StartOrigin,
  server: DashboardServer,
  trunkAdvanced = true,
  journey: {
    readonly host?: Host;
    readonly storyWork?: (workspace: string) => void;
    readonly trunkWork?: (writer: string) => void;
    readonly localWork?: (workspace: string) => void;
    readonly checkQueuedClosures?: boolean;
  } = {},
) {
  const host = journey.host ?? "claude";
  const { record, start, reporting, landingContext } =
    await claimedStoryBranchLaunch(server, host);
  const { workspace, branch, identity } = start;
  commit(workspace, "story.txt");
  journey.storyWork?.(workspace);
  const storyTip = git(workspace, "rev-parse", "HEAD");
  git(workspace, "push", "origin", `HEAD:refs/heads/${branch}`);
  journey.localWork?.(workspace);
  const reviewedTip = git(workspace, "rev-parse", "HEAD");
  const trunkTip = trunkAdvanced
    ? trunkCommitFromAnotherWriter(origin, "trunk-only.txt", journey.trunkWork)
    : (await origin.originGit("rev-parse", "main")).trim();
  const command = (publishedTip: string, context: readonly string[]) =>
    journey.checkQueuedClosures
      ? checkedIntegrationCommand({
          host,
          workspace,
          branch,
          tip: publishedTip,
          context,
        })
      : [
          process.execPath,
          path.join(
            installedSkillPath(
              host,
              { path: workspace, shown: workspace },
              "dough-execute-plan",
              "scripts",
            ),
            "history-preserving-publication.mjs",
          ),
          "integrate",
          "--workspace",
          workspace,
          "--published-tip",
          publishedTip,
          "--branch",
          branch,
          "--target-ref",
          "refs/heads/main",
          ...context,
        ]
          .map(quote)
          .join(" ");
  const landingContextFlag = ["--landing-context", landingContext];
  // First trunk publication omits --landing-context so an open first-landing
  // expectation supplies the prepared path; explicit context still wins.
  const integrate = (env = process.env) =>
    reportingChild(command(reviewedTip, []), origin.machine, env);
  const integrateWithContext = (env = process.env) =>
    reportingChild(
      command(reviewedTip, landingContextFlag),
      origin.machine,
      env,
    );
  return {
    record,
    start,
    reporting,
    landingContext,
    workspace,
    branch,
    identity,
    storyTip,
    reviewedTip,
    trunkTip,
    integrate,
    integrateWithContext,
    // A later commit made in the workspace and pushed to the story branch, and
    // its trunk publication with or without the launch's landing context.
    laterTrunkPublication: (name: string) => {
      commit(workspace, name);
      const tip = git(workspace, "rev-parse", "HEAD");
      git(workspace, "push", "origin", `HEAD:refs/heads/${branch}`);
      const publish = (context: readonly string[]) =>
        reportingChild(command(tip, context), origin.machine);
      return {
        tip,
        withContext: () => publish(landingContextFlag),
        withoutContext: () => publish([]),
      };
    },
    // The printed result of an integration that exited successfully.
    integrated: async (env = process.env): Promise<unknown> => {
      const ran = await integrate(env);
      expect(ran.ok, ran.stderr).toBe(true);
      return JSON.parse(ran.stdout);
    },
  };
}

export const writeShared = (checkout: string, body: string) => {
  writeFileSync(path.join(checkout, "shared.txt"), body);
};

// Story work that commits its own `shared.txt`.
export const storyChangesShared = (checkout: string) => {
  writeShared(checkout, "story\n");
  git(checkout, "add", "shared.txt");
  git(checkout, "commit", "-m", "Story shared.txt");
};

// A claimed launch whose story commit and trunk both change `shared.txt`, so
// its integration stops on a conflict.
export const conflictedLaunch = (
  origin: StartOrigin,
  server: DashboardServer,
) =>
  claimedLaunchWithStoryCommit(origin, server, true, {
    storyWork: storyChangesShared,
    trunkWork: (writer) => {
      writeShared(writer, "trunk\n");
    },
  });

// Resolves that conflict in the workspace and answers the committed merge.
export const resolveMerge = (workspace: string) => {
  writeShared(workspace, "story and trunk\n");
  git(workspace, "add", "shared.txt");
  git(workspace, "commit", "--no-edit");
  return git(workspace, "rev-parse", "HEAD");
};
