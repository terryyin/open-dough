// The whole project's tracked paths at the revision Project Intent shows,
// read once per revision through the page's Intent reads
// (`./intentReadSource.ts`). Until the first paths are read the tree lists no
// files and its lead says the project files are being read; a failed read
// says why there and offers Retry.

import { useEffect, useState, type ReactNode } from "react";
import { useIntentReads } from "./pageReads.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { ReadProblem } from "./readProblem.ts";

type TreeRead =
  | { readonly revision: string; readonly paths: readonly string[] }
  | { readonly revision: string; readonly problem: string };

export type ProjectTree = {
  readonly paths: readonly string[] | undefined;
  readonly lead: ReactNode;
  // The browser lists no files: the first tree is being read, or a read
  // failed.
  readonly unread: boolean;
};

const firstTreeReading: ProjectTree = {
  paths: undefined,
  unread: true,
  lead: (
    <p role="status" className="intent-settings-problem">
      Reading project files…
    </p>
  ),
};

export function useProjectTreeRead(
  source: PublishedSource,
  revision: string | undefined,
): ProjectTree {
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
          problem:
            error instanceof ReadProblem
              ? error.message
              : "The project tree could not be read.",
        });
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, round, readProjectTree]);
  const current = read?.revision === revision ? read : undefined;
  if (current !== undefined && "paths" in current)
    return { paths: current.paths, lead: undefined, unread: false };
  if (current === undefined)
    // A later revision's pending tree leaves the browser to the configured
    // location files.
    return read === undefined
      ? firstTreeReading
      : { paths: undefined, lead: undefined, unread: false };
  return {
    paths: undefined,
    unread: true,
    lead: (
      <p role="alert" className="intent-settings-problem">
        Project files could not be read: {current.problem}{" "}
        <button
          type="button"
          onClick={() => {
            setRead(undefined);
            setRound((n) => n + 1);
          }}
        >
          Retry
        </button>
      </p>
    ),
  };
}
