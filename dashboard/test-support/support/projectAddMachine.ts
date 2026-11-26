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
import { publishes } from "./fakeGitHub.ts";
import { expectServedHomesReach } from "./fixtureOriginRoute.ts";
import { git } from "./launchLanding.ts";
import { commitPublishedOrigin } from "./publishedOrigin.ts";
import { describedBacklog } from "../describedRevisions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  projectConfigurationFile,
  projectEnvironmentOf,
  seededProjectPublications,
} from "./projectConfiguration.ts";

export const addedRepository = "example/sample-app";
export const addedBranch = "release+stable";
export const addedLocalPath = "~/work/private-checkout";

export function projectAddMachine() {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-project-add-"));
  const checkout = path.join(machine, "home/work/private-checkout");
  const facts = {
    defaultBranch: addedBranch,
    backlog: describedBacklog(makeMe.aRepository.please()),
  };
  const published = publishes(facts);
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
  const serveSeeds = seededProjectPublications();
  const expectAddedRef = ({ github }: DashboardServer) => {
    expectServedHomesReach(
      github,
      addedRepository,
      published.revision,
      addedBranch,
    );
  };
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
    expectAddedRef,
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
      servers.push(server);
      serveSeeds(server.github);
      server.github.serve(addedRepository, published);
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
