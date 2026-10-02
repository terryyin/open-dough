// The development checkout supplies this owner, but installation, building,
// and preview all run in a separate checkout of the resolved release commit.
// Launch/session records remain at their existing machine-home locations.
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import {
  command,
  ownedProcess,
  stopProcess,
} from "./dashboardReleaseProcess.mjs";
/**
 * @typedef {{origin: string, tag: string, commit: string, version: string}} DashboardRelease
 */

/**
 * @param {string} developmentRoot
 * @param {NodeJS.ProcessEnv} [env]
 * @param {AbortSignal} [signal]
 * @returns {Promise<DashboardRelease>}
 */
export async function resolveDashboardRelease(developmentRoot, env, signal) {
  const options = {
    cwd: developmentRoot,
    ...(env ? { env } : {}),
    ...(signal ? { signal } : {}),
  };
  const origin = await command("git", ["remote", "get-url", "origin"], options);
  const resolved = await command(
    "bash",
    [releaseResolver(developmentRoot), "resolve-url", origin],
    options,
  );
  const [tag, commit, version] = resolved.split("\t");
  if (
    tag === undefined ||
    version === undefined ||
    tag !== `v${version}` ||
    !/^\d+\.\d+\.\d+$/.test(version) ||
    commit === undefined ||
    !/^[0-9a-f]{40}$/.test(commit)
  ) {
    throw new Error(`Malformed resolved dashboard release: ${resolved}`);
  }
  return { origin, tag, commit, version };
}
/** @param {string} developmentRoot */
function releaseResolver(developmentRoot) {
  return path.join(developmentRoot, "src/install/open-dough-release.sh");
}
/** @param {string} developmentRoot @param {string} candidateVersion @param {string} currentVersion @param {AbortSignal} [signal] */
export async function compareDashboardReleases(
  developmentRoot,
  candidateVersion,
  currentVersion,
  signal,
) {
  return command(
    "bash",
    [
      releaseResolver(developmentRoot),
      "compare",
      candidateVersion,
      currentVersion,
    ],
    { cwd: developmentRoot, ...(signal ? { signal } : {}) },
  );
}
/** @param {string} directory @param {DashboardRelease} release @param {NodeJS.ProcessEnv} [env] */
export async function verifyDashboardRelease(directory, release, env) {
  const head = await command("git", ["rev-parse", "HEAD"], {
    cwd: directory,
    ...(env ? { env } : {}),
  });
  if (head !== release.commit) {
    throw new Error(
      `Fetched ${release.tag} commit ${head} did not match resolved ${release.commit}; not falling back to another release or branch.`,
    );
  }
  const version = (
    await readFile(path.join(directory, "VERSION"), "utf8")
  ).trim();
  if (version !== release.version || release.tag !== `v${version}`) {
    throw new Error(
      `Highest release ${release.tag} has VERSION ${version}; not falling back to another release or branch.`,
    );
  }
}
/** @param {{developmentRoot: string, release: DashboardRelease, releasesRoot?: string, env?: NodeJS.ProcessEnv, signal?: AbortSignal}} options */
export async function stageDashboardRelease(options) {
  const { release, env } = options;
  const releasesRoot = path.resolve(
    options.releasesRoot ??
      path.join(homedir(), ".open-dough/dashboard/releases"),
  );
  const relative = path.relative(
    path.resolve(options.developmentRoot),
    releasesRoot,
  );
  if (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  ) {
    throw new Error(
      "Dashboard releases must be staged outside the development checkout.",
    );
  }
  await mkdir(releasesRoot, { recursive: true });
  const directory = await mkdtemp(
    path.join(releasesRoot, `${release.tag}-${release.commit.slice(0, 12)}-`),
  );
  const commandOptions = {
    cwd: directory,
    ...(env ? { env } : {}),
    ...(options.signal ? { signal: options.signal } : {}),
  };
  const remove = () => rm(directory, { recursive: true, force: true });
  try {
    await command("git", ["init", "--quiet"], commandOptions);
    // Fetch the inspected commit, never whatever the branch/tag names later.
    await command(
      "git",
      [
        "fetch",
        "--quiet",
        "--depth",
        "1",
        "--",
        release.origin,
        release.commit,
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
    await verifyDashboardRelease(directory, release, env);
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
    await command("npm", ["run", "build:dashboard"], commandOptions, 120_000);
    return { directory, remove };
  } catch (error) {
    await remove();
    throw error;
  }
}
/** @param {{directory: string, port?: number, env?: NodeJS.ProcessEnv, signal?: AbortSignal}} options */
export async function startReleasePreview(options) {
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
      `Tagged dashboard preview did not start:\n${process.output()}`,
    );
  } catch (error) {
    await stopProcess(process);
    throw error;
  }
}
