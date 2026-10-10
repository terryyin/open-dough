import { execFile } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { fixtureTeardown } from "./fixture-teardown-test-fixtures.mjs";
import { blockingGithubCommandDirectory } from "./watch-ci-test-fixtures.mjs";

const exec = promisify(execFile);
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

// A Git checkout at `root` with one commit.
async function initCheckout(root) {
  mkdirSync(root, { recursive: true });
  const git = (...args) => exec("git", args, { cwd: root });
  await git("init", "-b", "main");
  await git("config", "user.name", "Installed Checkouts");
  await git("config", "user.email", "installed-checkouts@example.test");
  writeFileSync(join(root, "README"), "checkout\n");
  await git("add", "README");
  await git("commit", "-m", "init");
}

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
  const roots = {
    checkout: join(fixture, "default"),
    worktree: join(fixture, "worktree"),
    unrelated: join(fixture, "unrelated"),
  };
  await initCheckout(roots.checkout);
  await exec("git", ["worktree", "add", roots.worktree, "-b", "exec/story"], {
    cwd: roots.checkout,
  });
  await initCheckout(roots.unrelated);
  const launchers = Object.fromEntries(
    Object.entries(roots).map(([name, root]) => [
      name,
      join(deployRuntime(root), "scripts/ci-mailbox.mjs"),
    ]),
  );
  const env = {
    ...process.env,
    DOUGH_CI_MAILBOX_ROOT: join(fixture, "mailboxes"),
    CI_TEST_ROOT: fixture,
    PATH: `${blockingGithubCommandDirectory()}:${process.env.PATH}`,
  };
  return { fixture, teardown, ...roots, launchers, env };
}
