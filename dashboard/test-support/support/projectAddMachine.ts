import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
  type DashboardServerMode,
} from "./dashboardServer.ts";
import type { FakeGhTransport } from "./fakeGh.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { everyRepository, publishes } from "./fakeGitHub.ts";
import { describedBacklog } from "../describedRevisions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { commitOf } from "../committedOriginRepo.ts";
import { initializeStartOrigin } from "./startOriginInitialization.ts";
import { gitHubRepositoryUrl } from "./fixtureOriginRoute.ts";
import {
  projectConfigurationFile,
  projectEnvironmentOf,
} from "./projectConfiguration.ts";

export const addedRepository = "example/sample-app";
export const addedRevision = "b7".repeat(20);
export const addedBranch = "release+stable";
export const addedLocalPath = "~/work/private-checkout";

export function projectAddMachine({
  ghTransport,
}: { ghTransport?: FakeGhTransport } = {}) {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-project-add-"));
  const checkout = path.join(machine, "home/work/private-checkout");
  const origin = path.join(machine, "sample-app.git");
  mkdirSync(checkout, { recursive: true });
  execFileSync("git", [
    "init",
    "--quiet",
    "--initial-branch=local-checkout",
    checkout,
  ]);
  execFileSync("git", [
    "-C",
    checkout,
    "remote",
    "add",
    "origin",
    `git@github.com:${addedRepository}.git`,
  ]);
  const servers: DashboardServer[] = [];
  let installed = false;
  const addedTip = () => commitOf(origin, addedBranch) ?? addedRevision;
  // The file a server of that mode keeps its projects in.
  const configurationFile = (mode: DashboardServerMode) =>
    projectConfigurationFile(
      path.join(machine, "home"),
      projectEnvironmentOf(mode),
    );
  return {
    machine,
    checkout,
    configurationFile,
    addedTip,
    async installAddedProject() {
      rmSync(checkout, { recursive: true });
      await initializeStartOrigin(
        origin,
        path.join(machine, "home"),
        checkout,
        addedRepository,
        "claude",
        makeMe.aRepository.please(),
      );
      execFileSync("git", ["-C", origin, "branch", addedBranch, "main"]);
      execFileSync("git", ["-C", checkout, "branch", "-m", "local-checkout"]);
      // Add inspects the resolved origin URL. Use the declared SSH spelling
      // until the dialog accepts it, then switch to the routed fixture URL.
      execFileSync("git", [
        "-C",
        checkout,
        "remote",
        "set-url",
        "origin",
        `git@github.com:${addedRepository}.git`,
      ]);
      installed = true;
    },
    routeAddedCheckout() {
      execFileSync("git", [
        "-C",
        checkout,
        "remote",
        "set-url",
        "origin",
        gitHubRepositoryUrl(addedRepository),
      ]);
    },
    async start(
      mode: DashboardServerMode,
      readTimeoutMs?: number,
      codexProtocol?: FakeCodex,
    ): Promise<DashboardServer> {
      const server = await startDashboardServer({
        mode,
        ghTransport,
        machine,
        configureDevelopmentProjects: false,
        prebuilt: sharedDashboardBuild,
        readTimeoutMs,
        codexProtocol,
      });
      server.github.serve(
        everyRepository,
        publishes({
          revision: addedRevision,
          defaultBranch: addedBranch,
          // The added project records no stories.
          backlog: describedBacklog(makeMe.aRepository.please()),
        }),
      );
      if (installed)
        await publishCommittedOrigin(server.github, {
          repository: addedRepository,
          repoDir: origin,
          branch: addedBranch,
          revision: addedTip(),
          follows: true,
        });
      servers.push(server);
      return server;
    },
    async stop(server: DashboardServer) {
      await server.close();
      servers.splice(servers.indexOf(server), 1);
    },
    async close() {
      await Promise.all(servers.map((server) => server.close()));
      rmSync(machine, { recursive: true, force: true });
    },
  };
}
