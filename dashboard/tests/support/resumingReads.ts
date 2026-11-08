// Shared support for ../../backend-tests/observation/authenticated-read-resumption.spec.ts and
// ../../backend-tests/observation/authenticated-read-wait-in-turn.spec.ts: a published revision whose
// backlog names ten seeds, so each seed is a different read, and the
// boundary read a test sends for one of them.

import { publishes, type RepositoryAnswerer } from "./fakeGitHub.ts";
import type { GhRequest } from "./ghRequest.ts";
import { answeringFirst } from "./heldGitHubAnswer.ts";
import type { OriginAnswer } from "../originAnswers.ts";
import { backlogApart, describedRevision } from "../describedRevisions.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

export const revision = "5e".repeat(20);

export const seedPaths = Array.from(
  Array(10).keys(),
  (index) => `.planning/seeds/SEED-resume-${String(index + 1)}.md`,
);
// Each seed queued as "Resume N", with a heading of its own path.
export const published = publishes(
  backlogApart(
    describedRevision(
      makeMe.aRepository
        .withRevision("published", {
          backlog: {
            queued: seedPaths.map((path, index) =>
              makeMe.aBacklogEntry
                .with({
                  identity: `SEED-resume-${String(index + 1)}#resume`,
                  title: `Resume ${String(index + 1)}`,
                  href: `${path.replace(".planning/", "")}#resume`,
                })
                .please(),
            ),
          },
          files: Object.fromEntries(
            seedPaths.map((path) => [path, `# ${path}\n`]),
          ),
        })
        .please(),
      revision,
    ),
  ),
);
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
