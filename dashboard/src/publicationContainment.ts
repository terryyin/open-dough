// Whether the revision a page shows contains a launch's accepted publication,
// asked of the local authenticated read boundary
// (`../server/containmentRead.ts`) through the one published-state request
// (`./authenticatedGet.ts`), and remembered per pair: a commit's history never
// changes, so an answer stands, while a failure stands only for the snapshot
// it was asked for and is asked again for a later one. Nothing here guesses
// from the revisions themselves.

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  authenticatedGet,
  commitSha,
  unexpectedAnswer,
} from "./authenticatedGet.ts";
import { readingContainmentAt } from "./authenticatedReadRules.ts";

const okContainment = z.object({
  revision: commitSha,
  accepted: commitSha,
  contained: z.boolean(),
});

export async function readContainment(
  sourceId: string,
  accepted: string,
  revision: string,
  signal: AbortSignal,
): Promise<boolean> {
  const reading = readingContainmentAt(accepted, revision);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(sourceId)}&revision=${encodeURIComponent(revision)}&contains=${encodeURIComponent(accepted)}`,
    reading,
    signal,
  );
  const parsed = okContainment.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.revision !== revision ||
    parsed.data.accepted !== accepted
  ) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.contained;
}

// One question: whether `revision` of the project contains `accepted`.
export type ContainmentQuestion = {
  readonly sourceId: string;
  readonly accepted: string;
  readonly revision: string;
};

export type ContainmentAnswers = {
  // True or false once answered; undefined while unanswered or failed.
  contained(question: ContainmentQuestion): boolean | undefined;
  // Why the question failed for the snapshot asked at `askedAt`.
  problem(question: ContainmentQuestion): string | undefined;
};

const keyOf = ({ sourceId, accepted, revision }: ContainmentQuestion) =>
  JSON.stringify([sourceId, accepted, revision]);

// Asks each of `questions` once; `generation` names the snapshot they are
// asked for, so a failure is asked again for a later snapshot.
export function usePublicationContainment(
  questions: readonly ContainmentQuestion[],
  generation: number,
): ContainmentAnswers {
  const [answers, setAnswers] = useState<ReadonlyMap<string, boolean>>(
    new Map(),
  );
  const [problems, setProblems] = useState<ReadonlyMap<string, string>>(
    new Map(),
  );
  // Each question outstanding or answered, and each failure by the snapshot
  // it failed for, noted the moment it settles: an effect committed before
  // React shows the settled answer must not ask it again.
  const asked = useRef(new Set<string>());
  const unmounted = useRef(new AbortController());
  useEffect(() => {
    const ended = new AbortController();
    unmounted.current = ended;
    return () => {
      ended.abort();
    };
  }, []);
  const wanted = JSON.stringify(questions.map(keyOf).toSorted());
  useEffect(() => {
    const ended = unmounted.current.signal;
    for (const key of JSON.parse(wanted) as string[]) {
      const failedNow = `${key}@${String(generation)}`;
      if (asked.current.has(key) || asked.current.has(failedNow)) continue;
      asked.current.add(key);
      const [sourceId, accepted, revision] = JSON.parse(key) as string[];
      void readContainment(
        sourceId ?? "",
        accepted ?? "",
        revision ?? "",
        ended,
      ).then(
        (contained) => {
          if (ended.aborted) {
            asked.current.delete(key);
            return;
          }
          setAnswers((now) => new Map(now).set(key, contained));
        },
        (error: unknown) => {
          asked.current.delete(key);
          if (ended.aborted) return;
          asked.current.add(failedNow);
          const said = error instanceof Error ? error.message : String(error);
          setProblems((now) => new Map(now).set(failedNow, said));
        },
      );
    }
    // A failure noted asks again for a later snapshot already shown.
  }, [wanted, generation, problems]);
  return {
    contained: (question) => answers.get(keyOf(question)),
    problem: (question) =>
      problems.get(`${keyOf(question)}@${String(generation)}`),
  };
}
