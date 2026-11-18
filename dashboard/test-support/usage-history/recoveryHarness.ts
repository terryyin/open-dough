// Git and machine-file lifecycle stay at the harness; domain state uses MakeMe.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";

export async function configuredRepository<Name extends string>(
  home: string,
  description: import("../../../Distribution/tests/support/repositoryTestData.mjs").RepositoryDescription<Name>,
) {
  const repository = await materializeLocalCheckout(undefined, description, {
    parent: home,
  });
  const configuration = path.join(
    home,
    ".open-dough/dashboard/projects-production.json",
  );
  mkdirSync(path.dirname(configuration), { recursive: true });
  writeFileSync(
    configuration,
    JSON.stringify([
      makeMe.aConfiguredProject
        .with({
          id: "historic",
          label: "Hidden project",
          repository: "example/historic",
          localPath: repository.integration,
          hidden: true,
        })
        .please(),
    ]),
  );
  return repository;
}
