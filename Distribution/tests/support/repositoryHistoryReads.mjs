// @ts-check
// Read the immutable history described by MakeMe without materializing Git.
// The description and revision-file encoder are shared with real repositories;
// only acquisition differs from the Git-backed comparison history reader.
import { renderRevisionFiles } from "./repository-revision-files.mjs";
import { integrationDeveloper } from "./repository-revision-commit.mjs";

/** @param {import("./repositoryTestData.mjs").RepositoryDescription} description */
export function repositoryHistoryReads(description) {
  /** @type {Map<string, { parent: string | undefined, parents: readonly string[], email: string, files: Record<string, string | Buffer>, subject: string }>} */
  const revisions = new Map();
  /** @param {readonly import("./repositoryTestData.mjs").RepositoryRevision[]} declared @param {string | undefined} parent @param {import("./repositoryTestData.mjs").GitPerson} checkoutIdentity */
  function add(declared, parent, checkoutIdentity) {
    let previous = parent;
    for (const revision of declared) {
      const parents =
        revision.parents ?? (previous === undefined ? [] : [previous]);
      const firstParent = parents[0];
      const files = renderRevisionFiles(
        firstParent === undefined
          ? {}
          : (revisions.get(firstParent)?.files ?? {}),
        revision,
      );
      const author = revision.author ?? revision.committer ?? checkoutIdentity;
      revisions.set(revision.name, {
        parent: firstParent,
        parents,
        email: author.email,
        files,
        subject: revision.message ?? revision.name,
      });
      previous = revision.name;
    }
  }
  const checkoutIdentity = description.checkoutIdentity ?? integrationDeveloper;
  add(description.revisions, undefined, checkoutIdentity);
  if (description.workspace)
    add(
      description.workspace.revisions,
      description.workspace.from,
      description.workspace.checkoutIdentity ?? checkoutIdentity,
    );
  /** @param {string} revision */
  function at(revision) {
    const found = revisions.get(revision);
    if (!found)
      throw new Error(`Revision ${revision} is not in the described history`);
    return found;
  }
  /** @param {string} head */
  function reachableFrom(head) {
    const pending = [head];
    const reached = /** @type {Set<string>} */ (new Set());
    while (pending.length > 0) {
      const revision = pending.pop();
      if (revision === undefined || reached.has(revision)) continue;
      reached.add(revision);
      pending.push(...at(revision).parents);
    }
    return reached;
  }
  // Named parents precede their children in the canonical description, so
  // reverse declaration order supplies valid topological external facts.
  // The real acquisition connection owns Git's ordering between sibling lines.
  /** @param {string} head */
  function orderedAt(head) {
    const reachable = reachableFrom(head);
    return [...revisions.keys()]
      .reverse()
      .filter((revision) => reachable.has(revision));
  }
  /** @type {import("../../../dashboard/server/comparisonBuildSource.ts").ComparisonHistory} */
  const history = {
    async firstParents(revision, limit) {
      const chain = [];
      for (
        let next = /** @type {string | undefined} */ (revision);
        next !== undefined && chain.length < limit;
        next = at(next).parent
      )
        chain.push(next);
      return chain;
    },
    async laterTrunk(landing, head, limit) {
      const chain = [];
      let next = /** @type {string | undefined} */ (head);
      while (next !== undefined && next !== landing) {
        chain.push(next);
        next = at(next).parent;
      }
      return next === landing ? chain.reverse().slice(0, limit) : [];
    },
    async workflowAt(revision, path) {
      return at(revision).files[path]?.toString() ?? null;
    },
    async changesBetween(from, to) {
      const before = at(from).files,
        after = at(to).files;
      return [...new Set([...Object.keys(before), ...Object.keys(after)])]
        .sort()
        .flatMap((path) => {
          if (!(path in before)) return [["A", path]];
          if (!(path in after)) return [["D", path]];
          return before[path]?.toString() === after[path]?.toString()
            ? []
            : [["M", path]];
        });
    },
  };
  /** @type {import("../../../dashboard/server/publishedStoryHistory.ts").PublishedStoryHistory} */
  const publishedStoryHistory = {
    async authoredAt(head, email) {
      return orderedAt(head)
        .filter((revision) => at(revision).email === email)
        .map((commit) => ({ commit, parents: [...at(commit).parents] }));
    },
    async profileTextsAt(path, names) {
      const texts = /** @type {Map<string, string>} */ (new Map());
      for (const revision of names) {
        const text = at(revision).files[path];
        if (text !== undefined) texts.set(revision, text.toString());
      }
      return texts;
    },
    async matchingProfilePaths(head, directory, identity) {
      const prefix = `${directory.replace(/\/$/, "")}/`;
      const matched = [];
      /** @param {string | Buffer | undefined} text */
      const matchingLines = (text) =>
        (text?.toString() ?? "")
          .split("\n")
          .filter((line) => line.includes(identity));
      for (const revision of orderedAt(head)) {
        const current = at(revision);
        // Git's default log has no merge diff. Canonical profile encoders keep
        // identity-bearing lines stable; compare their actual changed bytes.
        if (current.parents.length > 1) continue;
        const before =
          current.parent === undefined ? {} : at(current.parent).files;
        for (const path of new Set([
          ...Object.keys(before),
          ...Object.keys(current.files),
        ])) {
          if (!path.startsWith(prefix)) continue;
          if (
            JSON.stringify(matchingLines(before[path])) !==
            JSON.stringify(matchingLines(current.files[path]))
          )
            matched.push(path);
        }
      }
      return matched;
    },
    async orderedAt(head) {
      return orderedAt(head);
    },
    async mergesBetween(head, excluded) {
      const before = reachableFrom(excluded);
      return orderedAt(head)
        .filter(
          (revision) =>
            !before.has(revision) && at(revision).parents.length > 1,
        )
        .map((commit) => ({ commit, parents: [...at(commit).parents] }));
    },
    async isAncestor(ancestor, descendant) {
      return (
        revisions.has(ancestor) &&
        revisions.has(descendant) &&
        reachableFrom(descendant).has(ancestor)
      );
    },
    // Repository facts configure user.name/email, never author.name/email.
    async worktreeConfig() {
      return "";
    },
  };
  /** @param {string} revision */
  const subjectOf = async (revision) => at(revision).subject;
  /** @param {string} revision */
  const verifyRevision = async (revision) => {
    at(revision);
  };
  return { history, publishedStoryHistory, subjectOf, verifyRevision };
}
