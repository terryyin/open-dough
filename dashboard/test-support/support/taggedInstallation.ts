// A released Open Dough installation: the pinned tag's own content, read from
// the checkout's tag or fetched from its origin, verified against the
// recorded peeled commit and installed by that release's own installer. A
// missing, unfetchable or mismatched tag fails naming the tag; there is no
// branch or working-tree fallback, and a failure leaves no installation.

import { execFile } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);

export type ReleasedInstallation = {
  readonly tag: string;
  readonly revision: string;
  readonly version: string;
};

export const pinnedRelease: ReleasedInstallation = {
  tag: "v0.3.97",
  revision: "d2d303b6215e3c707a75a8a257b98dc257e1bc7b",
  version: "0.3.97",
};

export const releaseSourceUrl = "https://github.com/terryyin/open-dough";

async function peeled(checkout: string, tag: string) {
  try {
    const { stdout } = await exec("git", [
      "-C",
      checkout,
      "rev-parse",
      "--verify",
      "--quiet",
      `refs/tags/${tag}^{commit}`,
    ]);
    return stdout.trim();
  } catch {
    return undefined;
  }
}

// The checkout's own tag when present, otherwise the tag fetched shallowly
// from the checkout's origin; it must peel to the recorded commit.
export async function releaseRevision(
  checkout: string,
  release: ReleasedInstallation,
): Promise<string> {
  let revision = await peeled(checkout, release.tag);
  if (revision === undefined) {
    try {
      await exec("git", [
        "-C",
        checkout,
        "fetch",
        "--quiet",
        "--depth",
        "1",
        "origin",
        "tag",
        release.tag,
      ]);
    } catch (error) {
      throw new Error(
        `Release tag ${release.tag} is unavailable: ${String(error)}`,
        { cause: error },
      );
    }
    revision = await peeled(checkout, release.tag);
  }
  if (revision !== release.revision)
    throw new Error(
      `Release tag ${release.tag} peels to ${revision ?? "nothing"}, not ${release.revision}`,
    );
  return revision;
}

function installedFiles(project: string): string[] {
  return readdirSync(project, { recursive: true, encoding: "utf8" }).filter(
    (file) =>
      file !== ".git" &&
      !file.startsWith(`.git${path.sep}`) &&
      statSync(path.join(project, file)).isFile(),
  );
}

export type InstalledFiles = {
  readonly files: Readonly<Record<string, string>>;
  readonly executables: readonly string[];
};

// The release's complete installation for one host, as project files.
export async function installRelease(
  checkout: string,
  release: ReleasedInstallation,
  platform: string,
): Promise<InstalledFiles> {
  const revision = await releaseRevision(checkout, release);
  const work = mkdtempSync(path.join(tmpdir(), "dough-release-"));
  try {
    const source = path.join(work, "source");
    const project = path.join(work, "project");
    mkdirSync(source);
    mkdirSync(project);
    await exec("sh", [
      "-c",
      'git -C "$1" archive "$2" | tar -x -C "$3"',
      "archive",
      checkout,
      revision,
      source,
    ]);
    await exec("git", ["init", "--quiet", project]);
    await exec("bash", [
      path.join(source, "install.sh"),
      "--target",
      project,
      "--source",
      releaseSourceUrl,
      "--platform",
      platform,
    ]);
    const files: Record<string, string> = {};
    const executables: string[] = [];
    for (const file of installedFiles(project)) {
      const from = path.join(project, file);
      files[file] = readFileSync(from, "utf8");
      if (statSync(from).mode & 0o100) executables.push(file);
    }
    return { files, executables };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
