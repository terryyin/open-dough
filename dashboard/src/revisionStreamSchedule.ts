// Stream delivery of revision answers for the published observation
// (`./publishedObservation.ts`): while a snapshot is shown, the page is
// visible, the observation chose `"stream"`, and no read is under way, hold
// one EventSource to the local boundary's revision stream (`at`, not
// `since`). Each `data` event is parsed and reacted to the same way as a
// check answer (`./revisionCheckRead.ts`, `./revisionAnswer.ts`). Closing
// the page, hiding it, starting a read, losing the slot, waiting out a rate
// limit, or changing the shown revision or watched branches ends the
// EventSource; a later settle at a new revision opens again there. A stream
// that fails, closes, or stays silent longer than the pace plus the read wait
// bound is reported as a failed check is today; the page closes it itself
// (so the browser does not retry sooner than the pace) and reopens no more
// often than the pace. The first answer after a reopen clears the problem.

import { useEffect } from "react";
import { readingRefOf, readWaitLimitMs } from "./authenticatedReadRules.ts";
import { useLimitedUntil } from "./readingLimit.ts";
import { ReadProblem } from "./readProblem.ts";
import {
  reactToRevisionCheck,
  reactToRevisionCheckFailure,
} from "./revisionAnswer.ts";
import {
  revisionCheckFromStreamData,
  revisionStreamUrl,
} from "./revisionCheckRead.ts";
import {
  checkIntervalMs,
  type RevisionDeliveryAnswers,
} from "./revisionCheckSchedule.ts";

// Silence longer than one pace plus the shared read wait bound is lost
// freshness: the stream should have answered within one observation that may
// itself wait that long for GitHub.
export const revisionStreamSilenceMs = checkIntervalMs + readWaitLimitMs;

export function useRevisionStreamSchedule({
  source,
  shownRevision,
  watchedHeads,
  readSettled,
  visibility,
  delivery,
  onChanged,
  onUnchanged,
  onBranchesMoved,
  onFailed,
}: RevisionDeliveryAnswers): void {
  const limitedUntil = useLimitedUntil();
  const watchKey = JSON.stringify([...watchedHeads]);
  useEffect(() => {
    if (
      delivery !== "stream" ||
      !readSettled ||
      shownRevision === undefined ||
      visibility === "hidden"
    ) {
      return;
    }
    const watched = [...watchedHeads.keys()];
    const reading = readingRefOf(source);
    const handlers = { onChanged, onUnchanged, onBranchesMoved, onFailed };
    let closed = false;
    let stream: EventSource | undefined;
    let silenceTimer: ReturnType<typeof setTimeout> | undefined;
    let reopenTimer: ReturnType<typeof setTimeout> | undefined;
    // An attempt that never answered: transport errors reopen at the pace
    // without saying freshness was lost until the silence bound from open.
    // An answered stream that then errors reports at once.
    let answered = false;
    let openedAt = 0;

    const clearSilence = () => {
      if (silenceTimer !== undefined) {
        clearTimeout(silenceTimer);
        silenceTimer = undefined;
      }
    };

    const clearReopen = () => {
      if (reopenTimer !== undefined) {
        clearTimeout(reopenTimer);
        reopenTimer = undefined;
      }
    };

    const stopHolding = () => {
      clearSilence();
      if (stream !== undefined) {
        const closing = stream;
        stream = undefined;
        closing.onmessage = null;
        closing.onerror = null;
        closing.close();
      }
    };

    const lostStreamProblem = () =>
      new ReadProblem(
        `The revision stream for ${reading} closed or fell silent, so freshness was lost.`,
      );

    const scheduleOpenAfter = (waitMs: number) => {
      if (closed || reopenTimer !== undefined) {
        return;
      }
      reopenTimer = setTimeout(() => {
        reopenTimer = undefined;
        open();
      }, waitMs);
    };

    const loseStream = (report: boolean) => {
      if (closed) {
        return;
      }
      stopHolding();
      if (report) {
        reactToRevisionCheckFailure(lostStreamProblem(), handlers);
      }
      scheduleOpenAfter(checkIntervalMs);
    };

    const armSilence = () => {
      clearSilence();
      silenceTimer = setTimeout(() => {
        silenceTimer = undefined;
        loseStream(true);
      }, revisionStreamSilenceMs);
    };

    const open = () => {
      if (closed || stream !== undefined) {
        return;
      }
      answered = false;
      openedAt = Date.now();
      const next = new EventSource(
        revisionStreamUrl(source, shownRevision, watched),
      );
      stream = next;
      armSilence();
      next.onmessage = (event) => {
        if (closed || stream !== next) {
          return;
        }
        try {
          const data: unknown = event.data;
          if (typeof data !== "string") {
            return;
          }
          const check = revisionCheckFromStreamData(
            data,
            shownRevision,
            watched,
            reading,
          );
          answered = true;
          armSilence();
          if (
            reactToRevisionCheck(check, watchedHeads, handlers) === "reading"
          ) {
            closed = true;
            clearReopen();
            stopHolding();
          }
        } catch (error: unknown) {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }
          // A limited or failed answer over the stream: same reaction as a
          // check, and the page closes the EventSource itself. A standing
          // rate limit re-runs this effect to open at T; any other failure
          // reopens at the pace.
          answered = true;
          reactToRevisionCheckFailure(error, handlers);
          stopHolding();
          if (error instanceof ReadProblem && error.limited !== undefined) {
            clearReopen();
            return;
          }
          scheduleOpenAfter(checkIntervalMs);
        }
      };
      next.onerror = () => {
        if (closed || stream !== next) {
          return;
        }
        // Close ourselves so the browser does not retry sooner than the pace.
        // Report when this attempt had answered, or once the silence bound
        // from open has passed (a connect that never lived).
        const silentLongEnough =
          Date.now() - openedAt >= revisionStreamSilenceMs;
        loseStream(answered || silentLongEnough);
      };
    };

    // While a rate limit stands, wait until T then open (same wait the check
    // delivery embeds in its timer), so the limit ending reopens without a
    // separate standing-limit subscription.
    const waitForLimit = Math.max(0, limitedUntil - Date.now());
    if (waitForLimit > 0) {
      scheduleOpenAfter(waitForLimit);
    } else {
      open();
    }
    return () => {
      closed = true;
      clearReopen();
      stopHolding();
    };
  }, [
    delivery,
    limitedUntil,
    readSettled,
    shownRevision,
    source,
    visibility,
    watchKey,
  ]);
}
