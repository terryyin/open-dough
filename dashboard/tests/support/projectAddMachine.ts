import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import { everyRepository, publishes } from "./fakeGitHub.ts";

export const addedRepository = "example/sample-app";
export const addedRevision = "b7".repeat(20);
export const addedBranch = "release+stable";
export const addedLocalPath = "~/work/private-checkout";
export const addedBacklog =
  "# Product backlog\n\n## Taken\n\n## Backlog list\n";

export function projectAddMachine() {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-project-add-"));
  const checkout = path.join(machine, "home/work/private-checkout");
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
  const configurationFile = (mode: "dev" | "preview") =>
    path.join(
      machine,
      "home/.open-dough/dashboard",
      `projects-${mode === "dev" ? "development" : "production"}.json`,
    );
  return {
    machine,
    checkout,
    configurationFile,
    async start(
      mode: "dev" | "preview",
      readTimeoutMs?: number,
    ): Promise<DashboardServer> {
      const server = await startDashboardServer({
        mode,
        machine,
        configureDevelopmentProjects: false,
        prebuilt: builtDashboardDir,
        readTimeoutMs,
      });
      server.github.serve(
        everyRepository,
        publishes({
          revision: addedRevision,
          defaultBranch: addedBranch,
          backlog: addedBacklog,
        }),
      );
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
