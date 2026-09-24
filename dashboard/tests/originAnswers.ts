// The raw answers GitHub gives the local `gh` CLI for a ref or a file, and
// the fixtures built from them. Kept apart from the synthetic `gh`'s wiring in
// ./support/fakeGitHub so a test can compose an answer without depending on
// how it is served or to which repository.

export type RawAnswer = {
  readonly status: number;
  readonly contentType: string;
  readonly body: string;
  // The entity tag GitHub gives this answer, when it gives one. A request
  // that sends it back in `If-None-Match` while the answer is unchanged gets
  // `304 Not Modified` instead (./support/fakeGitHub.ts).
  readonly etag?: string;
  // Any further headers GitHub sends with this answer, such as a rate
  // limit's `Retry-After` or `X-RateLimit-Reset`; `gh api --include` prints
  // them before the body.
  readonly headers?: Readonly<Record<string, string>>;
};

// The connection fails before any HTTP answer arrives.
export const noConnection = { connection: "connectionfailed" } as const;

// What `gh` itself does without asking GitHub at all: its exit code and what
// it prints on stderr.
export type CliAnswer = {
  readonly exitCode: number;
  readonly stderr: string;
};

// The launching person's `gh` has no usable login, answered as `gh` answers
// it: exit code 4 and the pointer at `gh auth login`.
export const notLoggedIn: CliAnswer = {
  exitCode: 4,
  stderr:
    "To get started with GitHub CLI, please run:  gh auth login\nAlternatively, populate the GH_TOKEN environment variable with a GitHub API authentication token.\n",
};

export type OriginAnswer = RawAnswer | typeof noConnection | CliAnswer;

// GitHub tags a commit answer by its content, so the tag changes exactly when
// the ref names another commit.
export function commitEtag(sha: string): string {
  return `W/"commit-${sha}"`;
}

export function commitAnswer(sha: string): RawAnswer {
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    etag: commitEtag(sha),
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

// The backlog file origin publishes when nothing is recorded: both groups,
// no entries, and no direction.
export const emptyBacklog = `# Product backlog

## Taken

## Backlog list
`;

// A rate-limited answer, optionally directing when to ask again as GitHub
// does: `Retry-After`, or `X-RateLimit-Reset` with `X-RateLimit-Remaining: 0`.
export function rateLimitedAnswer(
  status: 403 | 429 = 403,
  headers?: Readonly<Record<string, string>>,
): RawAnswer {
  return {
    status,
    ...(headers !== undefined && { headers }),
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

// GitHub's JSON listing of `directory` among the repository's `paths`, or its
// not-found answer when no path lies directly in that directory.
export function directoryListingAnswer(
  directory: string,
  paths: readonly string[],
): RawAnswer {
  const names = paths.flatMap((path) => {
    const name = path.startsWith(`${directory}/`)
      ? path.slice(directory.length + 1)
      : "";
    return name === "" || name.includes("/") ? [] : [name];
  });
  if (names.length === 0) {
    return notFoundAnswer();
  }
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify(
      names.map((name) => ({
        name,
        path: `${directory}/${name}`,
        type: "file",
      })),
    ),
  };
}
