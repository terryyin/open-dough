// One live-source Git snapshot per input profile and run, on first demand. Each
// fixture clones its own writable objects, index and working tree; its bare
// publication origin is created separately and remains empty until push.
import { execFile } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { repoRoot } from "./repositoryRoot.ts";
import { requestRunArtifact } from "./runArtifacts.ts";

const exec = promisify(execFile);
export type PublishedMainSourceProfile = "repository" | "application";
// Each profile's run artifact, the snapshot every fixture of that profile clones.
export const publishedMainSourceArtifactKeys = {
  repository: "published-main-source",
  application: "published-application-source",
} as const;
// The real app/runtime source, including the policy its watcher reads from Git.
// Tests, maintenance records and installed guidance are not application inputs.
const applicationPaths = [
  "dashboard/src",
  "dashboard/server",
  "dashboard/public",
  "dashboard/index.html",
  "dashboard/vite.config.mts",
  "dashboard/tsconfig*.json",
  "Distribution/src",
  "scripts",
  "assets",
  "package.json",
  "package-lock.json",
  ".gitignore",
  ".githooks",
  "VERSION",
  ".github/workflows/ci.yml",
] as const;

async function prepareSource(
  directory: string,
  source: string,
  env: NodeJS.ProcessEnv,
  signal?: AbortSignal,
  profile: PublishedMainSourceProfile = "repository",
) {
  const git = async (...args: string[]) =>
    exec("git", args, { cwd: directory, env, signal });
  const selected = profile === "application" ? ["--", ...applicationPaths] : [];
  const listed = async (...args: string[]) =>
    (
      await exec("git", ["ls-files", "-z", ...args, ...selected], {
        cwd: source,
        signal,
      })
    ).stdout
      .split("\0")
      .filter(Boolean);
  // Preserve the current working tree, including new names and deletions.
  // Avatars are URL-loaded local inputs, never required build source.
  const deleted = new Set(await listed("--deleted"));
  for (const file of await listed(
    "--cached",
    "--others",
    "--exclude-standard",
  )) {
    signal?.throwIfAborted();
    if (deleted.has(file) || file.startsWith("dashboard/public/agent-avatars/"))
      continue;
    const destination = path.join(directory, file);
    mkdirSync(path.dirname(destination), { recursive: true });
    cpSync(path.join(source, file), destination, {
      recursive: true,
      verbatimSymlinks: true,
    });
  }
  await git("init", "--quiet", "-b", "main");
  await git("config", "user.name", "Published main fixture");
  await git("config", "user.email", "fixture@example.invalid");
  await git("config", "maintenance.auto", "false");
  // Stream source into a pack once, rather than hashing it in every fixture.
  await git("-c", "core.bigFileThreshold=1", "add", "--all");
  await git(
    "-c",
    "core.hooksPath=/dev/null",
    "commit",
    "--quiet",
    "--allow-empty",
    "-m",
    "Fixture source",
  );
}

export function publishedMainSourceArtifact(
  source = repoRoot,
  profile: PublishedMainSourceProfile = "repository",
) {
  return [
    publishedMainSourceArtifactKeys[profile],
    {
      create: () => mkdtempSync(path.join(tmpdir(), "dough-published-source-")),
      prepare: (directory: string, signal: AbortSignal) =>
        prepareSource(
          directory,
          source,
          { ...process.env, HOME: directory },
          signal,
          profile,
        ),
    },
  ] as const;
}

export async function materializePublishedMainSource(
  development: string,
  env: NodeJS.ProcessEnv,
  profile: PublishedMainSourceProfile = "repository",
) {
  const snapshot = await requestRunArtifact(
    publishedMainSourceArtifactKeys[profile],
  );
  if (snapshot === undefined) {
    await prepareSource(development, repoRoot, env, undefined, profile);
    return;
  }
  // Local transport copies the prepared pack; no hardlinks or alternates let
  // a fixture's Git writes reach either the snapshot or another fixture.
  await exec(
    "git",
    ["clone", "--quiet", "--no-hardlinks", snapshot, development],
    {
      env,
    },
  );
  await exec("git", ["remote", "remove", "origin"], { cwd: development, env });
}
