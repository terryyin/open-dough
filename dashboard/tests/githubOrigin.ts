// Stands in for GitHub at the HTTP boundary only: a test supplies the raw
// answers origin would give for the ref and for the backlog file, and the real
// reader, shared backlog interpretation, and UI do everything after that.
// Raw-answer construction (successful, rate-limited, not-found, connection
// failure) lives in ./originAnswers; this module wires those answers to
// routes for one or more concurrently observed repositories.

import type { Page, Route } from "@playwright/test";
import {
  commitAnswer,
  notFoundAnswer,
  rawFileAnswer,
  type OriginAnswer,
} from "./originAnswers";

export {
  commitAnswer,
  emptyBacklog,
  noConnection,
  notFoundAnswer,
  rateLimitedAnswer,
  rawFileAnswer,
  type OriginAnswer,
  type RawAnswer,
} from "./originAnswers";

// The project this dashboard opens by default. Callers that observe another
// project pass its repository explicitly; this default keeps every existing
// single-project journey unchanged.
export const defaultRepository = "terryyin/open-dough";

function apiUrls(repository: string) {
  const repositoryApi = `https://api.github.com/repos/${repository}`;
  return {
    mainRefApi: `${repositoryApi}/commits/main`,
    backlogFileApi: `${repositoryApi}/contents/.planning/PRODUCT-BACKLOG.md`,
  };
}

const cors = { "access-control-allow-origin": "*" };

export type ObservedRequest = {
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
};

export type Origin = {
  // What GitHub answers for `commits/main`.
  readonly ref: OriginAnswer;
  // What GitHub answers for the backlog file, and at which revision it is
  // published. A read at any other revision reaches no route and fails.
  readonly backlog?: {
    readonly revision: string;
    readonly answer: OriginAnswer;
  };
  // Holds the ref answer back until the test lets it go.
  readonly refHeldUntil?: Promise<void>;
};

// One request answered as origin would answer it: observed and decided when
// it arrives, held back if the test asked for that, then sent as the raw
// answer. What is decided on arrival is not reconsidered while it is held.
const answering =
  (
    observed: ObservedRequest[],
    decide: (url: URL) => OriginAnswer,
    heldUntil: (url: URL) => Promise<void> | undefined = () => undefined,
  ) =>
  async (route: Route) => {
    observed.push({
      url: route.request().url(),
      headers: await route.request().allHeaders(),
    });
    const url = new URL(route.request().url());
    const answer = decide(url);
    await heldUntil(url);
    if ("connection" in answer) {
      await route.abort(answer.connection);
      return;
    }
    await route.fulfill({
      status: answer.status,
      contentType: answer.contentType,
      headers: cors,
      body: answer.body,
    });
  };

// Nothing in this suite reaches a real network host. Registered before the
// GitHub routes so those, being more recent, win. A test observing several
// projects publishes more than one origin on the same page; this closes the
// same page only once, so a later repository's specific routes are not
// shadowed by a second catch-all registered after them.
const closedHosts = new WeakSet<Page>();
async function closeOtherHosts(page: Page) {
  if (closedHosts.has(page)) {
    return;
  }
  closedHosts.add(page);
  await page.route(/^https?:\/\/(?!localhost[:/])/, (route) => route.abort());
}

export async function publishOrigin(
  page: Page,
  origin: Origin,
  repository: string = defaultRepository,
): Promise<ObservedRequest[]> {
  const observed: ObservedRequest[] = [];
  const { ref, refHeldUntil, backlog } = origin;
  const { mainRefApi, backlogFileApi } = apiUrls(repository);

  await closeOtherHosts(page);
  await page.route(
    mainRefApi,
    answering(
      observed,
      () => ref,
      () => refHeldUntil,
    ),
  );
  if (backlog) {
    await page.route(
      `${backlogFileApi}?ref=${backlog.revision}`,
      answering(observed, () => backlog.answer),
    );
  }
  return observed;
}

// An origin whose `main` moves while the page is open. A test only pushes
// commits and delays answers, as a network would; what the page then shows is
// never supplied here.
export type MovingOrigin = {
  readonly requests: readonly ObservedRequest[];
  // Pushes a commit: `main` names it from now on, and the backlog stays
  // readable at it, as at every commit pushed before.
  push(revision: string, backlog: string): void;
  // Holds back answers from now on until the returned release is called: for
  // "main" the ref answer, for a revision the backlog file read at it. A held
  // answer was decided when its request arrived, not when it is released.
  hold(what: string): () => void;
  // Answers from now on with this raw answer instead of the published one,
  // until the returned restore is called: for "main" the ref request, for a
  // revision the backlog file read at it.
  answerWith(what: string, answer: OriginAnswer): () => void;
};

export async function publishMovingOrigin(
  page: Page,
  repository: string = defaultRepository,
): Promise<MovingOrigin> {
  const requests: ObservedRequest[] = [];
  const backlogs = new Map<string, string>();
  const held = new Map<string, Promise<void>>();
  const instead = new Map<string, OriginAnswer>();
  let main: string | undefined;
  const { mainRefApi, backlogFileApi } = apiUrls(repository);

  const revisionIn = (url: URL) => url.searchParams.get("ref") ?? "";

  await closeOtherHosts(page);
  await page.route(
    mainRefApi,
    answering(
      requests,
      () =>
        instead.get("main") ??
        (main === undefined ? notFoundAnswer() : commitAnswer(main)),
      () => held.get("main"),
    ),
  );
  await page.route(
    (url) => url.href.startsWith(`${backlogFileApi}?`),
    answering(
      requests,
      (url) => {
        const backlog = backlogs.get(revisionIn(url));
        return (
          instead.get(revisionIn(url)) ??
          (backlog === undefined ? notFoundAnswer() : rawFileAnswer(backlog))
        );
      },
      (url) => held.get(revisionIn(url)),
    ),
  );

  return {
    requests,
    push(revision, backlog) {
      backlogs.set(revision, backlog);
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
  };
}

// What origin was asked for, in order: the ref, or the file at a revision.
export function pathsRead(origin: MovingOrigin): string[] {
  return origin.requests.map((request) => {
    const url = new URL(request.url);
    return `${url.pathname.split("/").pop() ?? ""}${url.search}`;
  });
}
