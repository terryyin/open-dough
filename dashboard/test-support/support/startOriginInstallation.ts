// The installation layer of a prepared start origin: `.gitignore` and this
// run's working-tree skills, joined to a repository description's first
// commit, and the project developer who commits each revision.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type {
  GitPerson,
  RepositoryDescription,
} from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { installedSkillPath } from "../../server/launchHosts.ts";

export type StartOriginLayout = "claude" | "codex";
export type StartRepository = RepositoryDescription<string>;

export const installedStartSkills = [
  "dough-execute-plan",
  "dough-product-backlog",
  "dough-story-refinement",
  "dough-land",
  "dough-story-wrap-up",
] as const;

// The first commit's committer and author, and the execution checkout's identity.
export const dashboardDeveloper: GitPerson = {
  name: "Dashboard Developer",
  email: "developer@example.test",
};

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: "utf8" }).filter(
    (file) => statSync(path.join(directory, file)).isFile(),
  );
}

// The harness layer: `.gitignore` and the installed skills, read from source
// now, join the description's first commit instead of a commit of their own.
// The project's developer commits each revision that names no committer, as
// the execution checkout itself would.
export function withInstallation(
  repository: StartRepository,
  layout: StartOriginLayout,
  source: string,
): StartRepository {
  const files: Record<string, string> = { ".gitignore": ".worktrees/\n" };
  const executables: string[] = [];
  const project = { path: "", shown: "" };
  for (const skill of installedStartSkills) {
    const installed = installedSkillPath(layout, project, skill);
    const skillSource = path.join(source, skill);
    for (const file of sourceFiles(skillSource)) {
      const from = path.join(skillSource, file);
      const to = path.join(installed, file);
      files[to] = readFileSync(from, "utf8");
      if (statSync(from).mode & 0o100) executables.push(to);
    }
  }
  const [first, ...later] = repository.revisions;
  return {
    revisions: [
      {
        committer: dashboardDeveloper,
        ...first,
        files: { ...files, ...first.files },
        executables: [...executables, ...(first.executables ?? [])],
      },
      ...later.map((revision) => ({
        committer: dashboardDeveloper,
        ...revision,
      })),
    ],
  };
}
