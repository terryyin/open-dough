// One test's start origin: a copy of its description's prepared origin and a
// execution checkout of it. A copy of a shared prepared origin receives the
// description's later revisions from the execution checkout, each on the
// parents it names, as a materialized history has them. Answers the commit
// each named revision became. The execution checkout then fetches only what
// the description says it has, and holds the description's workspace
// (./startOriginWorkspace.ts); neither reaches the prepared origin.

import { execFile } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import {
  commitDeclaredRevision,
  declaredParents,
} from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  createStartOriginPreparationDirectory,
  dashboardDeveloper,
  preparedRevisions,
  preparedStartOrigin,
  prepareStartOrigin,
  type StartRepository,
  type StartRevisions,
} from "./startOriginPreparation.ts";
import {
  gitHubRepositoryUrl,
  routeOriginThroughHome,
} from "./fixtureOriginRoute.ts";
import { describedWorkspaces } from "../../../Distribution/tests/support/repository-workspace.mjs";
import {
  leaveTrunkUnfetched,
  materializeStartWorkspace,
} from "./startOriginWorkspace.ts";

const exec = promisify(execFile);

export async function initializeStartOrigin(
  origin: string,
  home: string,
  project: string,
  repository: string,
  host: "claude" | "codex" | "cursor",
  description: StartRepository,
): Promise<StartRevisions> {
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
    // The machine HOME routes the configured URL to this origin; the clone
    // includes that HOME's config, so a command run in it under another HOME
    // reaches the same origin.
    routeOriginThroughHome(home, origin, repository);
    const homeConfig = path.join(home, ".gitconfig");
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
      `include.path=${homeConfig}`,
      gitHubRepositoryUrl(repository),
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
    const commits = new Map(Object.entries(preparedRevisions(directory)));
    const later = shared ? description.revisions.slice(1) : [];
    if (later.length > 0) {
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
    await leaveTrunkUnfetched(project, description.revisions, commits);
    for (const workspace of describedWorkspaces(description))
      await materializeStartWorkspace(project, workspace, commits);
    return Object.fromEntries(commits);
  } finally {
    if (prepared === undefined)
      rmSync(directory, { recursive: true, force: true });
  }
}
