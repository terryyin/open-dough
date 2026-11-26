// Serves one isolated Git origin's committed files, listings and containment
// comparisons behind the Dashboard's `gh` boundary. With `follows`, answers
// track the configured branch as pushes arrive and allow committed reads.

import type { Page } from "@playwright/test";
import type { FakeGitHub } from "./support/fakeGitHub.ts";
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
import { directoryListingAnswer, treeListingAnswer } from "./listingAnswers.ts";
import { asksContainment, comparisonIn } from "./comparisonAnswers.ts";
import { observe, type ObservedRequest } from "./originObservation.ts";
import { committedHistoryAnswers } from "./committedHistoryAnswers.ts";
import {
  commitOf,
  filesUnder,
  headsOf,
  listedAt,
  publishBranch,
  showAt,
} from "./committedOriginRepo.ts";
import { answerCommittedCommits } from "./committedOriginCommits.ts";
import {
  passingActionsAnswer,
  targetHistoryAnswer,
} from "./support/baseCiActions.ts";
import { routeOriginThroughServedHomes } from "./support/fixtureOriginRoute.ts";

export type ActionsAnswerer = (
  argv: readonly string[],
) => OriginAnswer | undefined;

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
  // Overrides the default passing Actions answer until restore.
  serveActions(answerer: ActionsAnswerer): () => void;
  advanceTo(revision: string): void;
};

export function publishCommittedOrigin(
  pageOrGitHub: Page | FakeGitHub,
  options: {
    readonly repoDir: string;
    readonly revision: string;
    readonly repository: string;
    readonly follows?: boolean;
    readonly branch?: string;
    // Read actual allocation history instead of the default one-addition
    // history supplied for each listed agent profile.
    readonly realHistory?: boolean;
  },
): Promise<CommittedOrigin> {
  const github =
    "serve" in pageOrGitHub ? pageOrGitHub : githubFor(pageOrGitHub);
  const { repoDir, repository, branch = "main" } = options;
  let revision = options.revision;
  const follows = options.follows === true;
  // The revision `main` names now.
  const published = () =>
    follows ? (commitOf(repoDir, branch) ?? revision) : revision;
  // Whether a pinned read of `at` is answered.
  const readable = (at: string) =>
    follows ? commitOf(repoDir, at) === at : at === revision;
  const requests: ObservedRequest[] = [];
  const compares: string[] = [];
  const held = new Map<string, Promise<void>>();
  const instead = new Map<string, OriginAnswer>();
  let actionsOverride: ActionsAnswerer | undefined;
  const history = committedHistoryAnswers(repoDir);
  if (!follows) publishBranch(repoDir, branch, revision);

  routeOriginThroughServedHomes(github, repoDir, repository);
  github.serve(repository, async (call) => {
    const { request, argv } = call;
    if (
      request.kind === "actions-workflow" ||
      request.kind === "actions-runs" ||
      request.kind === "actions-run-attempt" ||
      request.kind === "actions-attempt-jobs" ||
      request.kind === "actions-run-artifacts" ||
      request.kind === "actions-artifact-zip"
    ) {
      const actionsAnswer = actionsOverride?.(argv);
      if (actionsAnswer !== undefined) return actionsAnswer;
      if (request.kind === "actions-attempt-jobs") return notFoundAnswer();
      if (
        request.kind === "actions-run-attempt" ||
        request.kind === "actions-run-artifacts" ||
        request.kind === "actions-artifact-zip"
      ) {
        return noConnection;
      }
      return passingActionsAnswer(request.kind, published());
    }
    if (request.kind === "repository" && options.branch !== undefined)
      return {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ default_branch: branch }),
      };
    if (request.kind === "ref" && request.ref === branch) {
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
      // Honor answerWith("main") tip/error overrides (readiness/session
      // journeys), while still listing other published heads so a Taken
      // story-branch tip advance is visible through matching-refs.
      return asHeadsListing(
        instead.get("main") ?? commitAnswer(published()),
        headsOf(repoDir, branch, published()),
      );
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
      if (overridden !== undefined) return overridden;
      const listed = listedAt(repoDir, request.revision, request.path);
      // Absent directory: empty listing, not a temporary connection loss.
      return directoryListingAnswer(request.path, listed ?? []);
    }
    // Intent's recursive location listing, from the files committed under it.
    if (request.kind === "tree" && readable(request.revision)) {
      return treeListingAnswer(
        request.path,
        filesUnder(repoDir, request.revision, request.path) ?? {},
      );
    }
    if (request.kind === "commit-list" || request.kind === "commit") {
      const answered = answerCommittedCommits({
        request,
        repoDir,
        published,
        readable,
        realHistory: options.realHistory === true,
        history,
        targetHistoryAnswer,
      });
      if (answered !== undefined) return answered;
    }
    // Only the currently published revision is readable, or, followed, any
    // commit; any other gets no answer and is not observed.
    if (request.kind !== "content" || !readable(request.revision)) {
      return noConnection;
    }
    observe(requests, call);
    await held.get(request.path);
    const overridden = instead.get(request.path);
    if (overridden !== undefined) return overridden;
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
    serveActions(answerer) {
      actionsOverride = answerer;
      return () => {
        actionsOverride = undefined;
      };
    },
    advanceTo(next) {
      revision = next;
      if (!follows) publishBranch(repoDir, branch, next);
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
