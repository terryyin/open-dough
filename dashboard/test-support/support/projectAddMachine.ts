import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
  type DashboardServerMode,
} from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { everyRepository, publishes } from "./fakeGitHub.ts";
import { git } from "./launchLanding.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { initializeStartOrigin } from "./startOriginInitialization.ts";
import { gitHubRepositoryUrl } from "./fixtureOriginRoute.ts";
import { commitPublishedOrigin } from "./publishedOrigin.ts";
import { describedBacklog } from "../describedRevisions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  projectConfigurationFile,
  projectEnvironmentOf,
} from "./projectConfiguration.ts";

export const addedRepository = "example/sample-app";
export const addedBranch = "release+stable";
export const addedLocalPath = "~/work/private-checkout";

export function projectAddMachine() {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-project-add-"));
  const checkout = path.join(machine, "home/work/private-checkout");
  const installedOrigin = path.join(machine, "sample-app.git");
  const facts = {
    defaultBranch: addedBranch,
    backlog: describedBacklog(makeMe.aRepository.please()),
  };
  const published = publishes(facts);
  const otherProjects = publishes({ ...facts, revision: published.revision });
  const localBranch = commitPublishedOrigin({
    branch: "local-checkout",
    backlog: null,
  });
  git(
    published.origin,
    "fetch",
    "--quiet",
    localBranch.origin,
    "local-checkout:local-checkout",
  );
  mkdirSync(path.dirname(checkout), { recursive: true });
  git(
    machine,
    "clone",
    "--quiet",
    "--branch",
    "local-checkout",
    published.origin,
    checkout,
  );
  git(
    checkout,
    "remote",
    "set-url",
    "origin",
    `git@github.com:${addedRepository}.git`,
  );
  const servers: DashboardServer[] = [];
  let installed = false;
  const addedTip = () =>
    git(
      installed ? installedOrigin : published.origin,
      "rev-parse",
      addedBranch,
    );
  // The file a server of that mode keeps its projects in.
  const configurationFile = (mode: DashboardServerMode) =>
    projectConfigurationFile(
      path.join(machine, "home"),
      projectEnvironmentOf(mode),
    );
  return {
    machine,
    checkout,
    revision: published.revision,
    configurationFile,
    addedTip,
    async installAddedProject() {
      rmSync(checkout, { recursive: true });
      await initializeStartOrigin(
        installedOrigin,
        path.join(machine, "home"),
        checkout,
        addedRepository,
        "claude",
        makeMe.aRepository.please(),
      );
      git(installedOrigin, "branch", addedBranch, "main");
      git(installedOrigin, "symbolic-ref", "HEAD", `refs/heads/${addedBranch}`);
      git(checkout, "branch", "-m", "local-checkout");
      git(
        checkout,
        "commit",
        "--allow-empty",
        "-m",
        "Keep local checkout at its own revision",
      );
      git(
        installedOrigin,
        "fetch",
        "--quiet",
        checkout,
        "local-checkout:local-checkout",
      );
      const localHead = git(checkout, "rev-parse", "HEAD");
      git(
        checkout,
        "update-ref",
        "refs/remotes/origin/local-checkout",
        localHead,
      );
      git(checkout, "branch", "--set-upstream-to=origin/local-checkout");
      git(
        checkout,
        "remote",
        "set-url",
        "origin",
        `git@github.com:${addedRepository}.git`,
      );
      installed = true;
    },
    routeAddedCheckout() {
      git(
        checkout,
        "remote",
        "set-url",
        "origin",
        gitHubRepositoryUrl(addedRepository),
      );
    },
    async start(
      mode: DashboardServerMode,
      readTimeoutMs?: number,
      codexProtocol?: FakeCodex,
    ): Promise<DashboardServer> {
      const server = await startDashboardServer({
        mode,
        machine,
        configureDevelopmentProjects: false,
        prebuilt: sharedDashboardBuild,
        readTimeoutMs,
        codexProtocol,
      });
      server.github.serve(everyRepository, otherProjects);
      if (installed)
        await publishCommittedOrigin(server.github, {
          repository: addedRepository,
          repoDir: installedOrigin,
          branch: addedBranch,
          revision: addedTip(),
          follows: true,
        });
      else server.github.serve(addedRepository, published);
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
