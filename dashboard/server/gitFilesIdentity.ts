// The identity of the Git files a checkout's local workspaces are read from
// (`./localWorkspaces.ts`), so an unchanged checkout is not read again: the
// checkout folder and its `.git`, the repository's config, packed refs and
// reftable list, the trunk's remote-tracking ref, and for every linked
// worktree its administrative entry (head, location, worktree config) with
// the branch ref its head names and the worktree's own `.git` file. Every
// workspace fact Git answers there -- which worktrees are listed and on which
// branch, each one's author config, and the profiles its head commit and
// trunk's commit hold -- is read from those files or from objects their
// commits name, which never change. Each file's identity is its inode,
// modification time, and size, as `./machineJsonStore.ts` trusts a file's;
// a file changed within the last second is not yet trusted, and then there is
// no identity, so the caller reads Git afresh. Only file metadata and the two
// small files naming each worktree's branch and location are read.

import type { BigIntStats } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

// How long after a change a file's identity is trusted to tell it apart
// from a later replacement.
const settledNs = 1_000_000_000n;

class Unsettled extends Error {}

function identityOf(stats: BigIntStats): string {
  const nowNs = BigInt(Date.now()) * 1_000_000n;
  if (nowNs - stats.mtimeNs < settledNs || nowNs - stats.ctimeNs < settledNs)
    throw new Unsettled();
  return `${String(stats.ino)}:${String(stats.mtimeNs)}:${String(stats.size)}`;
}

// A file's identity, or how it could not be looked at.
async function fileIdentity(file: string): Promise<string> {
  try {
    return identityOf(await stat(file, { bigint: true }));
  } catch (error) {
    if (error instanceof Unsettled) throw error;
    return (error as NodeJS.ErrnoException).code ?? "unreadable";
  }
}

async function text(file: string): Promise<string | undefined> {
  try {
    return (await readFile(file, "utf8")).trim();
  } catch {
    return undefined;
  }
}

// The repository folder Git keeps for `checkout`, and the common one shared
// by its worktrees, as `.git` names them.
async function gitFolders(
  checkout: string,
): Promise<{ readonly own: string; readonly common: string } | undefined> {
  const dotGit = path.join(checkout, ".git");
  try {
    if ((await stat(dotGit)).isDirectory())
      return { own: dotGit, common: dotGit };
  } catch {
    return undefined;
  }
  const named = (await text(dotGit))?.match(/^gitdir: (.+)$/)?.[1];
  if (named === undefined) return undefined;
  const own = path.resolve(checkout, named);
  const common = await text(path.join(own, "commondir"));
  return {
    own,
    common: common === undefined ? own : path.resolve(own, common),
  };
}

// One linked worktree's administrative entry, its branch ref, and its
// worktree's `.git` file.
async function worktreeIdentity(common: string, name: string): Promise<string> {
  const entry = path.join(common, "worktrees", name);
  const head = await text(path.join(entry, "HEAD"));
  const branch = head?.match(/^ref: (refs\/heads\/.+)$/)?.[1];
  const located = await text(path.join(entry, "gitdir"));
  const parts = await Promise.all([
    fileIdentity(path.join(entry, "HEAD")),
    fileIdentity(path.join(entry, "gitdir")),
    fileIdentity(path.join(entry, "config.worktree")),
    branch === undefined ? "detached" : fileIdentity(path.join(common, branch)),
    located === undefined ? "unlocated" : fileIdentity(located),
  ]);
  return `${name}=${String(head)}>${String(located)}:${parts.join(",")}`;
}

// The checkout's Git identity for workspaces read against the remote-tracking
// `trunk` (such as `origin/main`), or
// undefined while one of its files changed too recently to be trusted.
export async function gitFilesIdentity(
  checkout: string,
  trunk: string,
): Promise<string | undefined> {
  try {
    const folder = await fileIdentity(checkout);
    const folders = await gitFolders(checkout);
    if (folders === undefined) return `${folder}|no-git`;
    const { own, common } = folders;
    let names: string[];
    try {
      names = (await readdir(path.join(common, "worktrees"))).sort();
    } catch {
      names = [];
    }
    const parts = await Promise.all([
      fileIdentity(path.join(checkout, ".git")),
      fileIdentity(path.join(own, "HEAD")),
      fileIdentity(path.join(common, "config")),
      fileIdentity(path.join(common, "packed-refs")),
      fileIdentity(path.join(common, "reftable", "tables.list")),
      fileIdentity(path.join(common, "refs", "remotes", trunk)),
      ...names.map((name) => worktreeIdentity(common, name)),
    ]);
    return [folder, own, common, ...parts].join("|");
  } catch (error) {
    if (error instanceof Unsettled) return undefined;
    throw error;
  }
}
