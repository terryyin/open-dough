// A backend case's configured project over a materialized history, under a
// fixture HOME that routes the project's repository to the case's origin.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { onTestFinished, vi } from "vitest";
import { fixtureRepository, stubFixtureHome } from "./fixtureHome.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { RepositoryDescription } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";

type Materialized<Name extends string> = Awaited<
  ReturnType<typeof materializeRepository<Name>>
>;

// The project's execution checkout is the history's integration checkout
// unless `checkout` names another path under the materialized fixture.
export async function configuredFixtureProject<Name extends string>(
  history: RepositoryDescription<Name>,
  checkout: (repository: Materialized<Name>) => string = (repository) =>
    repository.integration,
) {
  const repository = await materializeRepository(history);
  const home = path.join(repository.fixture, "home");
  mkdirSync(home, { recursive: true });
  stubFixtureHome(home, repository.origin);
  const unmount = mountProjectConfiguration("development");
  onTestFinished(async () => {
    unmount();
    vi.unstubAllEnvs();
    await repository.cleanup();
  });
  const project = makeMe.aConfiguredProject
    .with({
      id: "open-dough",
      label: "Open Dough",
      repository: fixtureRepository,
      localPath: checkout(repository),
    })
    .please();
  appendConfiguredProject(project);
  return { repository, home, project };
}
