// Bare remotes shared by publication fixtures, safe for local clones and copies.
import { exec, git } from "./publication-git.mjs";

export async function createBareFixtureRemote(url, branch = "main") {
  await exec("git", ["init", "--bare", "-b", branch, url]);
  // Local pushes drop the runner's GIT_CONFIG_COUNT settings. Disable detached
  // maintenance in the remote itself before it can change objects during a copy.
  await git(url, "config", "maintenance.auto", "false");
}
