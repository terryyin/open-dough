import path from "node:path";
import { productionSeedProjects } from "../server/projectConfigurationSeed.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expectServedHomesReach } from "./support/fixtureOriginRoute.ts";
import { git } from "./support/startOriginObservation.ts";

// Use the installed checkout's origin for browser reads on this server,
// without changing the checkout or the origin that native Git uses.
export async function serveInstalledOpenDough({
  github,
  home,
}: DashboardServer) {
  const project = productionSeedProjects.find(({ id }) => id === "open-dough");
  if (project === undefined)
    throw new Error("Open Dough is missing from the catalog.");
  const repoDir = await git(
    path.join(home, "git", project.id),
    "remote",
    "get-url",
    "origin",
  );
  const revision = await git(repoDir, "rev-parse", `refs/heads/${project.ref}`);
  await publishCommittedOrigin(github, {
    repoDir,
    repository: project.repository,
    revision,
    follows: true,
  });
  expectServedHomesReach(github, project.repository, revision, project.ref);
}
