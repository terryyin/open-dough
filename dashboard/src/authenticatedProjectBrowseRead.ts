// The whole project's published files at a pinned revision, read through the
// local authenticated boundary (`../server/projectBrowseRead.ts`):
// `intent=project-tree` lists every tracked path, and `intent=project-file`
// reads one tracked path's literal text. An answer is external input, checked
// here, and an answer for another revision or path is refused.

import { z } from "zod";
import {
  authenticatedGet,
  commitSha,
  unexpectedAnswer,
} from "./authenticatedGet.ts";
import {
  readingPathAt,
  readingTrackedFilesAt,
} from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { ReadProblem } from "./readProblem.ts";

const tree = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("inventory"),
    revision: commitSha,
    paths: z.array(z.string().min(1)),
  }),
  z.object({
    kind: z.literal("unavailable"),
    revision: commitSha,
    explanation: z.string(),
  }),
]);
// One tracked path's answer: absent, its text, or why it is unavailable.
const fileAt = { revision: commitSha, path: z.string().min(1) };
const file = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("absent"), ...fileAt }),
  z.object({ kind: z.literal("text"), text: z.string(), ...fileAt }),
  z.object({
    kind: z.literal("unavailable"),
    explanation: z.string(),
    ...fileAt,
  }),
]);

function query(source: PublishedSource, read: string, revision: string) {
  return `source=${encodeURIComponent(source.id)}&intent=${read}&revision=${encodeURIComponent(revision)}`;
}

export async function readProjectTreeAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<readonly string[]> {
  const reading = readingTrackedFilesAt(source.repository, revision);
  const parsed = tree.safeParse(
    await authenticatedGet(
      query(source, "project-tree", revision),
      reading,
      signal,
    ),
  );
  if (!parsed.success || parsed.data.revision !== revision) {
    throw unexpectedAnswer(reading);
  }
  if (parsed.data.kind === "unavailable") {
    throw new ReadProblem(parsed.data.explanation);
  }
  return parsed.data.paths;
}

export async function readProjectFileAt(
  source: PublishedSource,
  repositoryPath: string,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  const reading = readingPathAt(repositoryPath, revision);
  const parsed = file.safeParse(
    await authenticatedGet(
      `${query(source, "project-file", revision)}&path=${encodeURIComponent(repositoryPath)}`,
      reading,
      signal,
    ),
  );
  if (
    !parsed.success ||
    parsed.data.revision !== revision ||
    parsed.data.path !== repositoryPath
  ) {
    throw unexpectedAnswer(reading);
  }
  switch (parsed.data.kind) {
    case "text":
      return parsed.data.text;
    case "unavailable":
      throw new ReadProblem(parsed.data.explanation);
    case "absent":
      throw new ReadProblem(
        `${repositoryPath} is not a tracked text file at ${revision}.`,
      );
  }
}
