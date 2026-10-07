// Shared support for ../authenticated-read-resumption.spec.ts and
// ../authenticated-read-wait-in-turn.spec.ts: a published revision whose
// backlog names ten seeds, so each seed is a different read, and the
// boundary read a test sends for one of them.

import { publishes, type RepositoryAnswerer } from "./fakeGitHub.ts";
import type { GhRequest } from "./ghRequest.ts";
import { answeringFirst } from "./heldGitHubAnswer.ts";
import type { OriginAnswer } from "../originAnswers.ts";

export const revision = "5e".repeat(20);

export const seedPaths = Array.from(
  Array(10).keys(),
  (index) => `.planning/seeds/SEED-resume-${String(index + 1)}.md`,
);
const backlog = `# Product backlog

## Taken

## Backlog list

${seedPaths
  .map((path, index) => {
    const identity = `SEED-resume-${String(index + 1)}#resume`;
    return `- [Resume ${String(index + 1)}](${path.replace(".planning/", "")}#resume) — ${identity}`;
  })
  .join("\n")}
`;
export const published = publishes({
  revision,
  backlog,
  files: Object.fromEntries(seedPaths.map((path) => [path, `# ${path}\n`])),
});
export const seedRead = (path: string) =>
  `&revision=${revision}&path=${encodeURIComponent(path)}`;
export const asked = (paths: readonly string[]) =>
  paths.map((path) => `content ${path}@${revision}`);
export const isSeed = (request: GhRequest) =>
  request.kind === "content" && seedPaths.includes(request.path);

// Answers the first seed read with `refusal`, and every other read as
// `answerer` does.
export const refusingFirst = (
  answerer: RepositoryAnswerer,
  refusal: OriginAnswer,
) => answeringFirst(answerer, isSeed, refusal);
