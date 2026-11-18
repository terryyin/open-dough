// The files a `makeMe.aRepository` description publishes at each named
// revision, served by the fake GitHub (./publishedFiles.ts) as the Git
// materializer would commit them: one renderer writes both
// (../../Distribution/tests/support/repository-revision-files.mjs). The description states
// the facts; the revision SHAs stay the harness's own.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type {
  RepositoryDescription,
  RevisionFacts,
} from "../../Distribution/tests/support/repositoryTestData.mjs";
import { renderPublishedRevisions } from "../../Distribution/tests/support/repository-revision-files.mjs";
import type { PublishedRevision } from "./publishedFiles.ts";
import { backlogPath } from "./publishedOriginBasics.ts";

// One published revision per named revision, at the SHA given for that name,
// each inheriting its first parent's files and applying its declared facts.
export function describedRevisions<Name extends string>(
  description: RepositoryDescription<Name>,
  shas: Readonly<Record<Name, string>>,
): Record<Name, PublishedRevision> {
  const rendered = renderPublishedRevisions(description);
  return Object.fromEntries(
    description.revisions.map(({ name }) => [
      name,
      {
        revision: shas[name],
        files: Object.fromEntries(
          Object.entries(rendered[name]).map(([path, content]) => [
            path,
            content.toString(),
          ]),
        ),
      },
    ]),
  ) as Record<Name, PublishedRevision>;
}

// The name of a description's one revision.
function onlyRevision<Name extends string>(
  description: RepositoryDescription<Name>,
): Name {
  const [only, ...later] = description.revisions;
  if (later.length > 0)
    throw new Error("A described revision needs a one-revision description.");
  return only.name;
}

// The published revision, at `sha`, of a description with one revision.
export function describedRevision<Name extends string>(
  description: RepositoryDescription<Name>,
  sha: string,
): PublishedRevision {
  const name = onlyRevision(description);
  return describedRevisions(description, { [name]: sha } as Record<
    Name,
    string
  >)[name];
}

// The files one revision stating `facts` publishes, for a harness that serves
// files alone. Its backlog is the description's own: an empty one unless
// `facts` state theirs, or `backlog: null` for none.
export function describedFiles(facts: RevisionFacts): Record<string, string> {
  return describedRevision(
    makeMe.aRepository.withRevision("published", facts).please(),
    "",
  ).files;
}

// The backlog text a description with one revision publishes, for a journey
// that serves the backlog alone.
export function describedBacklog<Name extends string>(
  description: RepositoryDescription<Name>,
): string {
  const backlog =
    renderPublishedRevisions(description)[onlyRevision(description)][
      backlogPath
    ];
  if (backlog === undefined)
    throw new Error(`The described revision publishes no ${backlogPath}`);
  return backlog.toString();
}

// A published revision's backlog apart from its other files, for a harness
// that answers the backlog for any path it does not publish
// (./support/publishedRepository.ts).
export function backlogApart(at: PublishedRevision): {
  revision: string;
  backlog: string;
  files: Record<string, string>;
} {
  return {
    revision: at.revision,
    backlog: publishedFile(at, backlogPath),
    files: Object.fromEntries(
      Object.entries(at.files).filter(([path]) => path !== backlogPath),
    ),
  };
}

// A published revision that keeps its backlog among its files and also
// answers it for any path it does not publish
// (./support/publishedRepository.ts).
export function withBacklogFallback(
  at: PublishedRevision,
): PublishedRevision & { backlog: string } {
  return { ...at, backlog: publishedFile(at, backlogPath) };
}

// The text `at` publishes at `path`; a fixture that publishes none is wrong.
export function publishedFile(at: PublishedRevision, path: string): string {
  const content = at.files[path];
  if (content === undefined)
    throw new Error(`${at.revision} publishes no ${path}`);
  return content;
}
