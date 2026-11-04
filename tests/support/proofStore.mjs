// Shared Intent proof snapshot store for every runner whose recorder writes
// the Vitest-shaped format (Playwright, node:test, …). One latest.json per
// proof directory, serialized against concurrent writers, with covered
// locations and Git commit / file blob helpers. Outside a Git checkout every
// operation is a no-op.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { refreshProof } from "./proofDirectoryRefresh.mjs";

export {
  compareObservations,
  compareTestNames,
  identityOf,
  textOrder,
} from "./proofObservationOrder.mjs";
export { refreshProof } from "./proofDirectoryRefresh.mjs";

/** Resolve existing ancestors through symlinks; keep missing path segments. */
export function canonicalPath(file) {
  const missing = [];
  let ancestor = path.resolve(file);
  for (;;) {
    try {
      return path.join(realpathSync(ancestor), ...missing);
    } catch {
      missing.unshift(path.basename(ancestor));
      const parent = path.dirname(ancestor);
      if (parent === ancestor) return path.resolve(file);
      ancestor = parent;
    }
  }
}

function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

/** Repository root from `cwd`, or `undefined` outside Git. */
export function repositoryRoot(
  // eslint-disable-next-line no-restricted-syntax -- recording resolves the active checkout from the reporter process cwd (fixture checkouts and nested runs)
  cwd = process.cwd(),
) {
  try {
    return canonicalPath(git(["rev-parse", "--show-toplevel"], cwd));
  } catch {
    return undefined;
  }
}

/**
 * Locations in `.planning/open-dough.json` that declare this `runner` and a
 * nonempty `proof` directory, resolved against the repository root.
 */
export function coveredLocations(repoRoot, runner) {
  const configPath = path.join(repoRoot, ".planning", "open-dough.json");
  if (!existsSync(configPath)) return [];
  let configuration;
  try {
    configuration = JSON.parse(readFileSync(configPath, "utf8"));
  } catch {
    return [];
  }
  const locations = configuration?.intent?.locations;
  if (!Array.isArray(locations)) return [];
  return locations.flatMap((location) => {
    if (
      !location ||
      location.runner !== runner ||
      typeof location.proof !== "string" ||
      location.proof.length === 0 ||
      typeof location.path !== "string" ||
      location.path.length === 0
    ) {
      return [];
    }
    const relativePath = location.path.replaceAll("\\", "/").replace(/\/$/, "");
    return [
      {
        path: relativePath,
        proof: path.join(repoRoot, location.proof),
      },
    ];
  });
}

/** Proof directory for a repository-relative file, or `undefined` when uncovered. */
export function proofDirectoryFor(locations, relativeFile) {
  const normalized = relativeFile.replaceAll("\\", "/");
  for (const location of locations) {
    if (
      normalized === location.path ||
      normalized.startsWith(`${location.path}/`)
    ) {
      return location.proof;
    }
  }
  return undefined;
}

/**
 * Open a recording session for `runner` from `cwd`. Outside Git, or when the
 * checkout has no covered location for that runner, `active` is false and
 * every method is a no-op.
 */
export function openProofStore({
  // eslint-disable-next-line no-restricted-syntax -- recording resolves the active checkout from the reporter process cwd (fixture checkouts and nested runs)
  cwd = process.cwd(),
  runner,
}) {
  const root = repositoryRoot(cwd);
  if (root === undefined) {
    return inactiveStore();
  }
  let commit;
  try {
    commit = git(["rev-parse", "HEAD"], root);
  } catch {
    return inactiveStore();
  }
  const locations = coveredLocations(root, runner);
  if (locations.length === 0) {
    return inactiveStore();
  }
  const blobs = new Map();
  return {
    active: true,
    commit,
    root,
    locations,
    fileBlob(relativeFile) {
      const normalized = relativeFile.replaceAll("\\", "/");
      const cached = blobs.get(normalized);
      if (cached !== undefined) return cached;
      const hash = git(["hash-object", normalized], root);
      blobs.set(normalized, hash);
      return hash;
    },
    record(observation) {
      const directory = proofDirectoryFor(locations, observation.file);
      if (directory === undefined) return;
      refreshProof(directory, observation);
    },
    clear(identity) {
      const directory = proofDirectoryFor(locations, identity.file);
      if (directory === undefined) return;
      refreshProof(directory, {
        ...identity,
        outcome: "failed",
        attempts: 1,
        durationMs: 0,
        finishedAt: new Date().toISOString(),
        commit,
      });
    },
  };
}

function inactiveStore() {
  return {
    active: false,
    commit: undefined,
    root: undefined,
    locations: [],
    fileBlob() {
      return undefined;
    },
    record() {},
    clear() {},
  };
}
