// The development checkout supplies this owner, but installation, building,
// and preview all run in a separate checkout of the selected origin/main commit.
// Launch/session records remain at their existing machine-home locations.
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { command } from "./productionProcess.mjs";
export { startDeploymentPreview } from "./productionPreview.mjs";
/**
 * @typedef {{origin: string, commit: string}} PublishedCommit
 */

/**
 * Reads the commit origin's main names now; local refs and edits are not inputs.
 * @param {string} developmentRoot
 * @param {NodeJS.ProcessEnv} [env]
 * @param {AbortSignal} [signal]
 * @returns {Promise<PublishedCommit>}
 */
export async function resolvePublishedMain(developmentRoot, env, signal) {
  const options = {
    cwd: developmentRoot,
    ...(env ? { env } : {}),
    ...(signal ? { signal } : {}),
  };
  const origin = await command("git", ["remote", "get-url", "origin"], options);
  const listed = await command(
    "git",
    ["ls-remote", "--", origin, "refs/heads/main"],
    options,
  );
  return publishedMainFrom(origin, listed);
}
/**
 * The commit origin's main names, from origin's ls-remote listing of
 * refs/heads/main. Local refs and edits are not inputs.
 * @param {string} origin @param {string} listed
 * @returns {PublishedCommit}
 */
export function publishedMainFrom(origin, listed) {
  if (listed === "") {
    throw new Error(`Origin ${origin} has no published main branch.`);
  }
  const [commit, ref] = listed.split("\t");
  if (
    commit === undefined ||
    !/^[0-9a-f]{40}$/.test(commit) ||
    ref !== "refs/heads/main"
  ) {
    throw new Error(`Malformed published main reference: ${listed}`);
  }
  return { origin, commit };
}
/** @param {string} directory @param {PublishedCommit} published @param {NodeJS.ProcessEnv} [env] */
export async function verifyPublishedCommit(directory, published, env) {
  const head = await command("git", ["rev-parse", "HEAD"], {
    cwd: directory,
    ...(env ? { env } : {}),
  });
  expectSelectedCommit(head, published);
}
/**
 * Refuses a checkout whose HEAD is not the selected commit, before its code runs.
 * @param {string} head @param {PublishedCommit} published
 */
export function expectSelectedCommit(head, published) {
  if (head !== published.commit) {
    throw new Error(
      `Fetched commit ${head} did not match selected main commit ${published.commit}.`,
    );
  }
}
/**
 * Creates an owned directory named for a commit under a machine-home root that
 * lies outside the development checkout.
 * @param {string} developmentRoot @param {string} root @param {string} commit
 */
export async function ownedCommitDirectory(developmentRoot, root, commit) {
  const resolved = path.resolve(root);
  const relative = path.relative(path.resolve(developmentRoot), resolved);
  if (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  ) {
    throw new Error(
      "Production dashboard checkouts must be outside the development checkout.",
    );
  }
  await mkdir(resolved, { recursive: true });
  return mkdtemp(path.join(resolved, `${commit.slice(0, 12)}-`));
}
/**
 * Fetches only the named commits, without history, into an owned directory's
 * repository. No automatic maintenance: it would detach and keep writing into
 * the directory while its owner removes it.
 * @param {string} origin @param {string[]} commits
 * @param {import("./productionProcess.mjs").CommandOptions} options
 */
export async function fetchIntoOwnedDirectory(origin, commits, options) {
  await command(
    "git",
    [
      "-c",
      "maintenance.auto=false",
      "fetch",
      "--quiet",
      "--depth",
      "1",
      "--",
      origin,
      ...commits,
    ],
    options,
  );
}
/** @param {{developmentRoot: string, published: PublishedCommit, deploymentsRoot?: string, env?: NodeJS.ProcessEnv, signal?: AbortSignal}} options */
export async function stageDeployment(options) {
  const { published, env } = options;
  const directory = await ownedCommitDirectory(
    options.developmentRoot,
    options.deploymentsRoot ??
      path.join(homedir(), ".open-dough/dashboard/deployments"),
    published.commit,
  );
  const commandOptions = {
    cwd: directory,
    ...(env ? { env } : {}),
    ...(options.signal ? { signal: options.signal } : {}),
  };
  const remove = () => rm(directory, { recursive: true, force: true });
  try {
    await command("git", ["init", "--quiet"], commandOptions);
    // Fetch the selected commit, never whatever main names later.
    await fetchIntoOwnedDirectory(
      published.origin,
      [published.commit],
      commandOptions,
    );
    await command(
      "git",
      [
        "-c",
        "advice.detachedHead=false",
        "checkout",
        "--quiet",
        "--detach",
        "FETCH_HEAD",
      ],
      commandOptions,
    );
    await verifyPublishedCommit(directory, published, env);
    // The build needs dev dependencies whatever NODE_ENV the shell inherited:
    // npm otherwise omits them under an inherited `production`.
    await command(
      "npm",
      [
        "ci",
        "--include=dev",
        "--no-audit",
        "--no-fund",
        "--fetch-retries=0",
        "--fetch-timeout=20000",
      ],
      commandOptions,
      180_000,
    );
    await command("npm", ["run", "build:dashboard"], commandOptions, 120_000);
    return { directory, remove };
  } catch (error) {
    await remove();
    throw error;
  }
}
