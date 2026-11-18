// Real prior commits for a trunk fixture. The first normal commit includes
// existing staged/untracked facts; later declared changes share one Git import.
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";

type TrunkCommitChange = {
  readonly message: string;
  readonly file: string;
  readonly content: string;
};

type TrunkCommit = {
  readonly parent: string;
  readonly revision: string;
};

const data = (text: string) =>
  `data ${String(Buffer.byteLength(text))}\n${text}\n`;

// fast-import uses Git's C-quoted paths; JSON's remaining control escapes
// need octal spelling rather than \u00xx.
const quotedPath = (file: string) =>
  JSON.stringify(file).replace(
    /\\u00[0-9a-f]{2}/gi,
    (escaped) =>
      `\\${Number.parseInt(escaped.slice(4), 16).toString(8).padStart(3, "0")}`,
  );

function laterRevisions(
  project: string,
  parent: string,
  changes: readonly TrunkCommitChange[],
): readonly string[] {
  const ref = `refs/dough-fixtures/${randomUUID()}`;
  const author = git(project, "var", "GIT_AUTHOR_IDENT");
  const committer = git(project, "var", "GIT_COMMITTER_IDENT");
  const commits = changes.map(({ message, file, content }, index) => {
    const at = path.join(project, file);
    const mode =
      existsSync(at) && (statSync(at).mode & 0o111) !== 0 ? "100755" : "100644";
    return [
      `commit ${ref}\nmark :${String(index + 1)}\n`,
      `author ${author}\ncommitter ${committer}\n`,
      data(`${message}\n`),
      `from ${index === 0 ? parent : `:${String(index)}`}\n`,
      `M ${mode} inline ${quotedPath(file)}\n`,
      data(content),
      "\n",
    ].join("");
  });
  const marks = [...changes.keys()].map(
    (index) => `get-mark :${String(index + 1)}\n`,
  );
  try {
    const output = execFileSync("git", ["fast-import", "--quiet"], {
      cwd: project,
      input: `${commits.join("")}${marks.join("")}done\n`,
      encoding: "utf8",
    });
    const revisions = output.trim().split("\n");
    if (
      revisions.length !== changes.length ||
      revisions.some((revision) => !/^[0-9a-f]{40,64}$/.test(revision))
    )
      throw new Error("Git did not return every declared trunk commit.");
    // Import touches only its private ref. A normal fast-forward updates
    // the fixture's checked-out branch and files without resetting them.
    git(project, "merge", "--quiet", "--ff-only", ref);
    return revisions;
  } finally {
    git(project, "update-ref", "-d", ref);
  }
}

export function commitTrunkChanges(
  project: string,
  changes: readonly TrunkCommitChange[],
): readonly TrunkCommit[] {
  const [first, ...later] = changes;
  if (first === undefined) return [];
  const base = git(project, "rev-parse", "HEAD");
  writeAt(project, first.file, first.content);
  commitAll(project, first.message);
  const firstRevision = git(project, "rev-parse", "HEAD");
  const revisions = [
    firstRevision,
    ...(later.length === 0
      ? []
      : laterRevisions(project, firstRevision, later)),
  ];
  let parent = base;
  return revisions.map((revision) => {
    const committed = { revision, parent };
    parent = revision;
    return committed;
  });
}
