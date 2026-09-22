// Reads published Git state from GitHub's public REST API, without
// credentials: a ref is resolved to one commit, and content is then read at
// that commit so a moving ref can never mix two revisions into one view.

import { z } from "zod";
import type { PublishedSource } from "./publishedSource";
import { ReadProblem } from "./readProblem";

const api = "https://api.github.com";

// Only the field this dashboard uses; other GitHub fields may come and go.
const commitResponse = z.object({
  sha: z.string().regex(/^[0-9a-f]{40}$/),
});

async function get(
  url: string,
  accept: string,
  reading: string,
  signal: AbortSignal,
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: accept }, signal });
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }
    throw new ReadProblem(
      `GitHub could not be reached while reading ${reading}.`,
    );
  }
  if (!response.ok) {
    throw new ReadProblem(
      `GitHub answered HTTP ${response.status} while reading ${reading}.`,
    );
  }
  return response;
}

export async function resolveRevision(
  source: PublishedSource,
  signal: AbortSignal,
): Promise<string> {
  const reading = `${source.ref} of ${source.repository}`;
  const response = await get(
    `${api}/repos/${source.repository}/commits/${encodeURIComponent(source.ref)}`,
    "application/vnd.github+json",
    reading,
    signal,
  );
  const body: unknown = await response.json().catch(() => undefined);
  const commit = commitResponse.safeParse(body);
  if (!commit.success) {
    throw new ReadProblem(
      `GitHub's answer for ${reading} did not name a commit.`,
    );
  }
  return commit.data.sha;
}

export async function readRepositoryFileAt(
  source: PublishedSource,
  repositoryPath: string,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  const path = repositoryPath.split("/").map(encodeURIComponent).join("/");
  const response = await get(
    `${api}/repos/${source.repository}/contents/${path}?ref=${revision}`,
    "application/vnd.github.raw+json",
    `${repositoryPath} at ${revision}`,
    signal,
  );
  return response.text();
}

export async function readBacklogAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  return readRepositoryFileAt(source, source.backlogPath, revision, signal);
}
