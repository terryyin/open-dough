// The page's operations on the sessions it shows: opening one in the page's
// one terminal or final-report panel, marking one done, and reading one
// again once its terminal attaches, each asked with one request shape. The
// page provides them (`./TerminalSplit.tsx`), and a session entry on a card,
// in Recent sessions, or in the Sessions sidebar reaches opening and marking
// without every component between them passing them along. Each session entry
// names its session, so the page can find where to bring the entry into view.
// The page also says which session its panel shows. Every Mark as done
// control follows its mark the same way (`useMarking`).

import { createContext, useContext, useState } from "react";
import type { LaunchRecord, LaunchWithState } from "./agentLaunch.ts";
import type { SessionAccess } from "./sessionAccess.ts";
import type { DeleteRecordOutcome } from "./agentLaunchClient.ts";
import { workCard } from "./workFocus.ts";

// A request about one session the page shows: its launch record, joined with
// its state where the operation needs it, and the control that asked, which
// gets the keyboard back once the page has answered.
export type SessionRequest<Record extends LaunchRecord = LaunchRecord> = {
  readonly record: Record;
  readonly control: HTMLElement;
};

// One of the page's operations on a session, answering with `Answer`.
export type SessionOperation<
  Answer,
  Record extends LaunchRecord = LaunchRecord,
> = (request: SessionRequest<Record>) => Answer;

// Shows the session in the page's one terminal or report panel.
export type OpenSessionPanel = SessionOperation<void>;

// Marks the session done, closing its terminal if the page shows it, and
// answers whether it was marked. The control that asked gets the keyboard
// back while it is on the page.
export type MarkSessionDone = SessionOperation<Promise<boolean>>;

// Deletes the session's dashboard record and answers what came of it: deleted,
// kept because its state is now known, or failed with the reason given. Once
// deleted, the keyboard goes to the entry beside the session's card entry, or
// to its card when none is left.
export type DeleteSessionRecord = SessionOperation<
  Promise<DeleteRecordOutcome>
>;

// The page's operations that session entries ask, and the session its
// panel shows, if any, from which every entry derives its current-session mark.
export type PageSessions = {
  readonly openTerminal: OpenSessionPanel;
  readonly openResult: OpenSessionPanel;
  readonly openSession: SessionOperation<void, LaunchWithState>;
  readonly shownSession:
    { readonly kind: SessionAccess; readonly key: string } | undefined;
  readonly markDone: MarkSessionDone;
  readonly deleteRecord: DeleteSessionRecord;
};

// The attribute by which a session entry names the session it shows.
const showsSessionAttribute = "data-shows-session";

export function showsSession(sessionKey: string) {
  return { [showsSessionAttribute]: sessionKey };
}

// The session of the entry beside the one a control is in, in its card's list
// or in Recent sessions: the entry after it, else the one before it.
function entryBeside(control: HTMLElement): string | undefined {
  const item = control.closest("li");
  const beside = item?.nextElementSibling ?? item?.previousElementSibling;
  return (
    beside
      ?.querySelector(`[${showsSessionAttribute}]`)
      ?.getAttribute(showsSessionAttribute) ?? undefined
  );
}

// Where the keyboard goes once the entry a control is in is deleted: the entry
// beside it while its list still shows it, else its story's card (for a card's
// entry) or Recent sessions. Read the neighbours before the delete; the
// answer is looked up afterwards.
export function deletedEntryHome(
  control: HTMLElement,
  identity: string | undefined,
): () => HTMLElement | null {
  const beside = entryBeside(control);
  const inRecent = control.closest(".recent-sessions") !== null;
  return () =>
    inRecent
      ? ((beside === undefined ? null : recentSessionsEntry(beside)) ??
        document.querySelector<HTMLElement>(".recent-sessions"))
      : (cardEntry(beside) ??
        (identity === undefined ? undefined : workCard(identity)) ??
        null);
}

function cardEntry(sessionKey: string | undefined): HTMLElement | null {
  return sessionKey === undefined
    ? null
    : document.querySelector<HTMLElement>(
        `.card-sessions [${showsSessionAttribute}="${CSS.escape(sessionKey)}"]`,
      );
}

// The session's Recent sessions entry, while the page shows it.
export function recentSessionsEntry(sessionKey: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `.recent-sessions [${showsSessionAttribute}="${CSS.escape(sessionKey)}"]`,
  );
}

export const SessionsOnPage = createContext<PageSessions | undefined>(
  undefined,
);

// The page's operations, which every session shown on the page is inside.
export function usePageSessions(): PageSessions {
  const sessions = useContext(SessionsOnPage);
  if (sessions === undefined) {
    throw new Error("A session is shown outside the page's TerminalSplit.");
  }
  return sessions;
}

// Where a control's Mark as done stands: asked, or refused. A mark that
// succeeds takes the control off the page, so nothing follows it.
export type Marking = "marking" | "not-marked";

// What a control says when the boundary refused its mark or no answer came.
export const notMarkedDone = "The session could not be marked done.";

// What an entry says when its record could not be deleted, or when the
// boundary found the session's state known and kept the record.
export const notDeleted = "The session record could not be deleted.";
export const nowKnown = "This session's state is now known";

// Follows one control's Mark as done from its asking to the answer.
export function useMarking() {
  const [marking, setMarking] = useState<Marking | undefined>();
  const follow = (asked: Promise<boolean>) => {
    setMarking("marking");
    void asked.then((marked) => {
      if (!marked) {
        setMarking("not-marked");
      }
    });
  };
  return { marking, follow };
}
