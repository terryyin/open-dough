import { cpSync, mkdirSync, mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import { fixtureTeardown } from "./fixture-teardown-test-fixtures.mjs";
import { requestOwnerEnvironment } from "./github-request-owner-test-fixtures.mjs";
import { blockingGithubCommandDirectory } from "./watch-ci-test-fixtures.mjs";

const source = fileURLToPath(new URL("../", import.meta.url));

// Installs this skill's runtime, without its tests and fixtures, under
// `platform` in the checkout at `root` and returns the installed skill.
export function deployRuntime(root, platform = ".agents") {
  const skill = join(root, platform, "skills", "dough-execute-plan");
  mkdirSync(skill, { recursive: true });
  cpSync(join(source, "scripts"), join(skill, "scripts"), {
    recursive: true,
    filter: (path) => !/test|fixture/.test(path.slice(source.length)),
  });
  return skill;
}

// A repository with one commit, which is no Open Dough backlog project.
const oneCommit = makeMe.aRepository.withRevision("init", {
  backlog: undefined,
  files: { README: "checkout\n" },
});

// One repository's default `checkout` and linked `worktree`, and an
// `unrelated` repository, each with the runtime installed and its mailbox
// launcher under the same name in `launchers`. `env` gives them one mailbox
// storage and a `gh` that blocks every request, announcing the first in
// `github-request-started` under `fixture`. Callers defer stopping what they
// start through `teardown`, which `t.after` runs before `fixture` is removed.
export async function installedCheckouts(t, prefix) {
  const fixture = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  const teardown = fixtureTeardown(fixture);
  t.after(teardown.cleanup);
  const parent = { parent: fixture };
  const repository = await materializeRepository(
    oneCommit.withWorkspace("exec/story", { from: "init" }).please(),
    parent,
  );
  const roots = {
    checkout: repository.integration,
    worktree: repository.execution,
    unrelated: (await materializeRepository(oneCommit.please(), parent))
      .integration,
  };
  const launchers = Object.fromEntries(
    Object.entries(roots).map(([name, root]) => [
      name,
      join(deployRuntime(root), "scripts/ci-mailbox.mjs"),
    ]),
  );
  const env = {
    ...process.env,
    ...requestOwnerEnvironment(teardown),
    DOUGH_CI_MAILBOX_ROOT: join(fixture, "mailboxes"),
    CI_TEST_ROOT: fixture,
    PATH: `${blockingGithubCommandDirectory()}:${process.env.PATH}`,
  };
  return { fixture, teardown, ...roots, launchers, env };
}
