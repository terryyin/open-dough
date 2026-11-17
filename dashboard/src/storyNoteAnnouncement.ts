// One note operation speaks at a time across collection and diff owners.
// Each owner keeps its status mounted for the lifetime of its own surface.
import {
  useContext,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
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
  const fallback = useRef({});
  const owner = useId();
  const shared = useMemo(() => {
    const key = page ?? fallback.current;
    let value = channels.get(key);
    if (value === undefined) {
      value = channel();
      channels.set(key, value);
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
