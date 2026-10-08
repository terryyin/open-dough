// The page's operations on the sessions it shows: opening one in the page's
// one terminal or final-report panel, marking one done or its report read, and
// reading one again once its terminal attaches, each asked with one request
// shape. The page provides them (`./PageFrame.tsx`), and a session entry
// on a card, in Taken or Recently done, or in the Sessions sidebar reaches opening
// and marking without every component between them passing them along. Each
// session entry names its session, so the page can find where to bring the
// entry into view (`./pageEntries.ts`).
// The page also says which session its panel shows. Every Mark as done or
// Mark as read control follows its mark the same way (`useMarking`), and
// every Mark as done decides whether to ask first the same way
// (`useDoneMark`).

import { createContext, useContext, useState } from "react";
import type { LaunchRecord, LaunchWithState } from "./agentLaunch.ts";
import { unfinishedIntention } from "./sessionShown.ts";
import type { HostOperations } from "./sessionCapabilities.ts";
import type { SessionAccess } from "./sessionAccess.ts";
import type { DeleteRecordOutcome } from "./sessionRecordRequests.ts";
import type { RecoverSessionAnswer } from "./sessionRecovery.ts";

// A request about one session the page shows: its launch record, joined with
// its state where the operation needs it, and the control that asked, which
// gets the keyboard back once the page has answered.
export type SessionRequest<Record extends LaunchRecord = LaunchRecord> = {
  readonly record: Record;
  readonly control: HTMLElement;
  // Whether an opened terminal takes the keyboard; it does unless set false,
  // as when a launch's session opens after the developer moved on.
  readonly takesKeyboard?: boolean;
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

// Marks the session's unread report read and answers whether it was marked.
// The session stays open.
export type MarkSessionRead = SessionOperation<Promise<boolean>>;

// Deletes the session's dashboard record and answers what came of it: deleted,
// kept because its state is now known, or failed with the reason given. Once
// deleted, the keyboard goes to the entry beside the deleted one, or to the
// card or column that listed it when none is left (`./pageEntries.ts`).
export type DeleteSessionRecord = SessionOperation<
  Promise<DeleteRecordOutcome>
>;

// Recovers an unfinished Cursor session the runner does not hold.
export type RecoverSession = SessionOperation<
  Promise<RecoverSessionAnswer | undefined>
>;

// The page's operations that session entries ask, and the session its
// panel shows, if any, from which every entry derives its current-session mark.
export type PageSessions = {
  readonly hostOperations: HostOperations;
  // Presents a session's terminal, as a launch does once it starts, unless
  // the developer already opened that session's terminal on this page; then
  // it changes nothing and leaves the keyboard where it is.
  readonly presentTerminal: OpenSessionPanel;
  readonly openSession: SessionOperation<void, LaunchWithState>;
  readonly shownSession:
    { readonly kind: SessionAccess; readonly key: string } | undefined;
  readonly markDone: MarkSessionDone;
  readonly markRead: MarkSessionRead;
  readonly deleteRecord: DeleteSessionRecord;
  readonly recoverSession: RecoverSession;
};

export const SessionsOnPage = createContext<PageSessions | undefined>(
  undefined,
);

// The page's operations, which every session shown on the page is inside.
export function usePageSessions(): PageSessions {
  const sessions = useContext(SessionsOnPage);
  if (sessions === undefined) {
    throw new Error("A session is shown outside the page's PageFrame.");
  }
  return sessions;
}

// Where a control's Mark as done or Mark as read stands: asked, or refused.
// A mark that succeeds leaves nothing to follow: Mark as done takes the
// control off the page.
export type Marking = "marking" | "not-marked";

// What a control says when the boundary refused its mark or no answer came.
export const notMarkedDone = "The session could not be marked done.";
export const notMarkedRead = "The report could not be marked read.";

// What an entry says when its record could not be deleted, or when the
// boundary found the session's state known and kept the record.
export const notDeleted = "The session record could not be deleted.";
export const nowKnown = "This session's state is now known";

// The answers of the question Mark as done asks first.
export const doneAnswers = { confirm: "Mark as done", keep: "Keep open" };

// Follows one control's Mark as done or Mark as read from its asking to the
// answer, which `answered`, when given, is then told.
export function useMarking() {
  const [marking, setMarking] = useState<Marking | undefined>();
  const follow = (
    asked: Promise<boolean>,
    answered?: (marked: boolean) => void,
  ) => {
    setMarking("marking");
    void asked.then((marked) => {
      setMarking(marked ? undefined : "not-marked");
      answered?.(marked);
    });
  };
  return { marking, follow };
}

// One control's Mark as done: where its mark stands, and, for a session
// whose intended work is not known to be complete, the question it asks
// first (`unfinishedIntention`), decided from the record the page shows now;
// an unread report alone does not ask. Its mark answers the control that
// asked it: a session marked done takes the control off the page; otherwise
// the keyboard returns to the control. `answered`, when given, is told too.
export function useDoneMark(record: LaunchWithState) {
  const { marking, follow } = useMarking();
  const statement = unfinishedIntention(record);
  const mark = (
    done: Promise<boolean>,
    answered?: (marked: boolean) => void,
  ) => {
    follow(done, answered);
    return done.then((marked) =>
      marked ? ("settled" as const) : ("returned" as const),
    );
  };
  return {
    asksFirst:
      statement === undefined ? undefined : `${statement} Mark it done anyway?`,
    marking,
    mark,
  };
}
