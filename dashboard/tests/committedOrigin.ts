// Serves one isolated Git repository's committed bytes as GitHub would answer
// the local `gh` behind the page's dashboard (./support/fakeGitHub.ts). The
// journey records preparation through the real CLI, commits those files, and
// answers contents requests with `git show <revision>:path` and directory
// listings with `git ls-tree` at that revision — never with hand-constructed
// display state; each listed agent profile's history is its addition by a
// commit of its own (./pathHistoryAnswers.ts). A listing and a history read
// are answered but not observed.

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
import { observe, type ObservedRequest } from "./originObservation.ts";
import { commitAnswerIn, commitListIn } from "./pathHistoryAnswers.ts";

function showAt(repoDir: string, revision: string, repositoryPath: string) {
  try {
    return execFileSync(
      "git",
      ["-C", repoDir, "show", `${revision}:${repositoryPath}`],
      { encoding: "utf8" },
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

export type CommittedOrigin = {
  readonly requests: ObservedRequest[];
  readonly revision: string;
  readonly repository: string;
  readonly repoDir: string;
  hold(repositoryPath: string): () => void;
  // Answers "main", a repository path, or a listed directory with this raw
  // answer until restore.
  answerWith(what: string, answer: OriginAnswer): () => void;
  advanceTo(revision: string): void;
};

export function publishCommittedOrigin(
  page: Page,
  options: {
    readonly repoDir: string;
    readonly revision: string;
    readonly repository: string;
  },
): Promise<CommittedOrigin> {
  const { repoDir, repository } = options;
  let revision = options.revision;
  const requests: ObservedRequest[] = [];
  const held = new Map<string, Promise<void>>();
  const instead = new Map<string, OriginAnswer>();

  githubFor(page).serve(repository, async (call) => {
    const { request } = call;
    if (request.kind === "ref" && request.ref === "main") {
      observe(requests, call);
      await held.get("main");
      return instead.get("main") ?? commitAnswer(revision);
    }
    if (request.kind === "matching-refs") {
      await held.get("main");
      return asHeadsListing(instead.get("main") ?? commitAnswer(revision));
    }
    if (request.kind === "listing" && request.revision === revision) {
      const overridden = instead.get(request.path);
      if (overridden !== undefined) {
        return overridden;
      }
      const listed = listAt(repoDir, revision, request.path);
      return listed === undefined
        ? noConnection
        : directoryListingAnswer(request.path, listed);
    }
    // Each agent profile listed at the revision was added by a commit of its
    // own; these history reads are answered but not observed.
    const profiles = () => ({
      files: Object.fromEntries(
        (listAt(repoDir, revision, ".planning/agents") ?? []).map((path) => [
          path,
          "",
        ]),
      ),
    });
    if (request.kind === "commit-list" && request.revision === revision) {
      return (
        commitListIn(profiles(), request.path, request.perPage) ?? noConnection
      );
    }
    if (request.kind === "commit") {
      return commitAnswerIn([profiles()], request.sha) ?? noConnection;
    }
    // Only the currently published revision is readable; any other gets no
    // answer and is not observed.
    if (request.kind !== "content" || request.revision !== revision) {
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
    get revision() {
      return revision;
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
