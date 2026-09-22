// The snapshot the dashboard shows: what one published backlog revision says,
// and the evidence of where and when it was read. What a backlog means stays
// with the shared backlog reader; story preparation facts come from the shared
// story-state reader. Nothing here parses Markdown itself.

import { z } from "zod";
import { directionOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-direction.mjs";
import {
  parseBacklog,
  queueHeading,
  takenHeading,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import { readBacklogAt, resolveRevision } from "./githubSource";
import type { PublishedSource } from "./publishedSource";
import {
  enrichPublicPreparation,
  type PublishedWorkProgress,
} from "./publicPreparation";
import { readPrivateSnapshot } from "./privateRead";
import { ReadProblem } from "./readProblem";
import { resolveSourceLink, type SourceLink } from "./sourceLink";
import type { WorkPreparation } from "./storyPreparation";

export type { PublishedWorkProgress } from "./publicPreparation";

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
  // Preparation facts from the same revision. Undefined while a private
  // source awaits its later authenticated path; public reads start as loading.
  readonly preparation?: WorkPreparation;
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
  preparation: WorkPreparation | undefined,
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
        ...(preparation !== undefined && { preparation }),
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

// The transport is chosen by the catalog's own recorded `access`
// (`./publishedSource.ts`), never re-derived from the repository name or
// anything else. Both transports end in the same shape -- one resolved
// revision and its raw backlog text -- so everything after this point
// (`interpret`, above) is one projection regardless of which one answered.
async function readRevisionAndMarkdown(
  source: PublishedSource,
  signal: AbortSignal,
): Promise<{ readonly revision: string; readonly markdown: string }> {
  if (source.access === "private") {
    const snapshot = await readPrivateSnapshot(source, signal);
    return { revision: snapshot.revision, markdown: snapshot.backlog };
  }
  const revision = await resolveRevision(source, signal);
  const markdown = await readBacklogAt(source, revision, signal);
  return { revision, markdown };
}

export async function readPublishedWork(
  source: PublishedSource,
  signal: AbortSignal,
  onPartial?: PublishedWorkProgress,
): Promise<PublishedWork> {
  const waitLimit = new AbortController();
  const waiting = setTimeout(() => {
    waitLimit.abort();
  }, readWaitLimitMs);
  const untilEither = AbortSignal.any([signal, waitLimit.signal]);
  try {
    const { revision, markdown } = await readRevisionAndMarkdown(
      source,
      untilEither,
    );
    // Public sources load preparation after membership; private sources leave
    // preparation unset until the authenticated record path attaches later.
    const initialPreparation: WorkPreparation | undefined =
      source.access === "public" ? { status: "loading" } : undefined;
    const work: PublishedWork = {
      source,
      revision,
      retrievedAt: new Date(),
      ...interpret(markdown, revision, source, initialPreparation),
    };
    onPartial?.(work);
    if (source.access !== "public") {
      return work;
    }
    return await enrichPublicPreparation(work, untilEither, onPartial);
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
