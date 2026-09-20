// Stands in for GitHub at the HTTP boundary only: a test supplies the raw
// answers origin would give for the ref and for the backlog file, and the real
// reader, shared backlog interpretation, and UI do everything after that.

import type { Page, Route } from "@playwright/test";

const repositoryApi = "https://api.github.com/repos/terryyin/open-dough";
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

export async function publishOrigin(
  page: Page,
  origin: Origin,
): Promise<ObservedRequest[]> {
  const observed: ObservedRequest[] = [];
  const answerWith =
    (answer: RawAnswer, heldUntil?: Promise<void>) => async (route: Route) => {
      observed.push({
        url: route.request().url(),
        headers: await route.request().allHeaders(),
      });
      await heldUntil;
      await route.fulfill({
        status: answer.status,
        contentType: answer.contentType,
        headers: cors,
        body: answer.body,
      });
    };

  // Registered first so the specific routes below win: nothing in this suite
  // reaches a real network host.
  await page.route(/^https?:\/\/(?!localhost[:/])/, (route) => route.abort());
  await page.route(
    `${repositoryApi}/commits/main`,
    answerWith(origin.ref, origin.refHeldUntil),
  );
  if (origin.backlog) {
    await page.route(
      `${repositoryApi}/contents/.planning/PRODUCT-BACKLOG.md?ref=${origin.backlog.revision}`,
      answerWith(origin.backlog.answer),
    );
  }
  return observed;
}
