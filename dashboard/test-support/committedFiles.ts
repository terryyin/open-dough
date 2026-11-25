// Fixed files published as one real commit: the commit's revision answers the
// local `gh` as ./publishedFiles.ts serves files, and Git under every
// dashboard HOME the page's fake GitHub serves reaches the commit's origin
// (./support/fixtureOriginRoute.ts).

import type { Page } from "@playwright/test";
import { materializeRepository } from "../../Distribution/tests/support/repository-fixture.mjs";
import type { RepositoryDescription } from "../../Distribution/tests/support/repositoryTestData.mjs";
import { publishBranch } from "./committedOriginRepo.ts";
import { githubFor } from "./dashboardTest.ts";
import { describedRevisions } from "./describedRevisions.ts";
import type { ObservedRequest } from "./originObservation.ts";
import {
  publishMovingFiles,
  type MovingFiles,
  type PublishedFiles,
  type PublishedRevision,
} from "./publishedFiles.ts";
import type { RepositoryAnswerer } from "./support/fakeGitHub.ts";
import {
  expectServedHomesReach,
  routeServedHomesToPublication,
} from "./support/fixtureOriginRoute.ts";
import { commitPublishedOrigin } from "./support/publishedOrigin.ts";
import {
  keepingOrigin,
  type PublishedOriginAnswerer,
} from "./support/publishedRepository.ts";

type HistoryOptions<Name extends string> = {
  readonly repository: string;
  readonly trunk: Name;
  readonly branches?: Readonly<Record<string, Name>>;
  readonly afterGitHubStops: (cleanup: () => Promise<void>) => void;
  readonly details?: (
    shas: Readonly<Record<Name, string>>,
  ) => Partial<Record<Name, Omit<PublishedRevision, "revision" | "files">>>;
};

// The same real history supplies the published refs and the REST file pins.
// Comparisons and path details retain the controls of the file publisher.
export async function publishCommittedFileHistory<Name extends string>(
  page: Page,
  description: RepositoryDescription<Name>,
  {
    repository,
    trunk,
    branches = {},
    details,
    afterGitHubStops,
  }: HistoryOptions<Name>,
) {
  const ref = description.trunkBranch ?? "main";
  const { origin, revisions, cleanup } =
    await materializeRepository(description);
  afterGitHubStops(cleanup);
  const published = describedRevisions(description, revisions);
  const detailByName = details?.(revisions);
  for (const { name } of description.revisions)
    published[name] = { ...published[name], ...detailByName?.[name] };
  const at = (name: Name): PublishedRevision => published[name];
  publishBranch(origin, ref, revisions[trunk]);
  for (const [branch, name] of Object.entries(branches))
    publishBranch(origin, branch, revisions[name]);
  const moving = publishMovingFiles(
    page,
    {
      ...published[trunk],
      repository,
      ref,
      branches: Object.fromEntries(
        Object.entries(branches).map(([branch, name]) => [
          branch,
          published[name],
        ]),
      ),
    },
    { origin, revision: revisions[trunk] },
  );
  routeServedHomesToPublication(githubFor(page), repository);
  return {
    ...moving,
    revisions,
    published,
    at,
    moveTrunk(...args: Parameters<MovingFiles["moveTrunk"]>) {
      publishBranch(origin, ref, args[0].revision);
      moving.moveTrunk(...args);
    },
    moveBranch(branch: string, at: PublishedRevision | undefined) {
      publishBranch(origin, branch, at?.revision);
      moving.moveBranch(branch, at);
    },
  };
}

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
  const github = githubFor(page);
  routeServedHomesToPublication(github, repository);
  expectServedHomesReach(github, repository, revision, ref);
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
  routeServedHomesToPublication(github, repository);
  expectServedHomesReach(github, repository, published.revision);
  return published.revision;
}
