// Default fake-GitHub answers for base-CI judgment on a start-origin
// journey that has not yet published a committed origin: the current main
// head with a passing Actions run, so execution starts are not asked.

import type { FakeGitHub } from "./fakeGitHub.ts";
import { publishes } from "./publishedRepository.ts";
import type { StartOrigin } from "./startOrigin.ts";

export function serveOriginBaseCi(
  github: FakeGitHub,
  origin: StartOrigin,
  repository = "terryyin/open-dough",
): void {
  github.serve(repository, async (call) => {
    const revision = (await origin.originGit("rev-parse", "main")).trim();
    return publishes({ revision })(call);
  });
}
