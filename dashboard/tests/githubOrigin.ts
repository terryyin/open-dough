// Stands in for GitHub at the HTTP boundary only: a test supplies the raw
// answers origin would give for the ref and for the backlog file, and the real
// reader, shared backlog interpretation, and UI do everything after that.

import type { Page, Route } from "@playwright/test";

const repositoryApi = "https://api.github.com/repos/terryyin/open-dough";
const mainRefApi = `${repositoryApi}/commits/main`;
const backlogFileApi = `${repositoryApi}/contents/.planning/PRODUCT-BACKLOG.md`;
const cors = { "access-control-allow-origin": "*" };

export type ObservedRequest = {
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
};

type RawAnswer = {
  readonly status: number;
  readonly contentType: string;
  readonly body: string;
};

export type Origin = {
  // What GitHub answers for `commits/main`.
  readonly ref: RawAnswer;
  // What GitHub answers for the backlog file, and at which revision it is
  // published. A read at any other revision reaches no route and fails.
  readonly backlog?: { readonly revision: string; readonly answer: RawAnswer };
  // Holds the ref answer back until the test lets it go.
  readonly refHeldUntil?: Promise<void>;
};

export function commitAnswer(sha: string): RawAnswer {
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify({
      sha,
      node_id: "C_kwDOfixture",
      commit: { message: "Fixture commit", tree: { sha: "0".repeat(40) } },
      parents: [],
    }),
  };
}

export function rawFileAnswer(markdown: string): RawAnswer {
  return {
    status: 200,
    contentType: "application/vnd.github.raw+json; charset=utf-8",
    body: markdown,
  };
}

export function rateLimitedAnswer(): RawAnswer {
  return {
    status: 403,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify({
      message: "API rate limit exceeded for 203.0.113.7.",
      documentation_url:
        "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting",
    }),
  };
}

export function notFoundAnswer(): RawAnswer {
  return {
    status: 404,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify({
      message: "Not Found",
      documentation_url:
        "https://docs.github.com/rest/repos/contents#get-repository-content",
      status: "404",
    }),
  };
}

// One request answered as origin would answer it: observed and decided when
// it arrives, held back if the test asked for that, then sent as the raw
// answer. What is decided on arrival is not reconsidered while it is held.
const answering =
  (
    observed: ObservedRequest[],
    decide: (url: URL) => RawAnswer,
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
    await route.fulfill({
      status: answer.status,
      contentType: answer.contentType,
      headers: cors,
      body: answer.body,
    });
  };

// Nothing in this suite reaches a real network host. Registered before the
// GitHub routes so those, being more recent, win.
async function closeOtherHosts(page: Page) {
  await page.route(/^https?:\/\/(?!localhost[:/])/, (route) => route.abort());
}

export async function publishOrigin(
  page: Page,
  origin: Origin,
): Promise<ObservedRequest[]> {
  const observed: ObservedRequest[] = [];
  const { ref, refHeldUntil, backlog } = origin;

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
};

export async function publishMovingOrigin(page: Page): Promise<MovingOrigin> {
  const requests: ObservedRequest[] = [];
  const backlogs = new Map<string, string>();
  const held = new Map<string, Promise<void>>();
  let main: string | undefined;

  const revisionIn = (url: URL) => url.searchParams.get("ref") ?? "";

  await closeOtherHosts(page);
  await page.route(
    mainRefApi,
    answering(
      requests,
      () => (main === undefined ? notFoundAnswer() : commitAnswer(main)),
      () => held.get("main"),
    ),
  );
  await page.route(
    (url) => url.href.startsWith(`${backlogFileApi}?`),
    answering(
      requests,
      (url) => {
        const backlog = backlogs.get(revisionIn(url));
        return backlog === undefined
          ? notFoundAnswer()
          : rawFileAnswer(backlog);
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
