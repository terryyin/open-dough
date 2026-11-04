// The Intent locations of the published work's revision
// (`./IntentPerspective.tsx`), read through the authenticated read boundary
// (`./authenticatedIntentRead.ts`): reading, failed, or the answer, with
// retry. Locations are read per revision: the published work's detail
// completing at the same revision replaces the work, but neither reads them
// again nor remounts the browser and its selection. A failed proof read is
// retried by reading the locations again in place: the browser keeps its
// selection and Purpose, and only a configured answer replaces the locations
// shown.

import { useEffect, useRef, useState } from "react";
import {
  readIntentLocationsAt,
  type IntentLocations,
} from "./authenticatedIntentRead.ts";
import type { PublishedSource } from "./publishedSource.ts";

export function useIntentLocations(
  source: PublishedSource,
  revision: string | undefined,
) {
  const [intent, setIntent] = useState<IntentLocations | "loading" | "failed">(
    revision === undefined ? { status: "not-configured" } : "loading",
  );
  const [locationsRetry, setLocationsRetry] = useState(0);
  const [proofRereading, setProofRereading] = useState(false);
  const proofReread = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    proofReread.current?.abort();
    proofReread.current = undefined;
    setProofRereading(false);
    if (revision === undefined) {
      setIntent({ status: "not-configured" });
      return;
    }
    const controller = new AbortController();
    setIntent("loading");
    void readIntentLocationsAt(source, revision, controller.signal)
      .then((locations) => {
        if (!controller.signal.aborted) setIntent(locations);
      })
      .catch(() => {
        if (!controller.signal.aborted) setIntent("failed");
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, locationsRetry]);

  const retryProof = (revision: string) => {
    proofReread.current?.abort();
    const controller = new AbortController();
    proofReread.current = controller;
    setProofRereading(true);
    void readIntentLocationsAt(source, revision, controller.signal)
      .then((locations) => {
        if (!controller.signal.aborted && locations.status === "configured") {
          setIntent(locations);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setProofRereading(false);
      });
  };

  const retryLocations = () => {
    setLocationsRetry((n) => n + 1);
  };

  return { intent, retryLocations, proofRereading, retryProof };
}
