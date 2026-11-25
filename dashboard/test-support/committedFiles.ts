// Fixed files published as one real commit: the commit's revision answers the
// local `gh` as ./publishedFiles.ts serves files, and Git under every
// dashboard HOME the page's fake GitHub serves reaches the commit's origin
// (./support/fixtureOriginRoute.ts).

import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest.ts";
import type { ObservedRequest } from "./originObservation.ts";
import { publishMovingFiles, type PublishedFiles } from "./publishedFiles.ts";
import type { RepositoryAnswerer } from "./support/fakeGitHub.ts";
import { expectServedHomesReach } from "./support/fixtureOriginRoute.ts";
import { commitPublishedOrigin } from "./support/publishedOrigin.ts";
import {
  keepingOrigin,
  type PublishedOriginAnswerer,
} from "./support/publishedRepository.ts";

// Commits `published.files` alone (no backlog unless they hold one) as the
// configured ref's one commit and serves them at its revision, beside any
// branches, returned with the observed requests; fails unless Git under each
// served HOME finds that revision.
export function publishCommittedFiles(
  page: Page,
  published: Omit<PublishedFiles, "revision">,
): { readonly requests: ObservedRequest[]; readonly revision: string } {
  const { repository, ref = "main" } = published;
  const committedTo = commitPublishedOrigin({
    branch: ref,
    backlog: null,
    files: published.files,
  });
  const { revision } = committedTo;
  const { requests } = publishMovingFiles(
    page,
    { ...published, revision },
    committedTo,
  );
  expectServedHomesReach(githubFor(page), repository, revision, ref);
  return { requests, revision };
}

// Serves `repository` from `published`'s real commit, each call answered by
// `answer` (which may defer to `published`); fails unless Git under each
// served HOME finds that commit's revision, which it returns.
export function serveCommitted(
  page: Page,
  repository: string,
  published: PublishedOriginAnswerer,
  answer: RepositoryAnswerer,
): string {
  const github = githubFor(page);
  github.serve(repository, keepingOrigin(answer, published));
  expectServedHomesReach(github, repository, published.revision);
  return published.revision;
}
