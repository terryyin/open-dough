// Development is a fixture precondition. Reuse this checkout's locked,
// immutable packages while each fixture owns its writable Vite/cache paths.
// Production deployments still perform their own real npm ci from Git.
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, symlink } from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "./repositoryRoot.ts";

type PackageFacts = {
  version?: string;
  integrity?: string;
  optional?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
type Lock = { packages?: Record<string, PackageFacts> };

async function json<T>(file: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      (error as NodeJS.ErrnoException).code === "ENOENT"
    )
      return undefined;
    throw error;
  }
}

function dependencies(facts: PackageFacts) {
  return [
    facts.dependencies,
    facts.devDependencies,
    facts.optionalDependencies,
    facts.peerDependencies,
  ].map((entries) => Object.entries(entries ?? {}).sort());
}

export async function reusePublishedDevelopmentRuntime(development: string) {
  const modules = path.join(development, "node_modules");
  if (existsSync(modules)) return false;
  const sourceLockPath = path.join(repoRoot, "package-lock.json");
  const fixtureLockPath = path.join(development, "package-lock.json");
  let sourceLock: string;
  let fixtureLock: string;
  try {
    [sourceLock, fixtureLock] = await Promise.all([
      readFile(sourceLockPath, "utf8"),
      readFile(fixtureLockPath, "utf8"),
    ]);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
  if (sourceLock !== fixtureLock) return false;
  const locked = await json<Lock>(sourceLockPath);
  const installed = await json<Lock>(
    path.join(repoRoot, "node_modules/.package-lock.json"),
  );
  const fixture = await json<PackageFacts>(
    path.join(development, "package.json"),
  );
  if (!locked?.packages?.[""] || !installed?.packages || !fixture) return false;
  if (
    JSON.stringify(dependencies(fixture)) !==
    JSON.stringify(dependencies(locked.packages[""]))
  )
    return false;
  for (const [location, facts] of Object.entries(locked.packages)) {
    if (location === "") continue;
    const actual = installed.packages[location];
    if (actual === undefined) {
      if (facts.optional) continue;
      return false;
    }
    if (
      actual.version !== facts.version ||
      actual.integrity !== facts.integrity
    )
      return false;
    const manifest = await json<PackageFacts>(
      path.join(repoRoot, location, "package.json"),
    );
    if (!manifest || manifest.version !== facts.version) return false;
  }
  if (
    Object.keys(installed.packages).some(
      (location) => locked.packages?.[location] === undefined,
    )
  )
    return false;

  await linkInstalledDevelopmentRuntime(development);
  return true;
}

// Callers with an explicit installed-runtime contract use the same private
// package layout as eligible application fixtures, without sharing caches.
export async function linkInstalledDevelopmentRuntime(development: string) {
  const modules = path.join(development, "node_modules");
  // A real directory keeps .vite, .vite-temp and any other dot caches private.
  await mkdir(modules);
  try {
    for (const entry of await readdir(path.join(repoRoot, "node_modules"))) {
      if (entry.startsWith(".") && entry !== ".bin") continue;
      await symlink(
        path.join(repoRoot, "node_modules", entry),
        path.join(modules, entry),
      );
    }
  } catch (error) {
    await rm(modules, { recursive: true, force: true });
    throw error;
  }
}
