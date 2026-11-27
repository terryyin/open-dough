// The project environment a test's server keeps its project list in
// (../../server/projectConfiguration.ts), and the file it keeps it in under
// that server's HOME. Existing journeys need their known projects even though
// development starts empty; `configureDevelopmentProjects` writes only a
// missing fixture file, so restarts keep each test's saved configuration.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { servingModeEnvironment } from "../../server/localBoundaryPlugin.ts";
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";
import { productionSeedProjects } from "../../server/projectConfigurationSeed.ts";
import { describedBacklog } from "../describedRevisions.ts";
import { everyRepository, publishes, type FakeGitHub } from "./fakeGitHub.ts";
import { expectServedHomesReach } from "./fixtureOriginRoute.ts";
import type { DashboardServerMode } from "./serverAddress.ts";

// Vite's dev and preview servers open their serving mode's environment; the
// boundary server takes the one asked for, production when none is.
export function projectEnvironmentOf(
  mode: DashboardServerMode,
  asked?: ProjectEnvironment,
): ProjectEnvironment {
  if (mode === "dev" || mode === "preview") return servingModeEnvironment[mode];
  return asked ?? "production";
}

// Where a server in `environment` keeps its project list under `home`.
export function projectConfigurationFile(
  home: string,
  environment: ProjectEnvironment,
): string {
  return path.join(
    home,
    ".open-dough/dashboard",
    `projects-${environment}.json`,
  );
}

export function configureDevelopmentProjects(home: string): void {
  const file = projectConfigurationFile(home, "development");
  mkdirSync(path.dirname(file), { recursive: true });
  try {
    writeFileSync(file, JSON.stringify(productionSeedProjects), { flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
}

// Keep the same empty catalog publications across this machine's starts.
// The seeded fallback covers main, and a seed on another ref has its own
// publication so that ref can be resolved from the configured URL.
export function seededProjectPublications() {
  const backlog = describedBacklog(makeMe.aRepository.please());
  const fallback = publishes({ backlog });
  const seeds = productionSeedProjects.map(({ repository, ref }) => ({
    repository,
    ref,
    answer:
      ref === "main" ? fallback : publishes({ backlog, defaultBranch: ref }),
  }));
  return (github: FakeGitHub) => {
    github.serve(everyRepository, fallback);
    for (const { repository, ref, answer } of seeds) {
      if (answer !== fallback) github.serve(repository, answer);
      expectServedHomesReach(github, repository, answer.revision, ref);
    }
  };
}
