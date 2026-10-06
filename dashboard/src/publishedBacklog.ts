// Projects the shared backlog reader's meaning into pinned dashboard facts.
// Membership, direction, and source links are established together before any
// preparation, profile, or done-record reads can enrich the observation.

import { z } from "zod";
import { directionOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-direction.mjs";
import {
  parseBacklog,
  queueHeading,
  takenHeading,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import type { PublishedWork, WorkEntry } from "./publishedWork.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { ReadProblem } from "./readProblem.ts";
import { resolveSourceLink } from "./sourceLink.ts";

// The shared reader is untyped JavaScript, so its result is checked here for
// the fields this dashboard shows rather than trusted by assertion.
const interpretedBacklog = z.object({
  entries: z.array(
    z.object({
      identity: z.string().min(1),
      title: z.string().min(1),
      list: z.enum([takenHeading, queueHeading]),
      href: z.string().min(1),
      plan: z.object({ target: z.string().min(1) }).optional(),
    }),
  ),
});
const interpretedDirection = z.string();

export function interpretPublishedBacklog(
  markdown: string,
  revision: string,
  source: PublishedSource,
): Pick<PublishedWork, "direction" | "taken" | "backlog"> {
  let document: unknown;
  let direction: unknown;
  try {
    document = parseBacklog(markdown);
    direction = directionOf(document);
  } catch (error) {
    // The reader's refusal is quoted whole as the reader's own report: some
    // of it is advice to the tools that change a backlog, and choosing which
    // of its words to pass on would be interpreting it here.
    const reported = error instanceof Error ? error.message : String(error);
    throw new ReadProblem(
      `The published backlog could not be interpreted. The shared backlog reader reports: “${reported}” This dashboard only reads; the project’s backlog needs correcting at its source.`,
    );
  }
  const backlog = interpretedBacklog.safeParse(document);
  const recorded = interpretedDirection.safeParse(direction);
  if (!backlog.success || !recorded.success) {
    throw new ReadProblem(
      "The shared backlog reader answered in a shape this dashboard does not understand.",
    );
  }
  const entriesIn = (list: string): WorkEntry[] =>
    backlog.data.entries
      .filter((entry) => entry.list === list)
      .map(({ identity, title, href, plan }) => ({
        identity,
        title,
        canonical: resolveSourceLink(href, source, revision),
        ...(plan && {
          plan: resolveSourceLink(plan.target, source, revision),
        }),
        preparation: { status: "loading" as const },
        purpose: { status: "loading" as const },
        planSlices: { status: "loading" as const },
      }));
  return {
    direction: recorded.data,
    taken: entriesIn(takenHeading),
    backlog: entriesIn(queueHeading),
  };
}
