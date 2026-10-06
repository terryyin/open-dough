// Reveal the chosen session's story card or Recently done entry once its
// project's stories are shown, keeping it visible until the developer moves.
import { useLayoutEffect, useRef, useState } from "react";
import { launchSubject, type LaunchRecord } from "./agentLaunch.ts";
import { sessionKey } from "./sessionReference.ts";
import { recentlyDoneEntry } from "./pageSessions.ts";
import { keepInView, workCard } from "./workFocus.ts";

export function useSessionNavigation(
  selected: string,
  shownSource: string | undefined,
) {
  // Going to a session: its project's stories, its terminal where it opens
  // one, and, once that project's stories are shown, its card brought into
  // view, or its Recently done entry when no card lists it, inside its done
  // story's card when Recently done shows the story done.
  // Each going is its own, so going again to the same session reveals again.
  const [going, setGoing] = useState<{ readonly to: LaunchRecord }>();
  const revealed = useRef<{ readonly to: LaunchRecord } | undefined>(undefined);
  useLayoutEffect(() => {
    if (going === undefined || revealed.current === going) {
      return;
    }
    // A going still waiting for its project's stories is dropped once the
    // developer chooses another project's; its terminal stays.
    if (selected !== going.to.request.source) {
      setGoing(undefined);
      return;
    }
    if (shownSource !== going.to.request.source) {
      return;
    }
    revealed.current = going;
    const { identity } = launchSubject(going.to.request);
    const shown =
      (identity === undefined ? undefined : workCard(identity)) ??
      recentlyDoneEntry(sessionKey(going.to.session));
    // Kept in view until the developer moves, goes elsewhere, or another
    // project's stories are shown.
    return shown === null ? undefined : keepInView(shown);
  }, [going, selected, shownSource]);
  return (record: LaunchRecord) => {
    setGoing({ to: record });
  };
}
