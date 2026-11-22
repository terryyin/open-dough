// One note operation speaks at a time across collection and diff owners.
// Each owner keeps its status mounted for the lifetime of its own surface.
import { useId, useSyncExternalStore } from "react";
import { useHeldOnPage, type HeldKind } from "./pageReads.tsx";
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
const announcements: HeldKind<ReturnType<typeof channel>> = {
  name: "story note announcements",
};
export function useStoryNoteAnnouncement() {
  const owner = useId();
  const shared = useHeldOnPage(announcements, "page", channel);
  const current = useSyncExternalStore(shared.subscribe, shared.snapshot);
  return [
    current.owner === owner ? current.message : "",
    (message: string) => {
      shared.say(owner, message);
    },
  ] as const;
}
