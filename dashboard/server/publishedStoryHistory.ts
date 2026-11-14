// Raw history acquired for published story evidence and endpoint derivation.
// Claim recognition and owning/foreign selection stay with their consumers.
import { runGit, type GitCall, type GitOutput } from "./gitRunner.ts";

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
  // Only immutable object queries belong to this recovery's reuse. Include
  // stdin: identical cat-file argv can ask for entirely different objects.
  const reads = new Map<string, Promise<GitOutput>>();
  const readAt = (
    revisions: readonly string[],
    args: readonly string[],
    input = call.input,
  ): Promise<GitOutput> => {
    const options = input === undefined ? call : { ...call, input };
    if (
      call.signal?.aborted ||
      !revisions.every((revision) =>
        /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(revision),
      )
    )
      return runGit(args, options);
    const key = JSON.stringify([args, input]);
    const existing = reads.get(key);
    if (existing !== undefined) return existing;
    const pending = runGit(args, options)
      .then((output) => {
        // A missing batch object may arrive in a later fetch. Keep that read
        // retryable, just like a command that could not read its objects.
        if (args[0] === "cat-file" && / missing(?:\n|$)/.test(output.stdout))
          reads.delete(key);
        return output;
      })
      .catch((error: unknown) => {
        // Even ancestry exit 1 can change after shallow history is deepened.
        // Preserve false-on-error without retaining an incomplete negative.
        reads.delete(key);
        throw error;
      });
    reads.set(key, pending);
    return pending;
  };
  // A full object ID can still have incomplete ancestry in a shallow repo.
  // Observe completeness once; an initially shallow reader keeps walking Git
  // after deepening, while immutable profile blobs remain reusable.
  let completeGraph: Promise<boolean> | undefined;
  const graphAt = async (
    revisions: readonly string[],
    args: readonly string[],
  ) => {
    completeGraph ??= runGit(
      ["rev-parse", "--is-shallow-repository"],
      call,
    ).then(
      ({ stdout }) => stdout.trim() === "false",
      () => false,
    );
    return (await completeGraph) ? readAt(revisions, args) : runGit(args, call);
  };
  return {
    async authoredAt(head, email) {
      return rows(
        (
          await graphAt(
            [head],
            [
              "rev-list",
              "--topo-order",
              "--parents",
              "--fixed-strings",
              `--author=<${email}>`,
              head,
            ],
          )
        ).stdout,
      );
    },
    async profileTextsAt(path, revisions) {
      const checked = (
        await readAt(
          revisions,
          ["cat-file", "--batch-check"],
          revisions.map((revision) => `${revision}:${path}\n`).join(""),
        )
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
                await readAt(
                  distinct,
                  ["cat-file", "--batch"],
                  distinct.map((object) => `${object}\n`).join(""),
                )
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
        await graphAt(
          [head],
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
        )
      ).stdout.split("\n");
    },
    async orderedAt(head) {
      return (await graphAt([head], ["rev-list", "--topo-order", head])).stdout
        .trim()
        .split("\n")
        .filter(Boolean);
    },
    async mergesBetween(head, excluded, topological = false) {
      return rows(
        (
          await graphAt(
            [head, excluded],
            [
              "rev-list",
              "--merges",
              "--parents",
              ...(topological ? ["--topo-order"] : []),
              head,
              `^${excluded}`,
            ],
          )
        ).stdout,
      );
    },
    async isAncestor(ancestor, descendant) {
      try {
        await readAt(
          [ancestor, descendant],
          ["merge-base", "--is-ancestor", ancestor, descendant],
        );
        return true;
      } catch {
        return false;
      }
    },
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
