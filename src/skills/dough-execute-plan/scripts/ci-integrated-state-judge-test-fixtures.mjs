// A real local history for judging integrated-state evidence directly
// (ci-integrated-state.mjs): a bare `origin`, a `writer` holding every commit,
// and an `observer` checkout cloned when the target held only accepted B.
// Candidate runs and their current attempts are the only stubbed facts: the
// provider boundary the observer reads through.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { integratedStateJudge } from "./ci-integrated-state.mjs";

export const policy = { check: "ci.yml", context: "push", jobs: ["covered"] };

const git = (cwd, ...args) =>
  execFileSync(
    "git",
    [
      "-C",
      cwd,
      "-c",
      "user.name=Judge",
      "-c",
      "user.email=judge@test",
      ...args,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();

// `writer` commits base and B on main, then C on main and each of `siblings`
// (descendants of B on branches of their own) and an unrelated `other` from
// base, all pushed to `origin`. `observer` holds only base and B.
export function judgeHistory(t, { siblings = 0 } = {}) {
  const root = mkdtempSync(join(tmpdir(), "integrated-judge-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const origin = join(root, "origin.git");
  const writer = join(root, "writer");
  const observer = join(root, "observer");
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", origin]);
  execFileSync("git", ["init", "-q", "-b", "main", writer]);
  git(writer, "remote", "add", "origin", origin);
  const commit = (file) => {
    writeFileSync(join(writer, file), `${file}\n`);
    git(writer, "add", file);
    git(writer, "commit", "-qm", file);
    return git(writer, "rev-parse", "HEAD");
  };
  const base = commit("base.txt");
  const b = commit("b.txt");
  git(writer, "push", "-q", "origin", "main");
  execFileSync("git", ["clone", "-q", origin, observer]);
  const c = commit("c.txt");
  git(writer, "push", "-q", "origin", "main");
  const descendants = Array.from(Array(siblings).keys(), (index) => {
    git(writer, "checkout", "-q", "-b", `sibling-${index}`, b);
    const sha = commit(`sibling-${index}.txt`);
    git(writer, "push", "-q", "origin", `sibling-${index}`);
    return sha;
  });
  git(writer, "checkout", "-q", "-b", "other", base);
  const other = commit("other.txt");
  git(writer, "push", "-q", "origin", "other");
  return {
    writer,
    observer,
    b,
    c,
    other,
    descendants,
    // Whether `repoDir` holds `sha`'s commit.
    holds: (repoDir, sha) => {
      try {
        git(repoDir, "cat-file", "-e", `${sha}^{commit}`);
        return true;
      } catch {
        return false;
      }
    },
  };
}

let nextRun = 9001;

// A listed candidate run of `sha` on main: completed green unless overridden.
export const listedRun = (sha, overrides = {}) => ({
  databaseId: nextRun++,
  attempt: 1,
  headSha: sha,
  headBranch: "main",
  event: "push",
  status: "completed",
  conclusion: "success",
  url: `https://ci.test/runs/${sha.slice(0, 7)}`,
  ...overrides,
});

// The provider's current attempt of a listed `run`: as listed, under the
// declared check and context, with its one green `covered` job.
export const currentAttempt = (run, overrides = {}) => ({
  ...run,
  check: "ci.yml",
  context: "push",
  jobs: [
    {
      name: "covered",
      status: "completed",
      conclusion: "success",
      databaseId: run.databaseId * 10,
      url: `${run.url}/job`,
    },
  ],
  ...overrides,
});

// A current-attempt read the provider cannot answer.
export const unreadable = () => {
  throw new Error("HTTP 502");
};

// One poll's judge over `repoDir` with the listed `runs`; `read(run)` answers
// each current-attempt read (as listed by default). `reads` records each read
// run id; `listings` counts candidate listings.
export function judgePoll({
  repoDir,
  runs = [],
  read = (run) => currentAttempt(run),
  declared = policy,
  ...poll
}) {
  const reads = [];
  let listings = 0;
  const judge = integratedStateJudge(declared, {
    repo: "owner/repo",
    branch: "main",
    repoDir,
    listCandidates: async () => {
      listings += 1;
      return typeof runs === "function" ? runs() : runs;
    },
    readCurrentAttempt: async (run, options) => {
      reads.push({ runId: run.databaseId, options });
      return read(run);
    },
    ...poll,
  });
  return { judge, reads, listings: () => listings };
}

// B's record as the observer holds it before a poll judges it.
export const accepted = (sha, state = "undiscovered") => ({ sha, state });

export const unresolved = (considered, declared = policy) => ({
  state: "unresolved",
  policy: declared,
  reason: "no_eligible_candidate",
  considered,
});

// The integrated evidence `run` of descendant `sha` validates for B.
export const validated = (b, sha, run, declared = policy) => ({
  state: "success",
  policy: declared,
  validated: {
    sha,
    branch: "main",
    runId: run.databaseId,
    attempt: run.attempt,
    url: run.url,
    check: "ci.yml",
    context: "push",
    ...(declared.jobs
      ? {
          jobs: [
            {
              name: "covered",
              jobId: run.databaseId * 10,
              conclusion: "success",
              url: `${run.url}/job`,
            },
          ],
        }
      : {}),
  },
  ancestry: {
    ancestor: b,
    descendant: sha,
    basis: "git merge-base --is-ancestor",
  },
});
