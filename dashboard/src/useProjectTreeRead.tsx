// The whole project's tracked paths at Intent's reading revision, read once
// per revision through the page's Intent reads (`./intentReadSource.ts`). An
// answer for a revision the reading has moved past is dropped. Until a first
// tree is read the browser lists no files and its lead says the project files
// are being read; a failed first read says why there and offers Retry
// (`firstProjectTree`).

import { useEffect, useState, type ReactNode } from "react";
import { useIntentReads } from "./pageReads.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { ReadProblem } from "./readProblem.ts";

export type TreeRead =
  | { readonly revision: string; readonly paths: readonly string[] }
  | { readonly revision: string; readonly failed: ReadProblem | undefined };

export type ProjectTree = {
  readonly paths: readonly string[] | undefined;
  readonly lead: ReactNode;
  // The browser lists no files: the first tree is being read, or its read
  // failed.
  readonly unread: boolean;
};

// The read of `revision`'s tree, once answered, and its Retry.
export function useProjectTreeRead(
  source: PublishedSource,
  revision: string | undefined,
): { readonly current: TreeRead | undefined; readonly retry: () => void } {
  const { readProjectTree } = useIntentReads();
  const [read, setRead] = useState<TreeRead | undefined>(undefined);
  const [round, setRound] = useState(0);
  useEffect(() => {
    if (revision === undefined) return;
    const controller = new AbortController();
    readProjectTree(source, revision, controller.signal)
      .then((paths) => {
        if (!controller.signal.aborted) setRead({ revision, paths });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setRead({
          revision,
          failed: error instanceof ReadProblem ? error : undefined,
        });
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, round, readProjectTree]);
  return {
    current: read?.revision === revision ? read : undefined,
    retry: () => {
      setRead(undefined);
      setRound((n) => n + 1);
    },
  };
}

// The tree before any is read: being read, or its failed read with Retry.
export function firstProjectTree(
  current: TreeRead | undefined,
  retry: () => void,
): ProjectTree {
  if (current === undefined || "paths" in current)
    return {
      paths: undefined,
      unread: true,
      lead: (
        <p role="status" className="intent-settings-problem">
          Reading project files…
        </p>
      ),
    };
  return {
    paths: undefined,
    unread: true,
    lead: (
      <p role="alert" className="intent-settings-problem">
        Project files could not be read:{" "}
        {current.failed?.message ?? "The project tree could not be read."}{" "}
        <button type="button" onClick={retry}>
          Retry
        </button>
      </p>
    ),
  };
}
