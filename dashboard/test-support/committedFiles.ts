// Fixed files published as one real commit: the commit's revision answers the
// local `gh` as ./publishedFiles.ts serves files, and Git under every
// dashboard HOME the page's fake GitHub serves reaches the commit's origin
// (./support/fixtureOriginRoute.ts).

import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest.ts";
import type { ObservedRequest } from "./originObservation.ts";
import { publishMovingFiles, type PublishedFiles } from "./publishedFiles.ts";
import { expectServedHomesReach } from "./support/fixtureOriginRoute.ts";
import { commitPublishedOrigin } from "./support/publishedOrigin.ts";

// Commits `published.files` as the configured ref's one commit and serves
// them at its revision, returned with the observed requests; fails unless
// Git under each served HOME finds that revision.
export function publishCommittedFiles(
  page: Page,
  published: Omit<PublishedFiles, "revision" | "branches">,
): { readonly requests: ObservedRequest[]; readonly revision: string } {
  const { repository, ref = "main" } = published;
  const committedTo = commitPublishedOrigin({
    branch: ref,
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
