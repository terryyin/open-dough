// Disposable state for the proof of one exact attempt and observation round.
// Callers choose their domain key; the real reader validates the wire answer.
import { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import type { CiProof, CiProofSubject } from "./ciProof.ts";
import type { PublishedSource } from "./publishedSource.ts";

export type ProofRead =
  CiProof | { readonly kind: "unanswered"; readonly detail?: string };

export function createCiProofReading() {
  let selected:
    | { readonly source: PublishedSource; readonly key: string | undefined }
    | undefined;
  let answer: { readonly key: string; readonly read: ProofRead } | undefined;
  let controller: AbortController | undefined;
  let active = false;
  const listeners = new Set<() => void>();
  const publish = (key: string, read: ProofRead) => {
    answer = { key, read };
    for (const listener of listeners) listener();
  };
  return {
    getSnapshot: () => answer,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    select(
      source: PublishedSource,
      key: string | undefined,
      subject: CiProofSubject | undefined,
    ) {
      if (active && selected?.source === source && selected.key === key) return;
      selected = { source, key };
      active = true;
      controller?.abort();
      if (key === undefined || subject === undefined) return;
      const request = new AbortController();
      controller = request;
      return readIntentCiProof(source, subject, request.signal)
        .then((read) => {
          if (!request.signal.aborted) publish(key, read);
        })
        .catch((error: unknown) => {
          if (request.signal.aborted) return;
          publish(key, {
            kind: "unanswered",
            ...(error instanceof Error && error.message !== ""
              ? { detail: error.message }
              : {}),
          });
        });
    },
    dispose() {
      active = false;
      controller?.abort();
    },
  };
}
