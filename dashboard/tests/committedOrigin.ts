// Serves one isolated Git repository's committed bytes as GitHub would answer
// the local `gh` behind the page's dashboard (./support/fakeGitHub.ts). The
// journey records preparation through the real CLI, commits those files, and
// answers contents requests with `git show <revision>:path` and directory
// listings with `git ls-tree` at that revision — never with hand-constructed
// display state; each listed agent profile's history is its addition by a
// commit of its own (./pathHistoryAnswers.ts). A listing and a history read
// are answered but not observed. A comparison of an accepted publication with
// a shown revision is answered from the repository's own history
// (./comparisonAnswers.ts) and kept in `compares`; one asking for the commits
// between two revisions the ref named is not answered, so every newly named
// revision is read in full. A repository the journey publishes to may be
// followed (`follows`): its `main` is then the published revision as each
// request arrives, as GitHub follows pushes, and any commit of it is readable.

import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest.ts";
import {
  asHeadsListing,
  branchRefAnswer,
  commitAnswer,
  noConnection,
  notFoundAnswer,
  rawFileAnswer,
  type OriginAnswer,
} from "./originAnswers.ts";
import { directoryListingAnswer } from "./listingAnswers.ts";
import { asksContainment, comparisonIn } from "./comparisonAnswers.ts";
import { observe, type ObservedRequest } from "./originObservation.ts";
import { commitAnswerIn, commitListIn } from "./pathHistoryAnswers.ts";
import { committedHistoryAnswers } from "./committedHistoryAnswers.ts";
import { commitOf, listAt, listedAt, showAt } from "./committedOriginRepo.ts";

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
      if (!asksContainment(call.argv)) return noConnection;
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
    // A story branch head: published when the repository has that ref, else
    // GitHub's 404 (established absence). A lost connection here would start
    // project-local transient recovery and block revision checks.
    if (request.kind === "branch") {
      const head = commitOf(repoDir, `refs/heads/${request.branch}`);
      return head === undefined
        ? notFoundAnswer()
        : branchRefAnswer(request.branch, head);
    }
    if (request.kind === "listing" && readable(request.revision)) {
      const overridden = instead.get(request.path);
      if (overridden !== undefined) {
        return overridden;
      }
      const listed = listedAt(repoDir, request.revision, request.path);
      // Absent directory: empty listing, not a temporary connection loss.
      return directoryListingAnswer(request.path, listed ?? []);
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
      return commitListIn(
        profiles(request.revision),
        request.path,
        request.perPage,
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
