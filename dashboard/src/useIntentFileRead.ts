// The published text of the file selected in Intent (`./IntentBrowser.tsx`),
// read at the revision shown. The answered read is of one path, returned only
// while that path is the one selected, so a new selection never pairs with the
// previous text, and anything else reads as still reading. A file the
// published revision does not list, or whose Purpose is the selected story's
// diff (`./IntentFileReading.tsx`), is never read. Text already read on this
// page at the same revision is not asked again, and a read of it in flight is
// joined (`./repositoryFileReads.ts`); a failed read is asked again on Retry.

import { useEffect, useState } from "react";
import type { FileRead } from "./IntentFileReading.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { readCachedFile } from "./repositoryFileReads.ts";

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
  // is not read: the revision lacks it or its Purpose is the story's diff.
  readonly path: string;
  readonly file: boolean;
  readonly unread: boolean;
}): { readonly read: FileRead | undefined; readonly retry: () => void } {
  const [fileRead, setFileRead] = useState<FileRead | undefined>(undefined);
  const [fileRetry, setFileRetry] = useState(0);
  useEffect(() => {
    if (!file || path === "" || unread) return;
    const controller = new AbortController();
    setFileRead(undefined);
    void readCachedFile(source, revision, path, controller.signal)
      .then((text) => {
        if (!controller.signal.aborted) {
          setFileRead({ path, state: "ready", text });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFileRead({ path, state: "failed" });
        }
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, path, file, fileRetry, unread]);

  return {
    read: file && fileRead?.path === path ? fileRead : undefined,
    retry: () => {
      setFileRetry((n) => n + 1);
    },
  };
}
