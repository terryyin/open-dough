// Loads preparation, purpose, and plan-slice facts for a published-work
// snapshot after membership is already known. Files are read at the same
// revision through the local authenticated boundary
// (`./repositoryFileReads.ts`). Plan text fetched for readiness is reused for
// detail; opening already-read detail costs no extra request.

import type { PublishedWork, WorkEntry } from "./publishedWork.ts";
import {
  planAssociationConflict,
  planSlicesFor,
  preparationForPeek,
  purposeFor,
  recordedPlanPathFor,
} from "./workEntryFacts.ts";
import { loadRepositoryTexts } from "./repositoryFileReads.ts";
import {
  resolveSourceLink,
  snapshotRepositoryPath,
  type SourceLink,
} from "./sourceLink.ts";
import {
  peekRecordedApproach,
  type WorkPreparation,
} from "./storyPreparation.ts";
import type { WorkPlanSlices } from "./storyPlan.ts";
import type { WorkPurpose } from "./storyPurpose.ts";

type EntryFacts = {
  readonly preparation: WorkPreparation;
  readonly associatedPlan?: SourceLink;
  readonly planPath?: string;
  readonly purpose: WorkPurpose;
  readonly planSlices: WorkPlanSlices;
};

function withFacts(
  work: PublishedWork,
  byIdentity: ReadonlyMap<string, EntryFacts>,
): PublishedWork {
  const apply = (entries: readonly WorkEntry[]): WorkEntry[] =>
    entries.map((entry) => {
      const facts = byIdentity.get(entry.identity);
      if (facts === undefined) {
        return entry;
      }
      return {
        ...entry,
        preparation: facts.preparation,
        ...(facts.associatedPlan !== undefined && {
          associatedPlan: facts.associatedPlan,
        }),
        ...(facts.planPath !== undefined && { planPath: facts.planPath }),
        purpose: facts.purpose,
        planSlices: facts.planSlices,
      };
    });
  return {
    ...work,
    taken: apply(work.taken),
    backlog: apply(work.backlog),
  };
}

type Peek = {
  readonly entry: WorkEntry;
  readonly path: string | undefined;
  readonly peek: ReturnType<typeof peekRecordedApproach> | undefined;
  readonly planPath?: string;
};

function peekEntries(
  entries: readonly WorkEntry[],
  canonicalPaths: ReadonlyMap<string, string>,
  canonicalText: ReadonlyMap<string, string>,
  canonicalProblems: ReadonlyMap<string, string>,
): Peek[] {
  return entries.map((entry) => {
    const path = canonicalPaths.get(entry.identity);
    if (path === undefined) {
      return {
        entry,
        path: undefined,
        peek: {
          status: "unavailable",
          problem:
            "This entry does not name a file in the observed repository that can be read for preparation facts.",
        },
      };
    }
    const problem = canonicalProblems.get(path);
    if (problem !== undefined) {
      return {
        entry,
        path,
        peek: { status: "unavailable", problem },
      };
    }
    const text = canonicalText.get(path);
    if (text === undefined) {
      return {
        entry,
        path,
        peek: {
          status: "unavailable",
          problem: "The canonical record could not be read.",
        },
      };
    }
    const peek = peekRecordedApproach(text, entry.canonical.recorded);
    const planPath = recordedPlanPathFor(path, peek);
    return {
      entry,
      path,
      peek,
      ...(planPath !== undefined && { planPath }),
    };
  });
}

// Every file left unread, including one still unread when `signal` ends the
// reads, carries its problem, so the enriched snapshot never keeps a loading
// fact.
export async function enrichPreparation(
  work: PublishedWork,
  signal: AbortSignal,
): Promise<PublishedWork> {
  const { source, revision } = work;
  const entries = [...work.taken, ...work.backlog];
  const canonicalPaths = new Map<string, string>();
  for (const entry of entries) {
    const path = snapshotRepositoryPath(entry.canonical, source.backlogPath);
    if (path !== undefined) {
      canonicalPaths.set(entry.identity, path);
    }
  }

  const { text: canonicalText, problems: canonicalProblems } =
    await loadRepositoryTexts(
      source,
      revision,
      [...new Set(canonicalPaths.values())],
      signal,
      "The canonical record could not be read for preparation facts.",
    );

  const peeks = peekEntries(
    entries,
    canonicalPaths,
    canonicalText,
    canonicalProblems,
  );

  const planPaths = new Set<string>();
  for (const { entry, path, peek, planPath } of peeks) {
    if (
      peek === undefined ||
      planPath === undefined ||
      planPath === path ||
      // Disagreement is reported; neither plan is preferred for readiness.
      planAssociationConflict(entry, source.backlogPath, planPath, peek) !==
        undefined
    ) {
      continue;
    }
    planPaths.add(planPath);
  }

  const { text: planText, problems: planProblems } = await loadRepositoryTexts(
    source,
    revision,
    [...planPaths],
    signal,
    "The associated plan could not be read for readiness facts.",
  );

  const byIdentity = new Map<string, EntryFacts>();
  for (const { entry, path, peek, planPath } of peeks) {
    if (peek === undefined) {
      continue;
    }
    const preparation = preparationForPeek(
      entry,
      path,
      planPath,
      peek,
      canonicalText,
      planText,
      planProblems,
      source.backlogPath,
    );
    byIdentity.set(entry.identity, {
      preparation,
      ...(peek.status === "recorded" &&
        peek.approach.kind === "planned" &&
        path !== undefined && {
          associatedPlan: resolveSourceLink(
            peek.approach.plan,
            source,
            revision,
            path,
          ),
        }),
      ...(planPath !== undefined && { planPath }),
      purpose: purposeFor(path, entry, canonicalText, canonicalProblems),
      planSlices: planSlicesFor(
        preparation,
        path,
        planPath,
        planText,
        planProblems,
        canonicalText,
      ),
    });
  }

  return withFacts(work, byIdentity);
}
