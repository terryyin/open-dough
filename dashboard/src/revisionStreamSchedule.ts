// Stream delivery of revision answers for the published observation
// (`./publishedObservation.ts`): while a snapshot is shown, the page is
// visible, the observation chose `"stream"`, and no read is under way, hold
// one EventSource to the local boundary's revision stream (`at`, not
// `since`). Each `data` event is parsed and reacted to the same way as a
// check answer (`./revisionCheckRead.ts`, `./revisionAnswer.ts`). Closing
// the page, hiding it, starting a read, losing the slot, waiting out a rate
// limit, or changing the shown revision or watched branches ends the
// EventSource; a later settle at a new revision opens again there. Silence
// longer than the pace plus the read wait bound, counted from the last
// successful answer or from when this observation began, is reported as a
// failed check is today — including when every open fails before answering.
// The page closes any held EventSource itself (so the browser does not retry
// sooner than the pace) and reopens no more often than the pace. The first
// answer after a reopen clears the problem.

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
// itself wait that long for GitHub. The bound counts from the last successful
// answer, or from when the observation began, across failed or hung opens.
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
      source === undefined ||
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
    // without saying freshness was lost; the silence deadline from the
    // observation start (or last answer) covers that report. An answered
    // stream that then errors reports at once.
    let answered = false;

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

    // Closing an attempt must leave the silence deadline armed: failed or
    // hung opens neither restart nor postpone the bound.
    const stopHolding = () => {
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

    // Arm once per observation; re-arm only on a successful answer or after
    // the deadline fires (so a later hung-but-connected attempt is still
    // closed). open() and ordinary pace reopens must not re-arm.
    const armSilence = () => {
      clearSilence();
      silenceTimer = setTimeout(() => {
        silenceTimer = undefined;
        if (closed) {
          return;
        }
        loseStream(true);
        armSilence();
      }, revisionStreamSilenceMs);
    };

    // Pace reopens leave the silence deadline alone; a rate-limit wait ending
    // arms a fresh bound immediately before the first open after T.
    const scheduleOpenAfter = (
      waitMs: number,
      afterWait: "open" | "arm-and-open" = "open",
    ) => {
      if (closed || reopenTimer !== undefined) {
        return;
      }
      reopenTimer = setTimeout(() => {
        reopenTimer = undefined;
        if (closed) {
          return;
        }
        if (afterWait === "arm-and-open") {
          armSilence();
        }
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

    const open = () => {
      if (closed || stream !== undefined) {
        return;
      }
      answered = false;
      const next = new EventSource(
        revisionStreamUrl(source, shownRevision, watched),
      );
      stream = next;
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
            clearSilence();
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
            clearSilence();
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
        // Report at once when this attempt had answered; unanswered errors
        // leave reporting to the silence deadline.
        loseStream(answered);
      };
    };

    // While a rate limit stands, wait until T then arm and open (same wait
    // the check delivery embeds in its timer). The silence bound starts when
    // that wait ends — not while the directed notice stands — so a long
    // Retry-After cannot spend or trip the bound during the wait.
    const waitForLimit = Math.max(0, limitedUntil - Date.now());
    if (waitForLimit > 0) {
      scheduleOpenAfter(waitForLimit, "arm-and-open");
    } else {
      armSilence();
      open();
    }
    return () => {
      closed = true;
      clearReopen();
      clearSilence();
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
