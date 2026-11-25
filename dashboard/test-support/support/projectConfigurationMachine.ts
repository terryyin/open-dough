import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { ConfiguredProject } from "../../server/projectConfiguration.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import { publishes } from "./fakeGitHub.ts";
import { expectServedHomesReach } from "./fixtureOriginRoute.ts";
import type { PublishedOriginAnswerer } from "./publishedRepository.ts";
import {
  projectConfigurationFile,
  projectEnvironmentOf,
  seededProjectPublications,
} from "./projectConfiguration.ts";
import { describedBacklog } from "../describedRevisions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

// Real dev and preview servers sharing one machine HOME without the
// development fixture, so each start seeds or reads its own environment's
// saved project list. The saved projects' published backlogs record no stories.
export function projectConfigurationMachine() {
  const machine = mkdtempSync(
    path.join(tmpdir(), "dough-project-configuration-"),
  );
  const servers: DashboardServer[] = [];
  const serveSeeds = seededProjectPublications();
  let publications = new Map<
    string,
    { ref: string; answer: PublishedOriginAnswerer }
  >();
  const configurationFile = (mode: "dev" | "preview"): string =>
    projectConfigurationFile(
      path.join(machine, "home"),
      projectEnvironmentOf(mode),
    );
  // Only the preview's production list is saved before a start.
  function save(text: string): void {
    const file = configurationFile("preview");
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, text);
  }
  return {
    machine,
    configurationFile,
    save(text: string): void {
      save(text);
      publications.clear();
    },
    saveProjects(projects: readonly ConfiguredProject[]): string {
      const backlog = describedBacklog(makeMe.aRepository.please());
      const savedPublications = new Map(
        projects.map(({ repository, ref, backlogPath }) => [
          repository,
          {
            ref,
            answer: publishes({
              defaultBranch: ref,
              files: { [backlogPath]: backlog },
            }),
          },
        ]),
      );
      const text = JSON.stringify(projects);
      save(text);
      publications = savedPublications;
      return text;
    },
    expectPublishedRef(
      { github }: DashboardServer,
      { repository }: ConfiguredProject,
    ): string {
      const publication = publications.get(repository);
      if (publication === undefined)
        throw new Error(`No fixture publication for ${repository}.`);
      const { ref, answer } = publication;
      expectServedHomesReach(github, repository, answer.revision, ref);
      return answer.revision;
    },
    async start(mode: "dev" | "preview"): Promise<DashboardServer> {
      const server = await startDashboardServer({
        mode,
        machine,
        prebuilt: sharedDashboardBuild,
        configureDevelopmentProjects: false,
      });
      servers.push(server);
      serveSeeds(server.github);
      if (mode === "preview") {
        for (const [repository, { ref, answer }] of publications) {
          server.github.serve(repository, answer);
          expectServedHomesReach(
            server.github,
            repository,
            answer.revision,
            ref,
          );
        }
      }
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
