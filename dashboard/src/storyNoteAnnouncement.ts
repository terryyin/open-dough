// One note operation speaks at a time across collection and diff owners.
// Each owner keeps its status mounted for the lifetime of its own surface.
import { useContext, useId, useMemo, useSyncExternalStore } from "react";
import { StoryNotesOnPage } from "./storyNotes.ts";
function channel() {
  let current = { owner: "", message: "" };
  const listeners = new Set<() => void>();
  return {
    snapshot: () => current,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    say: (owner: string, message: string) => {
      current = { owner, message };
      for (const listener of listeners) listener();
    },
  };
}
const channels = new WeakMap<object, ReturnType<typeof channel>>();
export function useStoryNoteAnnouncement() {
  const page = useContext(StoryNotesOnPage);
  if (page === undefined)
    throw new Error(
      "A story note's announcement is outside the page's story notes.",
    );
  const owner = useId();
  const shared = useMemo(() => {
    let value = channels.get(page);
    if (value === undefined) {
      value = channel();
      channels.set(page, value);
    }
    return value;
  }, [page]);
  const current = useSyncExternalStore(shared.subscribe, shared.snapshot);
  return [
    current.owner === owner ? current.message : "",
    (message: string) => {
      shared.say(owner, message);
    },
  ] as const;
}
