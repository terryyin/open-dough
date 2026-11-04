// Stream delivery of revision answers for the published observation
// (`./publishedObservation.ts`): while a snapshot is shown, the page is
// visible, the observation chose `"stream"`, and no read is under way, hold
// one EventSource to the local boundary's revision stream (`at`, not
// `since`). Each `data` event is parsed and reacted to the same way as a
// check answer (`./revisionCheckRead.ts`, `./revisionAnswer.ts`). Closing
// the page, hiding it, starting a read, losing the slot, or changing the
// shown revision or watched branches ends the EventSource; a later settle
// at a new revision opens again there. Failed or silent streams are not yet
// reported as lost freshness (that arrives with the next delivery slice).

import { useEffect } from "react";
import { readingRefOf } from "./authenticatedReadRules.ts";
import { useLimitedUntil } from "./readingLimit.ts";
import {
  reactToRevisionCheck,
  reactToRevisionCheckFailure,
} from "./revisionAnswer.ts";
import {
  revisionCheckFromStreamData,
  revisionStreamUrl,
} from "./revisionCheckRead.ts";
import type { RevisionDeliveryAnswers } from "./revisionCheckSchedule.ts";

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
      visibility === "hidden" ||
      Date.now() < limitedUntil
    ) {
      return;
    }
    const watched = [...watchedHeads.keys()];
    const reading = readingRefOf(source);
    const handlers = { onChanged, onUnchanged, onBranchesMoved, onFailed };
    let closed = false;
    const stream = new EventSource(
      revisionStreamUrl(source, shownRevision, watched),
    );
    stream.onmessage = (event) => {
      if (closed) {
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
        if (reactToRevisionCheck(check, watchedHeads, handlers) === "reading") {
          closed = true;
          stream.close();
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        reactToRevisionCheckFailure(error, handlers);
      }
    };
    return () => {
      closed = true;
      stream.close();
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
