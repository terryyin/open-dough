// Stands in for what GitHub publishes, as the local `gh` CLI behind the page's
// dashboard server asks for it (./support/fakeGitHub.ts): a test supplies the
// raw answers GitHub would give for the ref and for the backlog file, and the
// real local read boundary, `gh` invocation, browser reader, shared backlog
// interpretation, and UI do everything after that. Raw-answer construction
// (successful, rate-limited, not-found, connection failure, no login) lives
// in ./originAnswers; this module serves those answers for one or more
// concurrently observed repositories.
//
// `publishOrigin` publishes only the ref and the backlog file, and
// `publishMovingOrigin` also any record files a push names: any other file of
// the repository gets no answer and is not observed, so detail reads fail as
// unavailable. `publishFiles` publishes a
// fixed set of files at one revision; ./committedOrigin.ts publishes whole
// committed revisions. What every origin observes of the calls it answers,
// leaving out revision checks, lives in ./originObservation.ts.

import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest";
import {
  commitAnswer,
  directoryListingAnswer,
  noConnection,
  notFoundAnswer,
  rawFileAnswer,
  type OriginAnswer,
} from "./originAnswers";
import { observe, type ObservedRequest } from "./originObservation";
import type { GhCall } from "./support/fakeGitHub";

export {
  commitAnswer,
  emptyBacklog,
  noConnection,
  notFoundAnswer,
  notLoggedIn,
  rateLimitedAnswer,
  rawFileAnswer,
  type OriginAnswer,
  type RawAnswer,
} from "./originAnswers";
export { pathsRead, type ObservedRequest } from "./originObservation";

// The project this dashboard opens by default. Callers that observe another
// project pass its repository explicitly; this default keeps every existing
// single-project journey unchanged.
export const defaultRepository = "terryyin/open-dough";

const backlogPath = ".planning/PRODUCT-BACKLOG.md";

export type Origin = {
  // What GitHub answers for `commits/main`.
  readonly ref: OriginAnswer;
  // What GitHub answers for the backlog file, and at which revision it is
  // published. A read at any other revision gets no answer and fails.
  readonly backlog?: {
    readonly revision: string;
    readonly answer: OriginAnswer;
  };
  // Holds the ref answer back until the test lets it go.
  readonly refHeldUntil?: Promise<void>;
};

// Which published file a call asks for: "main" for the ref, the revision for
// the backlog file read at it, or undefined for anything else.
function publishedTarget(call: GhCall): string | undefined {
  const { request } = call;
  if (request.kind === "ref" && request.ref === "main") {
    return "main";
  }
  if (request.kind === "content" && request.path === backlogPath) {
    return request.revision;
  }
  return undefined;
}

export function publishOrigin(
  page: Page,
  origin: Origin,
  repository: string = defaultRepository,
): Promise<ObservedRequest[]> {
  const observed: ObservedRequest[] = [];
  const { ref, refHeldUntil, backlog } = origin;
  githubFor(page).serve(repository, async (call) => {
    const target = publishedTarget(call);
    if (target === "main") {
      observe(observed, call);
      await refHeldUntil;
      return ref;
    }
    if (target !== undefined && target === backlog?.revision) {
      observe(observed, call);
      return backlog.answer;
    }
    return noConnection;
  });
  return Promise.resolve(observed);
}

// An origin whose `main` moves while the page is open. A test only pushes
// commits and delays answers, as a network would; what the page then shows is
// never supplied here.
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
  // until the returned restore is called: for "main" the ref request, for a
  // revision the backlog file read at it.
  answerWith(what: string, answer: OriginAnswer): () => void;
};

export function publishMovingOrigin(
  page: Page,
  repository: string = defaultRepository,
): Promise<MovingOrigin> {
  const requests: ObservedRequest[] = [];
  const backlogs = new Map<string, string>();
  const records = new Map<string, Readonly<Record<string, string>>>();
  const held = new Map<string, Promise<void>>();
  const instead = new Map<string, OriginAnswer>();
  let main: string | undefined;

  githubFor(page).serve(repository, async (call) => {
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
    }
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
    return answer;
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

// A repository whose `main` names one revision at which these files are
// published: every contents read at that revision is observed and answered
// with the file's bytes, or not-found for any other path, and a directory
// listing with the published files directly in that directory.
export function publishFiles(
  page: Page,
  published: {
    readonly repository: string;
    readonly revision: string;
    readonly files: Readonly<Record<string, string>>;
  },
): Promise<ObservedRequest[]> {
  const observed: ObservedRequest[] = [];
  const { repository, revision, files } = published;
  githubFor(page).serve(repository, (call) => {
    const { request } = call;
    if (request.kind === "ref" && request.ref === "main") {
      observe(observed, call);
      return Promise.resolve(commitAnswer(revision));
    }
    if (request.kind === "listing" && request.revision === revision) {
      observe(observed, call);
      return Promise.resolve(
        directoryListingAnswer(request.path, Object.keys(files)),
      );
    }
    if (request.kind !== "content" || request.revision !== revision) {
      return Promise.resolve(noConnection);
    }
    observe(observed, call);
    const body = Object.hasOwn(files, request.path)
      ? files[request.path]
      : undefined;
    return Promise.resolve(
      body === undefined ? notFoundAnswer() : rawFileAnswer(body),
    );
  });
  return Promise.resolve(observed);
}
