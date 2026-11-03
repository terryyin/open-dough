// The published text of the file selected in Intent (`./IntentBrowser.tsx`),
// read at the revision shown. The answered read is of one path, returned only
// while that path is the one selected, so a new selection never pairs with the
// previous text, and anything else reads as still reading. A file the
// published revision does not list is never read.

import { useEffect, useState } from "react";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import type { FileRead } from "./IntentFileReading.tsx";
import type { PublishedSource } from "./publishedSource.ts";

export function useIntentFileRead({
  source,
  revision,
  path,
  file,
  unpublished,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  // The selected path, and whether it is a file and one the revision lacks.
  readonly path: string;
  readonly file: boolean;
  readonly unpublished: boolean;
}): { readonly read: FileRead | undefined; readonly retry: () => void } {
  const [fileRead, setFileRead] = useState<FileRead | undefined>(undefined);
  const [fileRetry, setFileRetry] = useState(0);
  useEffect(() => {
    if (!file || path === "" || unpublished) return;
    const controller = new AbortController();
    setFileRead(undefined);
    void readRepositoryFileAt(source, path, revision, controller.signal)
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
  }, [source, revision, path, file, fileRetry, unpublished]);

  return {
    read: file && fileRead?.path === path ? fileRead : undefined,
    retry: () => {
      setFileRetry((n) => n + 1);
    },
  };
}
