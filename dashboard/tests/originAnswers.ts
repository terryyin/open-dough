// The raw answers a GitHub-shaped origin gives for a ref or a backlog file,
// and the fixtures built from them. Kept apart from route wiring in
// ./githubOrigin so a test can compose an answer without depending on how it
// is served or to which repository.

export type RawAnswer = {
  readonly status: number;
  readonly contentType: string;
  readonly body: string;
};

// The connection fails before any HTTP answer arrives.
export const noConnection = { connection: "connectionfailed" } as const;

export type OriginAnswer = RawAnswer | typeof noConnection;

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

// The backlog file origin publishes when nothing is recorded: both groups,
// no entries, and no direction.
export const emptyBacklog = `# Product backlog

## Taken

## Backlog list
`;

export function rateLimitedAnswer(status: 403 | 429 = 403): RawAnswer {
  return {
    status,
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
