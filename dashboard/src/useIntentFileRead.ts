// The published text of the file selected in Intent (`./IntentBrowser.tsx`),
// read at the revision shown. The answered read is of one path, returned only
// while that path is the one selected, so a new selection never pairs with the
// previous text, and anything else reads as still reading. A file the
// published revision does not list, or whose Purpose is the selected story's
// diff (`./IntentFileReading.tsx`), is never read. Text already read on this
// page at the same revision is not asked again, and a read of it in flight is
// joined (`./repositoryFileReads.ts`); a failed read is asked again on Retry.
// Text already kept shows as it is rendered, without a reading moment.
// When the reading moves to another revision, the selected file's text read at
// the previous one stays, with the revision it is of, until the new text
// replaces it in place; if the new read fails, that text still stays, with the
// failed revision (`failedRevision`) and Retry.

import { useEffect, useState } from "react";
import { cachedFile } from "./fileContentCache.ts";
import type { FileRead } from "./IntentFileReading.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { readCachedFile } from "./repositoryFileReads.ts";

type RevisionRead = FileRead & {
  readonly revision: string;
  // The later revision whose read failed while this text stays.
  readonly failedRevision?: string;
};

export function useIntentFileRead({
  source,
  revision,
  path,
  file,
  unread,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  // The selected path, whether it is a file, and whether its published text
  // is not read: the revision lacks it, its Purpose is the story's diff, or
  // that is not yet known.
  readonly path: string;
  readonly file: boolean;
  readonly unread: boolean;
}): {
  readonly read: FileRead | undefined;
  // The revision the answered read is of, and the revision whose read failed
  // while that text stays.
  readonly revision: string | undefined;
  readonly failedRevision: string | undefined;
  readonly retry: () => void;
} {
  const [fileRead, setFileRead] = useState<RevisionRead | undefined>(undefined);
  const [fileRetry, setFileRetry] = useState(0);
  useEffect(() => {
    if (!file || path === "" || unread) return;
    const controller = new AbortController();
    const readyText = (
      was: RevisionRead | undefined,
    ): was is RevisionRead & { readonly state: "ready" } =>
      was?.path === path && was.state === "ready";
    // Text read before stays while this read runs, without its failure.
    setFileRead((was) =>
      readyText(was)
        ? { path, state: "ready", text: was.text, revision: was.revision }
        : undefined,
    );
    void readCachedFile(source, revision, path, controller.signal)
      .then((text) => {
        if (!controller.signal.aborted) {
          setFileRead({ path, state: "ready", text, revision });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFileRead((was) =>
            readyText(was) && was.revision !== revision
              ? { ...was, failedRevision: revision }
              : { path, state: "failed", revision },
          );
        }
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, path, file, fileRetry, unread]);

  const text =
    file && path !== "" && !unread
      ? cachedFile(source.repository, revision, path)
      : undefined;
  const read: RevisionRead | undefined =
    text !== undefined
      ? { path, state: "ready", text, revision }
      : file && fileRead?.path === path
        ? fileRead
        : undefined;
  return {
    read,
    revision: read?.revision,
    failedRevision: read?.failedRevision,
    retry: () => {
      setFileRetry((n) => n + 1);
    },
  };
}
