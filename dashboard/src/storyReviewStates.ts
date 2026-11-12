// The project's story review states (`./storyReviewState.ts`) as Recently
// done's cards share them: one local read per project, read again at the
// shared check interval so every page of the server shows another page's
// change at its next read, and a change shown at once from its own answer. An
// answer to a request started before the latest one shown is not shown.
import { useCallback, useEffect, useRef, useState } from "react";
import { localSettingRequest } from "./localSettingRequest.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";
import {
  storyReviewStateEndpoint,
  storyReviewStatesAnswerSchema,
  type StoryReviewStateChange,
} from "./storyReviewState.ts";

export type StoryReviewStates = {
  // The reviewed story identities, until the first read answers.
  readonly reviewed: ReadonlySet<string> | undefined;
  // Saves one story's state; rejects when it could not be saved.
  readonly change: (change: StoryReviewStateChange) => Promise<void>;
};

const failure = "The review state could not be read.";

async function request(project: string, change?: StoryReviewStateChange) {
  return new Set(
    storyReviewStatesAnswerSchema.parse(
      await localSettingRequest(
        `${storyReviewStateEndpoint}?id=${encodeURIComponent(project)}`,
        change,
        failure,
      ),
    ).reviewed,
  );
}

export function useStoryReviewStates(project: string): StoryReviewStates {
  const [reviewed, setReviewed] = useState<ReadonlySet<string>>();
  const order = useRef({ project, issued: 0, shown: 0 });
  const answered = useCallback(async (asked: Promise<ReadonlySet<string>>) => {
    const sequence = (order.current.issued += 1);
    const from = order.current.project;
    const answer = await asked;
    const now = order.current;
    if (now.project !== from || sequence <= now.shown) return;
    now.shown = sequence;
    setReviewed(answer);
  }, []);
  useEffect(() => {
    order.current = { project, issued: 0, shown: 0 };
    setReviewed(undefined);
    const read = () => {
      answered(request(project)).catch(() => undefined);
    };
    read();
    const interval = setInterval(read, checkIntervalMs);
    return () => {
      clearInterval(interval);
      order.current = { project: "", issued: 0, shown: 0 };
    };
  }, [project, answered]);
  const change = useCallback(
    (asked: StoryReviewStateChange) => answered(request(project, asked)),
    [project, answered],
  );
  return { reviewed, change };
}
