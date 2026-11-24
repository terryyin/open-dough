// What a start origin's execution checkout holds beyond the published trunk:
// the trunk it has fetched, and each described workspace as a start leaves
// a story's, a linked worktree `.worktrees/<slug>` on its branch.

import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import {
  commitDeclaredRevision,
  configureDeclaredAgentAuthorship,
  configureIdentity,
  declaredParents,
} from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import {
  type WorkspaceWithLocalState,
  writeLocalState,
} from "../../../Distribution/tests/support/repository-local-state.mjs";
import {
  dashboardDeveloper,
  type StartRepository,
} from "./startOriginPreparation.ts";

const exec = promisify(execFile);
const git = (cwd: string, ...args: string[]) =>
  exec("git", ["-C", cwd, ...args]);

// Trunk revisions from the first one stating `fetched: false` are published
// to origin, but the project's `main` and its tracking ref stay on the
// revision before it.
export async function leaveTrunkUnfetched(
  project: string,
  revisions: StartRepository["revisions"],
  commits: ReadonlyMap<string, string>,
) {
  const unfetched = revisions.findIndex(({ fetched }) => fetched === false);
  if (unfetched < 1) return;
  const fetched = commits.get(revisions[unfetched - 1]?.name ?? "") as string;
  await git(project, "reset", "--quiet", "--hard", fetched);
  await git(project, "update-ref", "refs/remotes/origin/main", fetched);
}

// The workspace's branch from its named trunk revision, checked out at
// `.worktrees/<slug>`, with its declared agent authorship when stated, its
// revisions committed there and never pushed, then its declared local state
// written over them.
export async function materializeStartWorkspace(
  project: string,
  {
    branch,
    from,
    checkoutIdentity,
    agent,
    revisions,
    local,
  }: WorkspaceWithLocalState,
  commits: Map<string, string>,
) {
  const worktree = path.join(project, ".worktrees", path.basename(branch));
  await git(
    project,
    "worktree",
    "add",
    "--quiet",
    "-b",
    branch,
    worktree,
    commits.get(from) as string,
  );
  if (checkoutIdentity)
    await configureIdentity(worktree, checkoutIdentity, { worktreeOnly: true });
  if (agent !== undefined)
    await configureDeclaredAgentAuthorship(worktree, agent);
  for (const revision of revisions)
    commits.set(
      revision.name,
      await commitDeclaredRevision(
        worktree,
        revision,
        checkoutIdentity ?? dashboardDeveloper,
        declaredParents(revision, commits),
      ),
    );
  writeLocalState(worktree, local);
}
