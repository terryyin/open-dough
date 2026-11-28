// The installation layer of a prepared start origin: `.gitignore` and either
// this run's working-tree skills or one released installation's files, joined
// to a repository description's first commit, and the project developer who
// commits each revision.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type {
  GitPerson,
  RepositoryDescription,
} from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { installedSkillPath } from "../../server/launchHosts.ts";
import type { InstalledFiles } from "./taggedInstallation.ts";

export const nativeStartLayouts = ["claude", "codex"] as const;
export type StartOriginLayout = (typeof nativeStartLayouts)[number] | "catalog";
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

// This run's working-tree skills under `source`, read now and installed for
// the layout's hosts.
export function workingTreeInstallation(
  layout: StartOriginLayout,
  source: string,
): InstalledFiles {
  const files: Record<string, string> = {};
  const executables: string[] = [];
  const project = { path: "", shown: "" };
  const hosts = layout === "catalog" ? nativeStartLayouts : [layout];
  for (const skill of installedStartSkills) {
    const installations = hosts.map((host) =>
      installedSkillPath(host, project, skill),
    );
    const skillSource = path.join(source, skill);
    for (const file of sourceFiles(skillSource)) {
      const from = path.join(skillSource, file);
      const contents = readFileSync(from, "utf8");
      const executable = statSync(from).mode & 0o100;
      for (const installed of installations) {
        const to = path.join(installed, file);
        files[to] = contents;
        if (executable) executables.push(to);
      }
    }
  }
  return { files, executables };
}

// The harness layer: `.gitignore` and the installation's files join the
// description's first commit instead of a commit of their own. The project's
// developer commits each revision that names no committer, as the execution
// checkout itself would.
export function joinInstallation(
  repository: StartRepository,
  { files, executables }: InstalledFiles,
): StartRepository {
  const [first, ...later] = repository.revisions;
  return {
    revisions: [
      {
        committer: dashboardDeveloper,
        ...first,
        files: { ".gitignore": ".worktrees/\n", ...files, ...first.files },
        executables: [...executables, ...(first.executables ?? [])],
      },
      ...later.map((revision) => ({
        committer: dashboardDeveloper,
        ...revision,
      })),
    ],
  };
}

export function withInstallation(
  repository: StartRepository,
  layout: StartOriginLayout,
  source: string,
): StartRepository {
  return joinInstallation(repository, workingTreeInstallation(layout, source));
}
