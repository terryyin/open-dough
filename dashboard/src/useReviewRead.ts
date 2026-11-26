// One read of the story review's source (`./reviewSource.ts`: the page's
// endpoints, as `./pageReads.tsx` supplies them), kept until
// the reader leaves or reads again: the answer, or why it could not be read.
// A new query or `round` reads again; the last answer stays until the new one
// arrives, and `reading` says it is not yet the answer to what was last asked.
// A disabled read sends no request; enabling it reads the query then shown.
// A read whose answers are fixed by its query (`fixed`, as a story file's
// diff and texts between two trees) is asked once per page for each
// answer `fixed` accepts, and joined while in flight (`./answerMemo.ts`);
// anything else, and every failure, is asked again. A kept answer shows as
// the reader renders, without a reading moment.

import { useEffect, useMemo, useRef, useState } from "react";
import { keptAnswer, memoizedAnswer } from "./answerMemo.ts";
import {
  heldOnPage,
  useReviewReads,
  useStoryResultReads,
} from "./pageReads.tsx";
import type { ReviewInitialSyncProgress } from "./reviewInitialSync.ts";
import { useStateKeyedBy } from "./stateKeyedBy.ts";
import {
  type ReviewQuery,
  type ReviewRead,
  type ReviewSource,
} from "./reviewSource.ts";
import type { StoryReviewResult } from "./storyReviewResult.ts";

let nextResultPage = 0;
const useResultPage = heldOnPage(() => String(++nextResultPage));

type AnswerOf<Read extends keyof ReviewSource> = Awaited<
  ReturnType<ReviewSource[Read]>
>;

type ReviewReadControls<Answer> = {
  readonly round?: number;
  readonly enabled?: boolean;
  readonly fixed?: (answer: Answer) => boolean;
  readonly readKey?: string | undefined;
};

export type ReviewInitialSyncFeedback =
  | Extract<ReviewInitialSyncProgress, { kind: "running" }>
  | (Extract<ReviewInitialSyncProgress, { kind: "failed" }> & {
      readonly retry: () => void;
    });

export type ReviewReadState<Answer> = {
  readonly answer?: Answer;
  readonly problem?: string;
  readonly reading: boolean;
  readonly initialSync?: ReviewInitialSyncFeedback;
};

export function useReviewRead<Read extends keyof ReviewSource>(
  endpoint: Read,
  query: ReviewQuery,
  controls: ReviewReadControls<AnswerOf<Read>> = {},
): ReviewReadState<AnswerOf<Read>> {
  const source = useReviewReads();
  const readAnswer = useMemo(
    () => (source[endpoint] as ReviewRead<AnswerOf<Read>>).bind(source),
    [source, endpoint],
  );
  return useReviewAnswer(readAnswer, endpoint, query, controls);
}

export function useStoryReviewResult(
  query: ReviewQuery,
  controls: ReviewReadControls<StoryReviewResult>,
): ReviewReadState<StoryReviewResult> {
  const readAnswer = useStoryResultReads();
  const page = useResultPage();
  return useReviewAnswer(readAnswer, `result/${page}`, query, controls);
}

function useReviewAnswer<Answer>(
  readAnswer: ReviewRead<Answer>,
  cachePrefix: string,
  query: ReviewQuery,
  { round = 0, enabled = true, fixed, readKey }: ReviewReadControls<Answer>,
): ReviewReadState<Answer> {
  const [read, setRead] = useState<{
    answer?: Answer;
    problem?: string;
    of?: string;
    initialSync?: ReviewInitialSyncProgress;
  }>({});
  const search = new URLSearchParams(query).toString();
  const selection = `${search}#${String(round)}#${readKey ?? ""}`;
  const { value: retry, set: setRetry } = useStateKeyedBy<
    { readonly attempt: number } | undefined
  >(undefined, enabled ? selection : undefined);
  // Only the read started by the click can request a new sync attempt.
  const startedRetry = useRef<typeof retry>(undefined);
  const of = `${selection}#${String(retry?.attempt ?? 0)}`;
  const key = `${cachePrefix}?${search}`;
  useEffect(() => {
    if (!enabled) return;
    const retryInitialSync =
      retry !== undefined && startedRetry.current !== retry;
    startedRetry.current = retry;
    const controller = new AbortController();
    const asked = Object.fromEntries(new URLSearchParams(search));
    const ask = (signal: AbortSignal) =>
      readAnswer(asked, signal, {
        retryInitialSync,
        onInitialSync(initialSync) {
          if (!signal.aborted) setRead({ of, initialSync });
        },
      });
    void (
      fixed === undefined
        ? ask(controller.signal)
        : memoizedAnswer(key, ask, controller.signal, fixed)
    ).then(
      (answer) => {
        if (!controller.signal.aborted)
          setRead((current) => ({
            answer,
            of,
            ...(current.of === of && current.initialSync?.kind === "failed"
              ? { initialSync: current.initialSync }
              : {}),
          }));
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
  }, [readAnswer, key, search, of, enabled, fixed, retry]);
  const kept =
    enabled && fixed !== undefined
      ? (keptAnswer(key) as Answer | undefined)
      : undefined;
  if (kept !== undefined) return { answer: kept, reading: false };
  const progress = enabled && read.of === of ? read.initialSync : undefined;
  const initialSync =
    progress?.kind === "failed"
      ? {
          ...progress,
          retry: () => {
            setRetry({ attempt: (retry?.attempt ?? 0) + 1 });
          },
        }
      : progress;
  return {
    ...(read.answer === undefined ? {} : { answer: read.answer }),
    ...(read.problem === undefined ? {} : { problem: read.problem }),
    ...(initialSync === undefined ? {} : { initialSync }),
    reading:
      enabled && (read.of !== of || read.initialSync?.kind === "running"),
  };
}
