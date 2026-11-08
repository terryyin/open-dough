// The files a `makeMe.aRepository` description publishes at each named
// revision, served by the fake GitHub (./publishedFiles.ts) as the Git
// materializer would commit them: one renderer writes both
// (../../tests/support/repository-revision-files.mjs). The description states
// the facts; the revision SHAs stay the harness's own.

import type { RepositoryDescription } from "../../tests/support/repositoryTestData.mjs";
import { renderPublishedRevisions } from "../../tests/support/repository-revision-files.mjs";
import type { PublishedRevision } from "./publishedFiles.ts";
import { backlogPath } from "./publishedOriginBasics.ts";

// One published revision per named revision, at the SHA given for that name,
// each holding the files of every revision up to it.
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

// The text `at` publishes at `path`; a fixture that publishes none is wrong.
export function publishedFile(at: PublishedRevision, path: string): string {
  const content = at.files[path];
  if (content === undefined)
    throw new Error(`${at.revision} publishes no ${path}`);
  return content;
}
