// Development is a fixture precondition. Reuse this checkout's locked,
// immutable packages while each fixture owns its writable Vite/cache paths.
// Production deployments still perform their own real npm ci from Git.
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, readdir, rm, symlink } from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "./repositoryRoot.ts";

export type PackageFacts = {
  version?: string;
  integrity?: string;
  optional?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
export type Lock = { packages?: Record<string, PackageFacts> };

// A lock or package manifest; malformed JSON reads as missing.
type Json = Lock & PackageFacts;
function parsed(text: string): Json | undefined {
  try {
    return JSON.parse(text) as Json;
  } catch (error) {
    if (error instanceof SyntaxError) return undefined;
    throw error;
  }
}

function jsonAt(file: string): Json | undefined {
  try {
    return parsed(readFileSync(file, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
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

// What deciding reuse reads: both locks' bytes, this checkout's installed
// lock and each installed package's manifest version, and the fixture's
// manifest.
export type DevelopmentInputs = {
  sourceLock: string;
  fixtureLock: string;
  installed: Lock | undefined;
  fixture: PackageFacts | undefined;
  installedVersion: (location: string) => string | undefined;
};

// Locked development inputs reuse this checkout's packages: the fixture's
// lock and dependencies match the source lock, which the installed packages
// match exactly.
export function developmentInputsLocked({
  sourceLock,
  fixtureLock,
  installed,
  fixture,
  installedVersion,
}: DevelopmentInputs): boolean {
  if (sourceLock !== fixtureLock) return false;
  const locked = parsed(sourceLock);
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
      actual.integrity !== facts.integrity ||
      installedVersion(location) !== facts.version
    )
      return false;
  }
  return !Object.keys(installed.packages).some(
    (location) => locked.packages?.[location] === undefined,
  );
}

export async function reusePublishedDevelopmentRuntime(development: string) {
  const modules = path.join(development, "node_modules");
  if (existsSync(modules)) return false;
  let sourceLock: string;
  let fixtureLock: string;
  try {
    [sourceLock, fixtureLock] = await Promise.all([
      readFile(path.join(repoRoot, "package-lock.json"), "utf8"),
      readFile(path.join(development, "package-lock.json"), "utf8"),
    ]);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
  const reusable = developmentInputsLocked({
    sourceLock,
    fixtureLock,
    installed: jsonAt(path.join(repoRoot, "node_modules/.package-lock.json")),
    fixture: jsonAt(path.join(development, "package.json")),
    installedVersion: (location) =>
      jsonAt(path.join(repoRoot, location, "package.json"))?.version,
  });
  if (!reusable) return false;
  await linkInstalledDevelopmentRuntime(development);
  return true;
}

// Callers with an explicit installed-runtime contract use the same private
// package layout as eligible application fixtures, without sharing caches.
export async function linkInstalledDevelopmentRuntime(
  development: string,
  installedModules = path.join(repoRoot, "node_modules"),
) {
  const modules = path.join(development, "node_modules");
  // A real directory keeps .vite, .vite-temp and any other dot caches private.
  await mkdir(modules);
  try {
    for (const entry of await readdir(installedModules)) {
      if (entry.startsWith(".") && entry !== ".bin") continue;
      await symlink(
        path.join(installedModules, entry),
        path.join(modules, entry),
      );
    }
  } catch (error) {
    await rm(modules, { recursive: true, force: true });
    throw error;
  }
}
