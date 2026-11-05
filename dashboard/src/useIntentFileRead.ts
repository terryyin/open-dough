// The published text of the file selected in Intent (`./IntentBrowser.tsx`),
// read at the revision shown. The answered read is of one path, returned only
// while that path is the one selected, so a new selection never pairs with the
// previous text, and anything else reads as still reading. A file the
// published revision does not list, or whose Purpose is the selected story's
// diff (`./IntentFileReading.tsx`), is never read. Text already read on this
// page at the same revision is not asked again, and a read of it in flight is
// joined (`./repositoryFileReads.ts`); a failed read is asked again on Retry.
// When the reading moves to another revision, the selected file's text read at
// the previous one stays, with the revision it is of, until the new text
// replaces it in place.

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
  // is not read: the revision lacks it, its Purpose is the story's diff, or
  // that is not yet known.
  readonly path: string;
  readonly file: boolean;
  readonly unread: boolean;
}): {
  readonly read: FileRead | undefined;
  // The revision the answered read is of.
  readonly revision: string | undefined;
  readonly retry: () => void;
} {
  const [fileRead, setFileRead] = useState<
    (FileRead & { readonly revision: string }) | undefined
  >(undefined);
  const [fileRetry, setFileRetry] = useState(0);
  useEffect(() => {
    if (!file || path === "" || unread) return;
    const controller = new AbortController();
    setFileRead((was) =>
      was?.path === path && was.state === "ready" ? was : undefined,
    );
    void readCachedFile(source, revision, path, controller.signal)
      .then((text) => {
        if (!controller.signal.aborted) {
          setFileRead({ path, state: "ready", text, revision });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFileRead({ path, state: "failed", revision });
        }
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, path, file, fileRetry, unread]);

  const read = file && fileRead?.path === path ? fileRead : undefined;
  return {
    read,
    revision: read?.revision,
    retry: () => {
      setFileRetry((n) => n + 1);
    },
  };
}
