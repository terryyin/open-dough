// Serves one isolated Git repository's committed bytes as GitHub would answer
// the local `gh` behind the page's dashboard (./support/fakeGitHub.ts). The
// journey records preparation through the real CLI, commits those files, and
// answers contents requests with `git show <revision>:path` and directory
// listings with `git ls-tree` at that revision — never with hand-constructed
// display state; each listed agent profile's history is its addition by a
// commit of its own (./pathHistoryAnswers.ts). A listing and a history read
// are answered but not observed. A comparison of two commits is answered from
// the repository's own history (./comparisonAnswers.ts) and kept in
// `compares`. A repository the journey publishes to may be followed
// (`follows`): its `main` is then the published revision as each request
// arrives, as GitHub follows pushes, and any of its commits is readable.

import { execFileSync } from "node:child_process";
import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest.ts";
import {
  asHeadsListing,
  commitAnswer,
  directoryListingAnswer,
  noConnection,
  notFoundAnswer,
  rawFileAnswer,
  type OriginAnswer,
} from "./originAnswers.ts";
import { comparisonIn } from "./comparisonAnswers.ts";
import { observe, type ObservedRequest } from "./originObservation.ts";
import { commitAnswerIn, commitListIn } from "./pathHistoryAnswers.ts";
import { committedHistoryAnswers } from "./committedHistoryAnswers.ts";

function showAt(repoDir: string, revision: string, repositoryPath: string) {
  try {
    return execFileSync(
      "git",
      ["-C", repoDir, "show", `${revision}:${repositoryPath}`],
      // An absent path is a 404, not output.
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
  } catch {
    return undefined;
  }
}

// The directory's paths at the revision; undefined once the journey's
// repository is gone, as it is for a request arriving after the journey ends.
function listAt(repoDir: string, revision: string, directory: string) {
  try {
    return execFileSync(
      "git",
      [
        "-C",
        repoDir,
        "ls-tree",
        "--name-only",
        revision,
        "--",
        `${directory}/`,
      ],
      { encoding: "utf8" },
    )
      .split("\n")
      .filter((path) => path !== "");
  } catch {
    return undefined;
  }
}

// The commit `name` names in the repository, if it names one.
function commitOf(repoDir: string, name: string): string | undefined {
  try {
    return execFileSync(
      "git",
      ["-C", repoDir, "rev-parse", "--verify", "--quiet", `${name}^{commit}`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    return undefined;
  }
}

export type CommittedOrigin = {
  readonly requests: ObservedRequest[];
  // Each comparison asked, as `<base>...<head>`, in arrival order.
  readonly compares: string[];
  readonly revision: string;
  readonly repository: string;
  readonly repoDir: string;
  // Holds "main", "compare", or a repository path's answers until released.
  hold(repositoryPath: string): () => void;
  // Answers "main", "compare", a repository path, or a listed directory with
  // this raw answer until restore.
  answerWith(what: string, answer: OriginAnswer): () => void;
  advanceTo(revision: string): void;
};

export function publishCommittedOrigin(
  page: Page,
  options: {
    readonly repoDir: string;
    readonly revision: string;
    readonly repository: string;
    readonly follows?: boolean;
    // Read actual allocation history instead of the default one-addition
    // history supplied for each listed agent profile.
    readonly realHistory?: boolean;
  },
): Promise<CommittedOrigin> {
  const { repoDir, repository } = options;
  let revision = options.revision;
  const follows = options.follows === true;
  // The revision `main` names now.
  const published = () =>
    follows ? (commitOf(repoDir, "main") ?? revision) : revision;
  // Whether a pinned read of `at` is answered.
  const readable = (at: string) =>
    follows ? commitOf(repoDir, at) === at : at === revision;
  const requests: ObservedRequest[] = [];
  const compares: string[] = [];
  const held = new Map<string, Promise<void>>();
  const instead = new Map<string, OriginAnswer>();
  const history = committedHistoryAnswers(repoDir);

  githubFor(page).serve(repository, async (call) => {
    const { request } = call;
    if (request.kind === "ref" && request.ref === "main") {
      observe(requests, call);
      await held.get("main");
      return instead.get("main") ?? commitAnswer(published());
    }
    if (request.kind === "compare") {
      compares.push(`${request.base}...${request.head}`);
      await held.get("compare");
      const overridden = instead.get("compare");
      if (overridden !== undefined) return overridden;
      return comparisonIn(repoDir, request.base, request.head);
    }
    if (request.kind === "matching-refs") {
      await held.get("main");
      return asHeadsListing(instead.get("main") ?? commitAnswer(published()));
    }
    if (request.kind === "listing" && readable(request.revision)) {
      const overridden = instead.get(request.path);
      if (overridden !== undefined) {
        return overridden;
      }
      const listed = listAt(repoDir, request.revision, request.path);
      return listed === undefined
        ? noConnection
        : directoryListingAnswer(request.path, listed);
    }
    // Each agent profile listed at the revision was added by a commit of its
    // own; these history reads are answered but not observed.
    const profiles = (at = published()) => ({
      files: Object.fromEntries(
        (listAt(repoDir, at, ".planning/agents") ?? []).map((path) => [
          path,
          "",
        ]),
      ),
    });
    if (request.kind === "commit-list" && readable(request.revision)) {
      if (options.realHistory === true) {
        return history.list(request.revision, request.path, request.perPage);
      }
      return (
        commitListIn(
          profiles(request.revision),
          request.path,
          request.perPage,
        ) ?? noConnection
      );
    }
    if (request.kind === "commit") {
      if (
        options.realHistory === true &&
        commitOf(repoDir, request.sha) === request.sha
      ) {
        return history.commit(request.sha);
      }
      return commitAnswerIn([profiles()], request.sha) ?? noConnection;
    }
    // Only the currently published revision is readable, or, followed, any
    // commit; any other gets no answer and is not observed.
    if (request.kind !== "content" || !readable(request.revision)) {
      return noConnection;
    }
    observe(requests, call);
    await held.get(request.path);
    const overridden = instead.get(request.path);
    if (overridden !== undefined) {
      return overridden;
    }
    const body = showAt(repoDir, request.revision, request.path);
    return body === undefined ? notFoundAnswer() : rawFileAnswer(body);
  });

  return Promise.resolve({
    requests,
    compares,
    get revision() {
      return published();
    },
    repository,
    repoDir,
    hold(repositoryPath) {
      let release: () => void = () => undefined;
      held.set(
        repositoryPath,
        new Promise<void>((resolve) => {
          release = resolve;
        }),
      );
      return () => {
        held.delete(repositoryPath);
        release();
      };
    },
    answerWith(what, answer) {
      instead.set(what, answer);
      return () => {
        instead.delete(what);
      };
    },
    advanceTo(next) {
      revision = next;
    },
  });
}

export function contentPathsRead(origin: CommittedOrigin): string[] {
  return origin.requests.map(({ request }) => {
    if (request.kind === "ref") {
      return request.ref;
    }
    if (request.kind === "content") {
      return `${request.path}?ref=${request.revision}`;
    }
    return "unknown";
  });
}
