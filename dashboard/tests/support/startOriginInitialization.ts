// One test's start origin: a copy of its description's prepared origin and a
// project checkout of it. A copy of a shared prepared origin receives the
// description's later revisions from the project checkout, each on the
// parents it names, as a materialized history has them.

import { execFile } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import {
  commitDeclaredRevision,
  declaredParents,
} from "../../../tests/support/repository-fixture.mjs";
import {
  createStartOriginPreparationDirectory,
  dashboardDeveloper,
  preparedStartOrigin,
  prepareStartOrigin,
  type StartRepository,
} from "./startOriginPreparation.ts";

const exec = promisify(execFile);

export async function initializeStartOrigin(
  origin: string,
  project: string,
  repository: string,
  host: "claude" | "codex" | "cursor",
  description: StartRepository,
): Promise<void> {
  const layout = host === "claude" ? "claude" : "codex";
  const { directory: prepared, shared } = await preparedStartOrigin(
    layout,
    description,
  );
  const directory = prepared ?? createStartOriginPreparationDirectory();
  try {
    // A configuration with no inherited owner gets a private copy.
    if (prepared === undefined)
      await prepareStartOrigin(directory, layout, description);
    cpSync(path.join(directory, layout), origin, {
      recursive: true,
    });
    mkdirSync(path.dirname(project), { recursive: true });
    const spelled = `https://github.com/${repository}.git`;
    await exec("git", [
      "clone",
      "--no-hardlinks",
      "-c",
      `user.name=${dashboardDeveloper.name}`,
      "-c",
      `user.email=${dashboardDeveloper.email}`,
      "-c",
      "maintenance.auto=false",
      "-c",
      `url.${origin}.insteadOf=${spelled}`,
      spelled,
      project,
    ]);
    // The original init + explicit push fixture had no upstream branch.
    await exec("git", [
      "-C",
      project,
      "config",
      "--remove-section",
      "branch.main",
    ]);
    await exec("git", [
      "-C",
      project,
      "symbolic-ref",
      "--delete",
      "refs/remotes/origin/HEAD",
    ]);
    const later = shared ? description.revisions.slice(1) : [];
    if (later.length > 0) {
      const commits = new Map<string, string>();
      for (const revision of later)
        commits.set(
          revision.name,
          await commitDeclaredRevision(
            project,
            revision,
            dashboardDeveloper,
            declaredParents(revision, commits),
          ),
        );
      await exec("git", ["-C", project, "push", "--quiet", "origin", "main"]);
    }
  } finally {
    if (prepared === undefined)
      rmSync(directory, { recursive: true, force: true });
  }
}
