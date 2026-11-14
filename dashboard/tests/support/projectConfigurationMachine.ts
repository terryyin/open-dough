import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import { everyRepository, publishes } from "./fakeGitHub.ts";
import {
  projectConfigurationFile,
  projectEnvironmentOf,
} from "./projectConfiguration.ts";
import { describedBacklog } from "../describedRevisions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const published = publishes({
  revision: "ab".repeat(20),
  backlog: describedBacklog(makeMe.aRepository.please()),
});

// Real dev and preview servers sharing one machine HOME without the
// development fixture, so each start seeds or reads its own environment's
// saved project list. Fake GitHub publishes one revision, whose backlog
// records no stories, for every repository.
export function projectConfigurationMachine() {
  const machine = mkdtempSync(
    path.join(tmpdir(), "dough-project-configuration-"),
  );
  const servers: DashboardServer[] = [];
  const configurationFile = (mode: "dev" | "preview"): string =>
    projectConfigurationFile(
      path.join(machine, "home"),
      projectEnvironmentOf(mode),
    );
  return {
    machine,
    configurationFile,
    // Only the preview's production list is saved before a start.
    save(text: string): void {
      const file = configurationFile("preview");
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, text);
    },
    async start(mode: "dev" | "preview"): Promise<DashboardServer> {
      const server = await startDashboardServer({
        mode,
        machine,
        prebuilt: sharedDashboardBuild,
        configureDevelopmentProjects: false,
      });
      server.github.serve(everyRepository, published);
      servers.push(server);
      return server;
    },
    async stop(server: DashboardServer): Promise<void> {
      await server.close();
      servers.splice(servers.indexOf(server), 1);
    },
    async close(): Promise<void> {
      await Promise.all(servers.splice(0).map((server) => server.close()));
      rmSync(machine, { recursive: true, force: true });
    },
  };
}
