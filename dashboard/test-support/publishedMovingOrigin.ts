// An origin whose `main` moves while the page is open. A test only pushes
// commits and delays answers, as a network would; what the page then shows is
// never supplied here. Static ref+backlog publishing lives in
// ./publishedOrigin.ts; both share default passing base-CI answers.

import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest.ts";
import {
  asHeadsListing,
  commitAnswer,
  noConnection,
  notFoundAnswer,
  rawFileAnswer,
  type OriginAnswer,
} from "./originAnswers.ts";
import { directoryListingAnswer, listedFiles } from "./listingAnswers.ts";
import { observe, type ObservedRequest } from "./originObservation.ts";
import {
  backlogPath,
  defaultRepository,
  publishedTarget,
} from "./publishedOriginBasics.ts";
import { defaultPassingBaseCi } from "./support/baseCiActions.ts";
import type { FakeGitHub } from "./support/fakeGitHub.ts";

export type MovingOrigin = {
  readonly requests: ObservedRequest[];
  // Pushes a commit: `main` names it from now on, and the backlog (and any
  // record files given by repository path) stay readable at it, as at every
  // commit pushed before.
  push(
    revision: string,
    backlog: string,
    files?: Readonly<Record<string, string>>,
  ): void;
  // Holds back answers from now on until the returned release is called: for
  // "main" the ref answer, for a revision the backlog file read at it, and for
  // a record file's repository path its reads at any revision. A held answer
  // was decided when its request arrived, not when it is released.
  hold(what: string): () => void;
  // Answers from now on with this raw answer instead of the published one,
  // until the returned restore is called: for "main" the ref request and the
  // check listing it, for a
  // revision the backlog file read at it.
  answerWith(what: string, answer: OriginAnswer): () => void;
};

// Published to the page's dashboard, or to a fake GitHub a pageless test
// gives its servers.
export function publishMovingOrigin(
  page: Page | FakeGitHub,
  repository: string = defaultRepository,
): Promise<MovingOrigin> {
  const requests: ObservedRequest[] = [];
  const backlogs = new Map<string, string>();
  const records = new Map<string, Readonly<Record<string, string>>>();
  const held = new Map<string, Promise<void>>();
  const instead = new Map<string, OriginAnswer>();
  let main: string | undefined;

  const github = "serve" in page ? page : githubFor(page);
  github.serve(repository, async (call) => {
    const target = publishedTarget(call);
    const { request } = call;
    if (target === undefined && request.kind === "content") {
      const files = records.get(request.revision);
      const body =
        files !== undefined && Object.hasOwn(files, request.path)
          ? files[request.path]
          : undefined;
      if (body !== undefined) {
        observe(requests, call);
        await held.get(request.path);
        return rawFileAnswer(body);
      }
      // Published at this revision with no such file: a missing record, not a
      // temporary connection loss (those use answerWith / hold). Leave it
      // unobserved so membership request accounting stays ref+backlog.
      return notFoundAnswer();
    }
    if (request.kind === "listing") {
      const files = records.get(request.revision);
      return files === undefined
        ? noConnection
        : directoryListingAnswer(
            request.path,
            listedFiles({
              [backlogPath]: backlogs.get(request.revision) ?? "",
              ...files,
            }),
          );
    }
    // Default passing Actions / head history so execution starts are not
    // asked about base CI unless a journey overrides (SEED-210).
    const passingBase = defaultPassingBaseCi(request, main);
    if (passingBase !== undefined) return passingBase;
    if (target === undefined) {
      return noConnection;
    }
    observe(requests, call);
    let answer: OriginAnswer;
    if (target === "main") {
      answer =
        instead.get("main") ??
        (main === undefined ? notFoundAnswer() : commitAnswer(main));
    } else {
      const backlog = backlogs.get(target);
      answer =
        instead.get(target) ??
        (backlog === undefined ? notFoundAnswer() : rawFileAnswer(backlog));
    }
    await held.get(target);
    return request.kind === "matching-refs" ? asHeadsListing(answer) : answer;
  });

  return Promise.resolve({
    requests,
    push(revision, backlog, files = {}) {
      backlogs.set(revision, backlog);
      records.set(revision, files);
      main = revision;
    },
    answerWith(what, answer) {
      instead.set(what, answer);
      return () => {
        instead.delete(what);
      };
    },
    hold(what) {
      let release: () => void = () => undefined;
      held.set(
        what,
        new Promise<void>((resolve) => {
          release = resolve;
        }),
      );
      return () => {
        held.delete(what);
        release();
      };
    },
  });
}
