// Serves one isolated Git repository's committed bytes at the GitHub HTTP
// boundary. The journey records preparation through the real CLI, commits those
// files, and answers contents requests with `git show <revision>:path` — never
// with hand-constructed display state.

import { execFileSync } from "node:child_process";
import type { Page, Route } from "@playwright/test";
import { commitAnswer, type ObservedRequest } from "./githubOrigin";
import { rawFileAnswer } from "./originAnswers";

const cors = { "access-control-allow-origin": "*" };

const closedHosts = new WeakSet<Page>();

async function closeOtherHosts(page: Page) {
  if (closedHosts.has(page)) {
    return;
  }
  closedHosts.add(page);
  await page.route(/^https?:\/\/(?!localhost[:/])/, (route) => route.abort());
}

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

export type CommittedOrigin = {
  readonly requests: ObservedRequest[];
  readonly revision: string;
  readonly repository: string;
  readonly repoDir: string;
  hold(repositoryPath: string): () => void;
};

export async function publishCommittedOrigin(
  page: Page,
  options: {
    readonly repoDir: string;
    readonly revision: string;
    readonly repository: string;
  },
): Promise<CommittedOrigin> {
  const { repoDir, revision, repository } = options;
  const requests: ObservedRequest[] = [];
  const held = new Map<string, Promise<void>>();
  const repositoryApi = `https://api.github.com/repos/${repository}`;
  const mainRefApi = `${repositoryApi}/commits/main`;
  const contentsPrefix = `${repositoryApi}/contents/`;

  await closeOtherHosts(page);
  await page.route(mainRefApi, async (route: Route) => {
    requests.push({
      url: route.request().url(),
      headers: await route.request().allHeaders(),
    });
    const answer = commitAnswer(revision);
    await route.fulfill({
      status: answer.status,
      contentType: answer.contentType,
      headers: cors,
      body: answer.body,
    });
  });
  await page.route(
    (url) =>
      url.href.startsWith(contentsPrefix) &&
      url.searchParams.get("ref") === revision,
    async (route: Route) => {
      requests.push({
        url: route.request().url(),
        headers: await route.request().allHeaders(),
      });
      const url = new URL(route.request().url());
      const encoded = url.pathname.slice(
        `/repos/${repository}/contents/`.length,
      );
      const repositoryPath = decodeURIComponent(encoded);
      await held.get(repositoryPath);
      const body = showAt(repoDir, revision, repositoryPath);
      if (body === undefined) {
        await route.fulfill({
          status: 404,
          contentType: "application/json; charset=utf-8",
          headers: cors,
          body: JSON.stringify({ message: "Not Found", status: "404" }),
        });
        return;
      }
      const answer = rawFileAnswer(body);
      await route.fulfill({
        status: answer.status,
        contentType: answer.contentType,
        headers: cors,
        body: answer.body,
      });
    },
  );

  return {
    requests,
    revision,
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
  };
}

export function contentPathsRead(origin: CommittedOrigin): string[] {
  return origin.requests.map((request) => {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/commits/main")) {
      return "main";
    }
    const encoded = url.pathname.slice(
      `/repos/${origin.repository}/contents/`.length,
    );
    return `${decodeURIComponent(encoded)}?ref=${url.searchParams.get("ref") ?? ""}`;
  });
}
