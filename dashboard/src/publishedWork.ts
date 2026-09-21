// The snapshot the dashboard shows: what one published backlog revision says,
// and the evidence of where and when it was read. What a backlog means stays
// with the shared backlog reader; nothing here parses Markdown.

import { z } from "zod";
import { directionOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-direction.mjs";
import {
  parseBacklog,
  queueHeading,
  takenHeading,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import { readBacklogAt, resolveRevision } from "./githubSource";
import type { PublishedSource } from "./publishedSource";
import { ReadProblem } from "./readProblem";
import { resolveSourceLink, type SourceLink } from "./sourceLink";

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

export type WorkEntry = {
  readonly identity: string;
  readonly title: string;
  // Where the entry's recorded links lead at this snapshot's revision. An
  // entry records one canonical link and may record the plan it is taken with.
  readonly canonical: SourceLink;
  readonly plan?: SourceLink;
};

export type PublishedWork = {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly retrievedAt: Date;
  // "" when the backlog records no near-future direction.
  readonly direction: string;
  readonly taken: readonly WorkEntry[];
  readonly backlog: readonly WorkEntry[];
};

// A revision as it is said inside a sentence. The source evidence and every
// pinned link keep the whole revision.
export function shortRevision(revision: string): string {
  return revision.slice(0, 7);
}

function interpret(
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
      }));
  return {
    direction: recorded.data,
    taken: entriesIn(takenHeading),
    backlog: entriesIn(queueHeading),
  };
}

// How long one read may wait for GitHub. A read still unanswered by then ends
// as a read problem, so a stalled connection leaves the person able to retry;
// nothing retries for them.
const readWaitLimitMs = 30_000;

export async function readPublishedWork(
  source: PublishedSource,
  signal: AbortSignal,
): Promise<PublishedWork> {
  const waitLimit = new AbortController();
  const waiting = setTimeout(() => {
    waitLimit.abort();
  }, readWaitLimitMs);
  const untilEither = AbortSignal.any([signal, waitLimit.signal]);
  try {
    const revision = await resolveRevision(source, untilEither);
    const markdown = await readBacklogAt(source, revision, untilEither);
    return {
      source,
      revision,
      retrievedAt: new Date(),
      ...interpret(markdown, revision, source),
    };
  } catch (error) {
    if (waitLimit.signal.aborted && !signal.aborted) {
      throw new ReadProblem(
        `GitHub did not answer within ${readWaitLimitMs / 1000} seconds, so the read was given up.`,
      );
    }
    throw error;
  } finally {
    clearTimeout(waiting);
  }
}
