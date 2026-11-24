// A fixture machine's Review repository for the configured project
// `terryyin/open-dough`, and the history gaps cases arrange in it.
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
} from "node:fs";
import path from "node:path";

type FixtureOrigin = { readonly machine: string; readonly project: string };

export const fixtureReviewRepository = (machine: string) =>
  path.join(
    machine,
    "home",
    ".open-dough",
    "dashboard",
    "review-repositories",
    "terryyin",
    "open-dough.git",
  );

const git = (cwd: string, env: NodeJS.ProcessEnv, ...args: string[]) =>
  execFileSync("git", args, { cwd, env, encoding: "utf8" }).trim();

// Published history reaches both the execution checkout and the Review
// repository only one commit deep; later syncs keep that depth.
export function shallowPublishedHistory(origin: FixtureOrigin): void {
  git(
    origin.project,
    process.env,
    "fetch",
    "--quiet",
    "--depth=1",
    "origin",
    "main",
  );
  const review = fixtureReviewRepository(origin.machine);
  const env = { ...process.env, HOME: path.join(origin.machine, "home") };
  mkdirSync(review, { recursive: true });
  git(review, env, "init", "--quiet", "--bare");
  git(
    review,
    env,
    "config",
    "remote.origin.url",
    "https://github.com/terryyin/open-dough.git",
  );
  git(
    review,
    env,
    "fetch",
    "--quiet",
    "--depth=1",
    "origin",
    "+refs/heads/main:refs/remotes/origin/main",
  );
}

// The synced Review repository loses one object, as a damaged store would.
export function dropReviewRepositoryObject(machine: string, id: string): void {
  const objects = path.join(fixtureReviewRepository(machine), "objects");
  const packs = path.join(objects, "pack");
  for (const name of readdirSync(packs).filter((n) => n.endsWith(".pack"))) {
    const pack = readFileSync(path.join(packs, name));
    for (const kept of readdirSync(packs).filter((n) =>
      n.startsWith(name.slice(0, -".pack".length)),
    ))
      rmSync(path.join(packs, kept));
    execFileSync("git", ["unpack-objects", "-q"], {
      cwd: fixtureReviewRepository(machine),
      input: pack,
    });
  }
  rmSync(path.join(objects, id.slice(0, 2), id.slice(2)));
}

// The configured execution checkout moves away; `restore` moves it back.
export function renameExecutionCheckout(origin: FixtureOrigin) {
  const renamed = `${origin.project}-renamed`;
  renameSync(origin.project, renamed);
  return {
    restore: () => {
      renameSync(renamed, origin.project);
    },
  };
}

// Origin's trunk advances while the execution checkout still tracks the
// trunk it last synced, which this returns.
export function trunkAdvancedPastCheckout(origin: FixtureOrigin): string {
  const synced = git(origin.project, process.env, "rev-parse", "origin/main");
  git(
    origin.project,
    process.env,
    "commit",
    "--quiet",
    "--allow-empty",
    "-m",
    "later",
  );
  git(origin.project, process.env, "push", "--quiet", "origin", "HEAD:main");
  git(
    origin.project,
    process.env,
    "update-ref",
    "refs/remotes/origin/main",
    synced,
  );
  return synced;
}
