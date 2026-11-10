// Raw history acquired for published story evidence and endpoint derivation.
// Claim recognition and owning/foreign selection stay with their consumers.
import { isAncestor, runGit, type GitCall } from "./gitRunner.ts";

export type RevisionParents = {
  readonly commit: string;
  readonly parents: readonly string[];
};

export type PublishedStoryHistory = {
  readonly authoredAt: (
    head: string,
    email: string,
  ) => Promise<readonly RevisionParents[]>;
  readonly profileTextsAt: (
    path: string,
    revisions: readonly string[],
  ) => Promise<ReadonlyMap<string, string>>;
  readonly matchingProfilePaths: (
    head: string,
    directory: string,
    identity: string,
  ) => Promise<readonly string[]>;
  readonly orderedAt: (head: string) => Promise<readonly string[]>;
  readonly mergesBetween: (
    head: string,
    excluded: string,
    topological?: boolean,
  ) => Promise<readonly RevisionParents[]>;
  readonly isAncestor: (
    ancestor: string,
    descendant: string,
  ) => Promise<boolean>;
  readonly worktreeConfig: (
    key: "author.name" | "author.email",
  ) => Promise<string>;
};

function rows(stdout: string): RevisionParents[] {
  return stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [commit = "", ...parents] = line.split(" ");
      return { commit, parents };
    });
}

// cat-file --batch prints a header, that many UTF-8 bytes, then a newline.
function printedBlobs(printed: string): ReadonlyMap<string, string> {
  const bytes = Buffer.from(printed, "utf8");
  const blobs = new Map<string, string>();
  let at = 0;
  while (at < bytes.length) {
    const headerEnd = bytes.indexOf("\n", at);
    if (headerEnd === -1) break;
    const [object = "", type, size] = bytes
      .toString("utf8", at, headerEnd)
      .split(" ");
    if (type !== "blob") break;
    const end = headerEnd + 1 + Number(size);
    blobs.set(object, bytes.toString("utf8", headerEnd + 1, end));
    at = end + 1;
  }
  return blobs;
}

export function publishedStoryHistory(call: GitCall): PublishedStoryHistory {
  return {
    async authoredAt(head, email) {
      return rows(
        (
          await runGit(
            [
              "rev-list",
              "--topo-order",
              "--parents",
              "--fixed-strings",
              `--author=<${email}>`,
              head,
            ],
            call,
          )
        ).stdout,
      );
    },
    async profileTextsAt(path, revisions) {
      const checked = (
        await runGit(["cat-file", "--batch-check"], {
          ...call,
          input: revisions.map((revision) => `${revision}:${path}\n`).join(""),
        })
      ).stdout.split("\n");
      const profileAt = new Map<string, string>();
      for (const [index, revision] of revisions.entries()) {
        const [object = "", type] = (checked[index] ?? "").split(" ");
        if (type === "blob") profileAt.set(revision, object);
      }
      const distinct = [...new Set(profileAt.values())];
      const blobs =
        distinct.length === 0
          ? new Map<string, string>()
          : printedBlobs(
              (
                await runGit(["cat-file", "--batch"], {
                  ...call,
                  input: distinct.map((object) => `${object}\n`).join(""),
                })
              ).stdout,
            );
      return new Map(
        [...profileAt].map(([revision, object]) => [
          revision,
          blobs.get(object) ?? "",
        ]),
      );
    },
    async matchingProfilePaths(head, directory, identity) {
      const escaped = identity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return (
        await runGit(
          [
            "log",
            "--full-history",
            "--format=",
            "--name-only",
            `-G${escaped}`,
            head,
            "--",
            directory,
          ],
          call,
        )
      ).stdout.split("\n");
    },
    async orderedAt(head) {
      return (await runGit(["rev-list", "--topo-order", head], call)).stdout
        .trim()
        .split("\n")
        .filter(Boolean);
    },
    async mergesBetween(head, excluded, topological = false) {
      return rows(
        (
          await runGit(
            [
              "rev-list",
              "--merges",
              "--parents",
              ...(topological ? ["--topo-order"] : []),
              head,
              `^${excluded}`,
            ],
            call,
          )
        ).stdout,
      );
    },
    isAncestor: (ancestor, descendant) =>
      isAncestor(ancestor, descendant, call),
    async worktreeConfig(key) {
      try {
        return (
          await runGit(["config", "--worktree", "--get", key], call)
        ).stdout.trim();
      } catch (error) {
        if (call.signal?.aborted === true) throw error;
        return "";
      }
    },
  };
}
