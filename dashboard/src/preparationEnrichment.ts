// Loads preparation, purpose, and plan-slice facts for a published-work
// snapshot after membership is already known. File transport follows the
// catalog source's access (`./repositoryFileReads.ts`): public GitHub or the
// local authenticated boundary. Plan text fetched for readiness is reused for
// detail; opening already-read detail costs no extra request.

import type { PublishedWork, WorkEntry } from "./publishedWork";
import {
  planAssociationConflict,
  planSlicesFor,
  preparationForPeek,
  purposeFor,
} from "./publicEntryFacts";
import { loadRepositoryTexts } from "./repositoryFileReads";
import { resolveBesideFile } from "./repositoryPath";
import { snapshotRepositoryPath } from "./sourceLink";
import { peekRecordedApproach, type WorkPreparation } from "./storyPreparation";
import type { WorkPlanSlices } from "./storyPlan";
import type { WorkPurpose } from "./storyPurpose";

export type PublishedWorkProgress = (work: PublishedWork) => void;

type EntryFacts = {
  readonly preparation: WorkPreparation;
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
    return {
      entry,
      path,
      peek: peekRecordedApproach(text, entry.canonical.recorded),
    };
  });
}

export async function enrichPreparation(
  work: PublishedWork,
  signal: AbortSignal,
  onPartial: PublishedWorkProgress | undefined,
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

  const planPaths = new Map<string, string>();
  for (const { entry, path, peek } of peeks) {
    if (
      path === undefined ||
      peek === undefined ||
      peek.status !== "recorded" ||
      peek.approach.kind !== "planned"
    ) {
      continue;
    }
    if (
      planAssociationConflict(entry, source.backlogPath, path, peek) !==
      undefined
    ) {
      // Disagreement is reported; neither plan is preferred for readiness.
      continue;
    }
    const resolved = resolveBesideFile(path, peek.approach.plan);
    if (resolved === undefined || resolved === path) {
      continue;
    }
    planPaths.set(`${path}\0${peek.approach.plan}`, resolved);
  }

  const { text: planText, problems: planProblems } = await loadRepositoryTexts(
    source,
    revision,
    [...new Set(planPaths.values())],
    signal,
    "The associated plan could not be read for readiness facts.",
  );

  const byIdentity = new Map<string, EntryFacts>();
  for (const { entry, path, peek } of peeks) {
    if (peek === undefined) {
      continue;
    }
    const preparation = preparationForPeek(
      entry,
      path,
      peek,
      canonicalText,
      planText,
      planProblems,
      source.backlogPath,
    );
    byIdentity.set(entry.identity, {
      preparation,
      purpose: purposeFor(path, entry, canonicalText, canonicalProblems),
      planSlices: planSlicesFor(
        preparation,
        path,
        planText,
        planProblems,
        canonicalText,
      ),
    });
  }

  const enriched = withFacts(work, byIdentity);
  onPartial?.(enriched);
  return enriched;
}
