// One read of the launch boundary's story review endpoints
// (`./storyReviewContract.ts`), kept until the reader leaves or reads again: the
// answer, or why it could not be read. A new query or `round` reads again;
// the last answer stays until the new one arrives, and `reading` says it is
// not yet the answer to what was last asked.
// A disabled read sends no request; enabling it reads the query then shown.
// A read whose answers are fixed by its query (`fixed`, as a story file's
// diff and texts between two trees) is asked once per page for each
// answer `fixed` accepts, and joined while in flight (`./answerMemo.ts`);
// anything else, and every failure, is asked again.

import { useEffect, useState } from "react";
import type { z } from "zod";
import { memoizedAnswer } from "./answerMemo.ts";

async function askReview<Answer>(
  url: string,
  schema: z.ZodType<Answer>,
  signal: AbortSignal,
): Promise<Answer> {
  const response = await fetch(url, { signal, cache: "no-store" });
  const answer: unknown = await response.json();
  if (!response.ok) {
    const said = (answer as { error?: unknown }).error;
    throw new Error(
      typeof said === "string" ? said : "The review was refused.",
    );
  }
  return schema.parse(answer);
}

export function useReviewRead<Answer>(
  endpoint: string,
  query: Readonly<Record<string, string>>,
  schema: z.ZodType<Answer>,
  {
    round = 0,
    enabled = true,
    fixed,
  }: {
    readonly round?: number;
    readonly enabled?: boolean;
    readonly fixed?: (answer: Answer) => boolean;
  } = {},
): {
  readonly answer?: Answer;
  readonly problem?: string;
  readonly reading: boolean;
} {
  const [read, setRead] = useState<{
    answer?: Answer;
    problem?: string;
    of?: string;
  }>({});
  const search = new URLSearchParams(query).toString();
  const of = `${search}#${String(round)}`;
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const url = `${endpoint}?${search}`;
    const ask = (signal: AbortSignal) => askReview(url, schema, signal);
    void (
      fixed === undefined
        ? ask(controller.signal)
        : memoizedAnswer(url, ask, controller.signal, fixed)
    ).then(
      (answer) => {
        if (!controller.signal.aborted) setRead({ answer, of });
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setRead({
            problem: error instanceof Error ? error.message : String(error),
            of,
          });
      },
    );
    return () => {
      controller.abort();
    };
  }, [endpoint, search, schema, of, enabled, fixed]);
  return {
    ...(read.answer === undefined ? {} : { answer: read.answer }),
    ...(read.problem === undefined ? {} : { problem: read.problem }),
    reading: enabled && read.of !== of,
  };
}
