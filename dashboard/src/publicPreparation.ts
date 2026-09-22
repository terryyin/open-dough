// Loads preparation and readiness for a public published-work snapshot after
// membership is already known. Private sources skip this path until their
// authenticated record read attaches later.

import type { PublishedWork, WorkEntry } from "./publishedWork";
import { loadRepositoryTexts } from "./repositoryFileReads";
import { resolveBesideFile } from "./repositoryPath";
import { snapshotRepositoryPath } from "./sourceLink";
import {
  interpretStoryState,
  peekRecordedApproach,
  type WorkPreparation,
} from "./storyPreparation";

export type PublishedWorkProgress = (work: PublishedWork) => void;

function withPreparation(
  work: PublishedWork,
  byIdentity: ReadonlyMap<string, WorkPreparation>,
): PublishedWork {
  const apply = (entries: readonly WorkEntry[]): WorkEntry[] =>
    entries.map((entry) => {
      const preparation = byIdentity.get(entry.identity);
      if (preparation === undefined) {
        return entry;
      }
      return { ...entry, preparation };
    });
  return {
    ...work,
    taken: apply(work.taken),
    backlog: apply(work.backlog),
  };
}

function recordedWithoutPlanAssessment(
  peek: Extract<WorkPreparation, { readonly status: "recorded" }>,
  problem: string,
): WorkPreparation {
  return {
    status: "recorded",
    refinement: peek.refinement,
    approach: peek.approach,
    assessment: { status: "unavailable", problem },
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

function preparationForPeek(
  entry: WorkEntry,
  path: string | undefined,
  peek: ReturnType<typeof peekRecordedApproach>,
  canonicalText: ReadonlyMap<string, string>,
  planText: ReadonlyMap<string, string>,
  planProblems: ReadonlyMap<string, string>,
): WorkPreparation {
  if (peek.status !== "recorded") {
    return peek;
  }
  const href = entry.canonical.recorded;
  const text = path === undefined ? undefined : canonicalText.get(path);
  if (path === undefined || text === undefined) {
    return {
      status: "unavailable",
      problem: "The canonical record could not be read.",
    };
  }
  if (peek.approach.kind !== "planned") {
    return interpretStoryState(text, href);
  }
  const resolved = resolveBesideFile(path, peek.approach.plan);
  if (resolved === undefined) {
    return recordedWithoutPlanAssessment(
      peek,
      "The recorded plan path does not resolve to a file inside the observed repository.",
    );
  }
  if (resolved === path) {
    return interpretStoryState(text, href, { planIsCanonical: true });
  }
  const planProblem = planProblems.get(resolved);
  if (planProblem !== undefined) {
    return recordedWithoutPlanAssessment(peek, planProblem);
  }
  const planSource = planText.get(resolved);
  if (planSource === undefined) {
    return recordedWithoutPlanAssessment(
      peek,
      "The associated plan could not be read.",
    );
  }
  return interpretStoryState(text, href, { planSource });
}

export async function enrichPublicPreparation(
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
  for (const { path, peek } of peeks) {
    if (
      path === undefined ||
      peek === undefined ||
      peek.status !== "recorded" ||
      peek.approach.kind !== "planned"
    ) {
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

  const byIdentity = new Map<string, WorkPreparation>();
  for (const { entry, path, peek } of peeks) {
    if (peek === undefined) {
      continue;
    }
    byIdentity.set(
      entry.identity,
      preparationForPeek(
        entry,
        path,
        peek,
        canonicalText,
        planText,
        planProblems,
      ),
    );
  }

  const enriched = withPreparation(work, byIdentity);
  onPartial?.(enriched);
  return enriched;
}
