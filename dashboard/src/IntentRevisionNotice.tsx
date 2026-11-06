// Intent's reading revision against the page's observed one
// (`./IntentPerspective.tsx`): Intent reads one published revision, held with
// the project's reading place (`./pageIntentReading.tsx`) from the first time
// its Intent opens (`useIntentReadingRevision`). A newer observed revision
// only offers itself here, as a polite status beside the reading that takes
// no focus; however many arrive, one notice names the revision shown, and
// **Show latest** moves the reading to the latest observed. While its
// locations are read the shown reading stays, marked as updating; if that read
// fails or answers unreadable settings, the shown reading still stays and the
// notice names the failure beside a Retry that applies the update again. The
// shown revision is kept in the reading place beside the reading revision
// (`./useIntentLocations.ts`), so Development → Intent restores it. Applying
// or retrying moves focus from the notice, whose button then goes, into the
// reading: the selected tree item, else the reading pane or the chosen mode's
// panel. A path selected at the shown revision that the new one lacks is
// explained in Purpose (`IntentPathNotInRevision`) with nothing else selected
// in its place.

import { useEffect, useRef, useState } from "react";
import { useKeptReading } from "./pageIntentReading.tsx";
import { shortRevision } from "./publishedWork.ts";
import type { FailedLocationsUpdate } from "./useIntentLocations.ts";
import "./intent-revision-notice.css";

// Intent's reading revision: the observed one when the project's Intent first
// opens, kept with its reading place. `showLatest` moves the reading to the
// observed revision, and is absent while the reading is at it.
export function useIntentReadingRevision(observed: string | undefined) {
  const [kept, setKept] = useKeptReading<string | undefined>(
    "revision",
    () => observed,
  );
  useEffect(() => {
    if (kept === undefined && observed !== undefined) setKept(observed);
  }, [kept, observed, setKept]);
  const reading = kept ?? observed;
  return {
    reading,
    showLatest:
      observed === undefined || observed === reading
        ? undefined
        : () => {
            setKept(observed);
          },
  };
}

// Where the developer's reading takes focus within the Intent perspective
// holding `notice`.
function focusReading(notice: HTMLElement | null) {
  const intent = notice?.closest("main");
  if (intent === null || intent === undefined) return;
  const browser = intent.querySelector(".intent-browser:not([hidden])");
  const target =
    browser === null
      ? intent.querySelector('[role="tabpanel"][tabindex]:not([hidden])')
      : (browser.querySelector('.intent-locations [aria-pressed="true"]') ??
        browser.querySelector(".intent-reading"));
  if (target instanceof HTMLElement) target.focus({ preventScroll: true });
}

const focusLost = () =>
  document.activeElement === null || document.activeElement === document.body;

export function IntentRevisionNotice({
  shown,
  observed,
  updating,
  failedUpdate,
  onShowLatest,
  onRetry,
}: {
  // The revision whose reading is shown, and the page's observed revision.
  readonly shown: string | undefined;
  readonly observed: string | undefined;
  // Whether the reading is moving to another revision.
  readonly updating: boolean;
  // The failed read of the revision the reading is moving to, and its Retry.
  readonly failedUpdate: FailedLocationsUpdate | undefined;
  // Moves the reading to the observed revision.
  readonly onShowLatest: (() => void) | undefined;
  readonly onRetry: () => void;
}) {
  const newer =
    shown !== undefined && observed !== undefined && shown !== observed;
  const notice = useRef<HTMLDivElement>(null);
  // Whether the developer applied the newer revision and it is still read.
  const [applying, setApplying] = useState(false);
  useEffect(() => {
    if (!applying || updating) return;
    setApplying(false);
    // A selected item the new revision lacks went with its focus.
    if (focusLost()) focusReading(notice.current);
  }, [applying, updating]);
  // Applies `move`, then moves focus into the reading.
  const apply = (move: () => void) => {
    move();
    setApplying(true);
    focusReading(notice.current);
  };
  return (
    <div
      ref={notice}
      className="intent-revision-notice"
      role="status"
      aria-live="polite"
    >
      {newer && (
        <>
          New revision available — showing <code>{shortRevision(shown)}</code>
          {updating ? (
            <span className="intent-revision-updating">Updating…</span>
          ) : null}
          {failedUpdate !== undefined && (
            <>
              <span>
                Revision <code>{shortRevision(failedUpdate.revision)}</code>{" "}
                could not be read
                {failedUpdate.failed === undefined
                  ? "."
                  : `: ${failedUpdate.failed.message}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  apply(onRetry);
                }}
              >
                Retry
              </button>
            </>
          )}
          {onShowLatest !== undefined && (
            <button
              type="button"
              onClick={() => {
                apply(onShowLatest);
              }}
            >
              Show latest
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Purpose of a selected path the shown revision does not hold.
export function IntentPathNotInRevision({
  path,
  revision,
}: {
  readonly path: string;
  readonly revision: string;
}) {
  return (
    <section className="intent-purpose" aria-label="Purpose">
      <h3 className="visually-hidden">Purpose</h3>
      <p className="intent-path-missing">
        <code>{path}</code> is not in revision{" "}
        <code>{shortRevision(revision)}</code>
      </p>
    </section>
  );
}
