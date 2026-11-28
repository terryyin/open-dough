// Observe only branches named by Taken profiles on the verified local trunk.
// The existing confirmation is the authority for names on an unchanged
// trunk. A changed trunk can require a second advertisement for new names.
import { createHash } from "node:crypto";
import { isSafeBranchName } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type {
  BoardConfirmation,
  ConfirmedBranch,
} from "./boardConfirmation.ts";
import { takenEntriesByBranch } from "./branchReachability.ts";
import { githubGitCredentials } from "./githubGitTransport.ts";
import { fetchGitTransport, runGit, type GitCall } from "./gitRunner.ts";
import { remoteBranchHeads } from "./gitTargetFetch.ts";
import { gitTreeEntry } from "./gitTreeFiles.ts";

export const branchRef = (branch: string) => `refs/heads/${branch}`;

export function formerlyWatched(former: BoardConfirmation | undefined) {
  return (former?.branches ?? [])
    .map(({ branch }) => branch)
    .filter(isSafeBranchName);
}

async function watchedBranches(
  source: PublishedSource,
  revision: string,
  backlog: string,
  call: GitCall,
) {
  const taken = await takenEntriesByBranch(
    source,
    revision,
    async (file) =>
      file === source.backlogPath
        ? backlog
        : (await runGit(["cat-file", "blob", `${revision}:${file}`], call))
            .stdout,
    async (directory) => {
      const { stdout } = await runGit(
        [
          "--literal-pathspecs",
          "ls-tree",
          "-z",
          revision,
          "--",
          `${directory}/`,
        ],
        call,
      );
      return stdout.split("\0").flatMap((record) => {
        const entry = gitTreeEntry(record);
        if (entry?.type !== "blob" || !/^100\d{3}$/.test(entry.mode)) return [];
        const name = entry.path.slice(directory.length + 1);
        return !name || name.includes("/") ? [] : [{ name, sha: entry.object }];
      });
    },
    { currentWatches: true },
  );
  return [...taken.keys()];
}

// Hash the branch name so former branch pins do not conflict with a future
// branch whose name extends or shortens it.
const boardBranchRef = (branch: string) =>
  `refs/open-dough/board-stories/${createHash("sha256").update(branch).digest("hex")}`;

async function readableHead(head: string, call: GitCall) {
  try {
    await runGit(["cat-file", "-e", `${head}^{tree}`], call);
    return true;
  } catch (error) {
    if (call.signal?.aborted) throw error;
    return false;
  }
}

export async function verifiedBoardBranches(
  source: PublishedSource,
  revision: string,
  backlog: string,
  former: BoardConfirmation | undefined,
  advertised: ReadonlyMap<string, string>,
  call: GitCall,
): Promise<readonly ConfirmedBranch[] | undefined> {
  const formerly = formerlyWatched(former);
  const watched =
    former?.revision === revision && former.branches !== undefined
      ? formerly
      : await watchedBranches(source, revision, backlog, call);
  const formerlySet = new Set(formerly);
  const newlyWatched = watched.filter((branch) => !formerlySet.has(branch));
  const additional = await remoteBranchHeads(
    "origin",
    newlyWatched.map(branchRef),
    call,
    githubGitCredentials,
  );
  const result = watched.map((branch) => {
    const heads = formerlySet.has(branch) ? advertised : additional;
    return { branch, head: heads.get(branchRef(branch)) ?? null };
  });
  const formerHeads = new Map(
    former?.branches?.map(({ branch, head }) => [branch, head]),
  );
  const needsFetch: { branch: string; head: string }[] = [];
  for (const { branch, head } of result) {
    if (
      head !== null &&
      (formerHeads.get(branch) !== head || !(await readableHead(head, call)))
    ) {
      needsFetch.push({ branch, head });
    }
  }
  if (needsFetch.length === 0) return result;
  await fetchGitTransport(
    [
      ...githubGitCredentials,
      "fetch",
      "--quiet",
      "--no-write-fetch-head",
      "--refmap=",
      "origin",
      ...needsFetch.map(
        ({ branch }) => `+${branchRef(branch)}:${boardBranchRef(branch)}`,
      ),
    ],
    call,
  );
  for (const { branch, head } of needsFetch) {
    const { stdout } = await runGit(
      ["rev-parse", "--verify", `${boardBranchRef(branch)}^{commit}`],
      call,
    );
    if (stdout.trim() !== head || !(await readableHead(head, call)))
      return undefined;
  }
  return result;
}
