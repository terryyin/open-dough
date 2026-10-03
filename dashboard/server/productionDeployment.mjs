// The development checkout supplies this owner, but installation, building,
// and preview all run in a separate checkout of the selected origin/main commit.
// Launch/session records remain at their existing machine-home locations.
import { copyFile, mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { command, ownedProcess, stopProcess } from "./productionProcess.mjs";
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
    await command(
      "git",
      [
        "fetch",
        "--quiet",
        "--depth",
        "1",
        "--",
        published.origin,
        published.commit,
      ],
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
    await command(
      "npm",
      [
        "ci",
        "--no-audit",
        "--no-fund",
        "--fetch-retries=0",
        "--fetch-timeout=20000",
      ],
      commandOptions,
      180_000,
    );
    // These machine-local cartoons remain ignored by Git. Raw source photos
    // and other local files never enter the production checkout or build.
    const cartoonPath = "dashboard/public/agent-avatars/odd-e-nerds/cartoon";
    const source = path.join(options.developmentRoot, cartoonPath);
    const cartoons = await readdir(source, { withFileTypes: true }).catch(
      (error) => {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ENOENT"
        ) {
          return [];
        }
        throw error;
      },
    );
    for (const cartoon of cartoons) {
      if (!cartoon.isFile() || !cartoon.name.endsWith(".webp")) continue;
      const destination = path.join(directory, cartoonPath);
      await mkdir(destination, { recursive: true });
      await copyFile(
        path.join(source, cartoon.name),
        path.join(destination, cartoon.name),
      );
    }
    await command("npm", ["run", "build:dashboard"], commandOptions, 120_000);
    return { directory, remove };
  } catch (error) {
    await remove();
    throw error;
  }
}
/** @param {{directory: string, port?: number, env?: NodeJS.ProcessEnv, signal?: AbortSignal}} options */
export async function startDeploymentPreview(options) {
  const port = options.port ?? 4173;
  const process = ownedProcess(
    "npm",
    [
      "run",
      "preview:dashboard",
      "--",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    {
      cwd: options.directory,
      ...(options.env ? { env: options.env } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
    },
  );
  let ended = false;
  void process.exited.then(
    () => {
      ended = true;
    },
    () => {
      ended = true;
    },
  );
  const deadline = Date.now() + 20_000;
  try {
    while (Date.now() < deadline && !ended) {
      const address = /Local:\s+(http:\/\/127\.0\.0\.1:\d+\/)/.exec(
        stripVTControlCharacters(process.output()),
      )?.[1];
      if (address !== undefined) {
        const url = new URL(address).origin;
        if (port !== 0 && new URL(url).port !== String(port)) {
          throw new Error(`Preview reported an unexpected address ${url}`);
        }
        const response = await fetch(url, {
          signal: AbortSignal.timeout(2_000),
        });
        if (response.ok && !ended) {
          return {
            url,
            pid: process.child.pid,
            exited: process.exited,
            stop: () => stopProcess(process),
          };
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(
      `Production dashboard preview did not start:\n${process.output()}`,
    );
  } catch (error) {
    await stopProcess(process);
    throw error;
  }
}
